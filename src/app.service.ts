import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { Prisma } from 'src/generated/client';
import { createHash, randomUUID } from 'node:crypto';
import { Pool, PoolClient } from 'pg';
import { environments } from './utils/environments';
import { SummaryTypeEnum, TopicTypeEnum } from 'src/generated/enums';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService implements OnModuleDestroy {
  private readonly logger = new Logger(AppService.name);
  private readonly sourcePool: Pool;
  private readonly targetPool: Pool;
  private readonly schemaTables: string[] = [
    'auths',
    'users',
    'subscriptions',
    'reports',
    '_report_to_subject',
    'report_comments',
    'report_comment_likes',
    'report_likes',
    '_report_tags',
    '_report_visits',
    'bookmarks',
    'quotes',
    'subjects',
    'handbook_topics',
    'handbook_cases',
    'summary_topics',
    'summary_cases',
    'schools',
  ];
  private readonly manuallyManagedTables = new Set<string>([
    'handbook_topic',
    'handbook_topics',
    'handbook_case',
    'handbook_cases',
    'subject',
    'subjects',
    'summary_topic',
    'summary_topics',
    'summary_case',
    'summary_cases',
  ]);

  constructor(private readonly prisma: PrismaService) {
    const oldDbUrl = environments.OLD_DATABASE_URL;
    const targetDbUrl = environments.database?.DATABASE_URL;

    if (!oldDbUrl || !targetDbUrl) {
      throw new InternalServerErrorException(
        'Both OLD_DATABASE_URL and DATABASE_URL must be configured.',
      );
    }

    this.sourcePool = new Pool({ connectionString: oldDbUrl });
    this.targetPool = new Pool({ connectionString: targetDbUrl });
  }

  async onModuleDestroy() {
    await Promise.allSettled([
      this.prisma.$disconnect(),
      this.sourcePool.end(),
      this.targetPool.end(),
    ]);
  }

  getHello(): string {
    return `Hello World!
    `;
  }

  async migratePostgresData() {
    const startedAt = Date.now();
    const sourceClient = await this.sourcePool.connect();
    const targetClient = await this.targetPool.connect();
    const tableSummaries: Array<{ table: string; rows: number }> = [];
    let replicationRoleChanged = false;
    let transactionStarted = false;

    try {
      const tables = await this.fetchPublicTables();
      await targetClient.query('BEGIN');
      transactionStarted = true;
      await targetClient.query('SET session_replication_role = replica;');
      replicationRoleChanged = true;

      for (const table of tables) {
        await targetClient.query(`TRUNCATE TABLE "${table}" CASCADE;`);
      }

      for (const table of tables) {
        const columnMeta = await this.getTableColumns(table, targetClient);
        const copiedRows = await this.copyTable(
          table,
          columnMeta,
          sourceClient,
          targetClient,
        );
        tableSummaries.push({ table, rows: copiedRows });
      }

      await targetClient.query('COMMIT');
      transactionStarted = false;
      if (replicationRoleChanged) {
        await targetClient.query('SET session_replication_role = DEFAULT;');
        replicationRoleChanged = false;
      }

      if (!this.shouldSkipDerivedMigrations()) {
        const derivedCounts = await this.prisma.$transaction(
          async (tx) => {
            const summaryTopicsCount = await this.migrateSummaryTopics(tx);
            const handbookTopicsCount = await this.migrateHandbookTopics(tx);
            const handbookCasesCount = await this.migrateHandbookCases(tx);

            return {
              summaryTopicsCount,
              handbookTopicsCount,
              handbookCasesCount,
            };
          },
          { timeout: 60_000 },
        );

        tableSummaries.push(
          { table: 'summary_topics', rows: derivedCounts.summaryTopicsCount },
          { table: 'handbook_topics', rows: derivedCounts.handbookTopicsCount },
          { table: 'handbook_cases', rows: derivedCounts.handbookCasesCount },
        );
      } else {
        this.logger.log(
          'Skipping summary/handbook derived migrations because these tables are manually managed.',
        );
      }

      return {
        message: 'Migration completed successfully',
        tables: tableSummaries,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      this.logger.error('Migration failed', error as Error);
      if (transactionStarted) {
        await targetClient.query('ROLLBACK');
      }
      throw new InternalServerErrorException(
        'Migration failed. See logs for details.',
      );
    } finally {
      if (replicationRoleChanged) {
        await targetClient.query('SET session_replication_role = DEFAULT;');
      }
      sourceClient.release();
      targetClient.release();
    }
  }

  private async fetchPublicTables(): Promise<string[]> {
    return this.schemaTables.filter(
      (table) => !this.manuallyManagedTables.has(table),
    );
  }

  private async copyTable(
    tableName: string,
    columnMeta: TableColumnMeta[],
    sourceClient: PoolClient,
    targetClient: PoolClient,
  ): Promise<number> {
    const sourceData = await sourceClient.query<Record<string, unknown>>(
      `SELECT * FROM "${tableName}"`,
    );

    if (sourceData.rowCount === 0) {
      return 0;
    }

    for (const row of sourceData.rows) {
      const columns: string[] = [];
      const values: unknown[] = [];
      const placeholders: string[] = [];
      let paramIndex = 1;

      for (const meta of columnMeta) {
        let value = row[meta.name];

        if ((value === null || value === undefined) && !meta.isNullable) {
          if (meta.hasDefault) {
            continue;
          }

          if (meta.name === 'id') {
            value = randomUUID();
          } else {
            throw new InternalServerErrorException(
              `Table ${tableName} column ${meta.name} is NOT NULL but source value is null.`,
            );
          }
        }

        columns.push(`"${meta.name}"`);
        placeholders.push(`$${paramIndex}`);
        values.push(value ?? null);
        paramIndex++;
      }

      if (!columns.length) {
        continue;
      }

      await targetClient.query(
        `INSERT INTO "${tableName}" (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
        values,
      );
    }

    return sourceData.rowCount ?? 0;
  }

  private async getTableColumns(
    tableName: string,
    client: PoolClient,
  ): Promise<TableColumnMeta[]> {
    const result = await client.query<{
      column_name: string;
      is_nullable: 'YES' | 'NO';
      column_default: string | null;
    }>(
      `SELECT column_name, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
       ORDER BY ordinal_position ASC;`,
      [tableName],
    );

    return result.rows.map((row) => ({
      name: row.column_name,
      isNullable: row.is_nullable === 'YES',
      hasDefault: !!row.column_default,
    }));
  }

  private async migrateSummaryTopics(tx: PrismaTransaction): Promise<number> {
    const [facultyNotes, nlsNotes, existingSummaryTopics] = await Promise.all([
      this.sourcePool.query<LegacyRow>(`SELECT * FROM faculty_note_summaries`),
      this.sourcePool.query<LegacyRow>(`SELECT * FROM nls_note_summaries`),
      tx.summaryTopic.findMany({ select: { slug: true } }),
    ]);

    const summarySlugTracker = new Set(
      existingSummaryTopics.map((topic) => topic.slug),
    );

    const facultyCount = await this.upsertSummaryTopics(
      tx,
      facultyNotes.rows,
      SummaryTypeEnum.Faculty_Summary,
      summarySlugTracker,
    );
    const nlsCount = await this.upsertSummaryTopics(
      tx,
      nlsNotes.rows,
      SummaryTypeEnum.NLS_Summary,
      summarySlugTracker,
    );

    return facultyCount + nlsCount;
  }

  private async upsertSummaryTopics(
    tx: PrismaTransaction,
    rows: LegacyRow[],
    type: SummaryTypeEnum,
    slugTracker: Set<string>,
  ): Promise<number> {
    let processed = 0;

    for (const row of rows) {
      const title = this.getString(row, 'title', 'topic');
      const subjectId = this.getString(row, 'subjectId', 'subjectid');

      if (!title || !subjectId) {
        this.logger.warn(
          `Skipping ${type} topic ${row.id ?? row.slug ?? 'unknown'} due to missing title or subjectId`,
        );
        continue;
      }

      const baseSlug = this.resolveSlug(this.getString(row, 'slug'), title);
      const slug = this.ensureUniqueSlug(baseSlug, slugTracker, type);
      const id = this.getString(row, 'id') ?? randomUUID();
      const normalizedType = this.normalizeSummaryType(type);

      await tx.summaryTopic.upsert({
        where: { id },
        update: { title, slug, subjectId, type: normalizedType },
        create: { id, title, slug, subjectId, type: normalizedType },
      });

      processed += 1;
    }

    return processed;
  }

  private async migrateHandbookTopics(tx: PrismaTransaction): Promise<number> {
    const [handbooks, textbooks, existingHandbookTopics] = await Promise.all([
      this.sourcePool.query<LegacyRow>(`SELECT * FROM handbooks`),
      this.sourcePool.query<LegacyRow>(`SELECT * FROM textbooks`),
      tx.handbookTopic.findMany({ select: { slug: true, title: true } }),
    ]);

    const handbookSlugTracker = new Set(
      existingHandbookTopics.map((topic) => topic.slug),
    );
    const handbookTitleTracker = new Set(
      existingHandbookTopics.map((topic) => topic.title),
    );

    const handbookCount = await this.upsertHandbookTopics(
      tx,
      handbooks.rows,
      TopicTypeEnum.Handbook,
      handbookSlugTracker,
      handbookTitleTracker,
    );
    const textbookCount = await this.upsertHandbookTopics(
      tx,
      textbooks.rows,
      TopicTypeEnum.Textbook,
      handbookSlugTracker,
      handbookTitleTracker,
    );

    return handbookCount + textbookCount;
  }

  private async upsertHandbookTopics(
    tx: PrismaTransaction,
    rows: LegacyRow[],
    type: TopicTypeEnum,
    slugTracker: Set<string>,
    titleTracker: Set<string>,
  ): Promise<number> {
    let processed = 0;

    for (const row of rows) {
      const title = this.getString(row, 'topic', 'title');
      const subjectId = this.getString(row, 'subjectId', 'subjectid');

      if (!title || !subjectId) {
        this.logger.warn(
          `Skipping handbook topic ${row.id ?? row.slug ?? 'unknown'} due to missing title or subjectId`,
        );
        continue;
      }

      const uniqueTitle = this.ensureUniqueTitle(title, titleTracker);
      const baseSlug = this.resolveSlug(
        this.getString(row, 'slug'),
        uniqueTitle,
      );
      const slug = this.ensureUniqueSlug(baseSlug, slugTracker, type);
      const id = this.getString(row, 'id') ?? randomUUID();

      await tx.handbookTopic.upsert({
        where: { id },
        update: { title: uniqueTitle, slug, subjectId, type },
        create: { id, title: uniqueTitle, slug, subjectId, type },
      });

      processed += 1;
    }

    return processed;
  }

  private async migrateHandbookCases(tx: PrismaTransaction): Promise<number> {
    const [handbookCases, textbookCases, existingCases] = await Promise.all([
      this.sourcePool.query<LegacyRow>(`SELECT * FROM handbook_cases`),
      this.sourcePool.query<LegacyRow>(`SELECT * FROM textbook_cases`),
      tx.handbookCase.findMany({ select: { slug: true, ref: true } }),
    ]);

    const caseSlugTracker = new Set(existingCases.map((item) => item.slug));
    const caseRefTracker = new Set(existingCases.map((item) => item.ref));

    const handbookCount = await this.upsertHandbookCases(
      tx,
      handbookCases.rows,
      (row) => this.getString(row, 'topicId', 'handbookId'),
      caseSlugTracker,
      caseRefTracker,
    );
    const textbookCount = await this.upsertHandbookCases(
      tx,
      textbookCases.rows,
      (row) => this.getString(row, 'topicId', 'textbookId'),
      caseSlugTracker,
      caseRefTracker,
    );

    return handbookCount + textbookCount;
  }

  private async upsertHandbookCases(
    tx: PrismaTransaction,
    rows: LegacyRow[],
    topicResolver: (row: LegacyRow) => string | undefined,
    slugTracker: Set<string>,
    refTracker: Set<number>,
  ): Promise<number> {
    let processed = 0;

    for (const row of rows) {
      const topicId = topicResolver(row);
      if (!topicId) {
        this.logger.warn(
          `Skipping handbook case ${row.id ?? row.slug ?? 'unknown'} due to missing topicId`,
        );
        continue;
      }

      const title = this.getString(row, 'title', 'topic');
      if (!title) {
        this.logger.warn(
          `Skipping handbook case ${row.id ?? row.slug ?? 'unknown'} due to missing title`,
        );
        continue;
      }

      const ref = this.getNumber(row, 'ref');
      if (typeof ref !== 'number') {
        this.logger.warn(
          `Skipping handbook case ${row.id ?? row.slug ?? 'unknown'} due to invalid ref`,
        );
        continue;
      }

      const baseSlug = this.resolveSlug(this.getString(row, 'slug'), title);
      const slug = this.ensureUniqueSlug(baseSlug, slugTracker, topicId);
      const id = this.getString(row, 'id') ?? randomUUID();
      const body = this.getString(row, 'body');
      const byline = this.getString(row, 'byline');
      const citation = this.getString(row, 'citation');

      if (!body || !byline || !citation) {
        this.logger.warn(
          `Skipping handbook case ${row.id ?? row.slug ?? 'unknown'} due to missing body/byline/citation`,
        );
        continue;
      }

      const uniqueRef = this.ensureUniqueRef(ref, refTracker);

      await tx.handbookCase.upsert({
        where: { id },
        update: {
          body,
          byline,
          citation,
          ref: uniqueRef,
          slug,
          title,
          topicId,
        },
        create: {
          id,
          body,
          byline,
          citation,
          ref: uniqueRef,
          slug,
          title,
          topicId,
        },
      });

      processed += 1;
    }

    return processed;
  }

  private getString(row: LegacyRow, ...keys: string[]): string | undefined {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
          return trimmed;
        }
      }
    }
    return undefined;
  }

  private getNumber(row: LegacyRow, ...keys: string[]): number | undefined {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return undefined;
  }

  private resolveSlug(slug?: string | null, fallback?: string | null): string {
    const normalizedSlug = slug?.trim();
    if (normalizedSlug) {
      return normalizedSlug;
    }

    const normalizedFallback = fallback?.trim();
    if (normalizedFallback) {
      return createHash('md5').update(normalizedFallback).digest('hex');
    }

    return randomUUID();
  }

  private ensureUniqueSlug(
    baseSlug: string,
    tracker: Set<string>,
    suffixHint?: string,
  ): string {
    if (!tracker.has(baseSlug)) {
      tracker.add(baseSlug);
      return baseSlug;
    }

    const normalizedHint = suffixHint
      ?.toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

    let counter = 1;
    let candidate = `${baseSlug}-${normalizedHint ?? 'dedupe'}`;

    while (tracker.has(candidate)) {
      counter += 1;
      candidate = `${baseSlug}-${normalizedHint ?? 'dedupe'}-${counter}`;
    }

    tracker.add(candidate);
    return candidate;
  }

  private ensureUniqueTitle(baseTitle: string, tracker: Set<string>): string {
    let candidateTitle = baseTitle;
    let copyCounter = 0;

    while (tracker.has(candidateTitle)) {
      copyCounter += 1;
      candidateTitle =
        copyCounter === 1
          ? `${baseTitle}-copy`
          : `${baseTitle}-copy-${copyCounter}`;
    }

    tracker.add(candidateTitle);
    return candidateTitle;
  }

  private ensureUniqueRef(baseRef: number, tracker: Set<number>): number {
    if (!tracker.has(baseRef)) {
      tracker.add(baseRef);
      return baseRef;
    }

    let candidateRef = baseRef;
    while (tracker.has(candidateRef)) {
      candidateRef += 1;
    }

    tracker.add(candidateRef);
    this.logger.warn(
      `Adjusted duplicate handbook case ref ${baseRef} to ${candidateRef}`,
    );
    return candidateRef;
  }

  private normalizeSummaryType(type: SummaryTypeEnum): SummaryTypeEnum {
    if (type === SummaryTypeEnum.Faculty_Summary) {
      return 'Faculty_Summary' as unknown as SummaryTypeEnum;
    }

    if (type === SummaryTypeEnum.NLS_Summary) {
      return 'NLS_Summary' as unknown as SummaryTypeEnum;
    }

    return type;
  }

  private shouldSkipDerivedMigrations(): boolean {
    const derivedTables = [
      'summary_topics',
      'handbook_topics',
      'handbook_cases',
    ];
    return derivedTables.every((table) =>
      this.manuallyManagedTables.has(table),
    );
  }
}

type TableColumnMeta = {
  name: string;
  isNullable: boolean;
  hasDefault: boolean;
};

type PrismaTransaction = Prisma.TransactionClient;

type LegacyRow = Record<string, string | number | null | undefined>;
