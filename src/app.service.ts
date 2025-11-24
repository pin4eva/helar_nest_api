import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Pool, PoolClient } from 'pg';
import { environments } from './utils/environments';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly sourcePool = new Pool({
    connectionString: environments.OLD_DATABASE_URL,
  });

  private readonly targetPool = new Pool({
    connectionString: environments.DATABASE_URL,
  });

  getHello(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NestJS on Vercel</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(135deg, #000 0%, #111 100%);
          color: #fff;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          text-align: center;
          max-width: 600px;
          padding: 2rem;
        }
        .logo {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          margin: 0 auto 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.5rem;
        }
        h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
        }
        p {
          font-size: 1.125rem;
          color: #888;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
        }
        .feature {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          backdrop-filter: blur(10px);
        }
        .feature h3 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .feature a {
          font-size: 1rem;
          color: white;
          margin: 0;
          text-decoration: none;
        }
        .feature a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="https://api-frameworks.vercel.sh/framework-logos/nestjs.svg" alt="Nitro logo" class="logo" />
        <h1>Welcome to NestJS</h1>
        <p>A progressive Node.js framework running on Vercel</p>
        <div class="features">
          <div class="feature">
            <a href="https://vercel.com/docs/frameworks/nestjs" target="_blank" rel="noreferrer">Vercel docs</a>
          </div>
          <div class="feature">
            <a href="https://docs.nestjs.com" target="_blank" rel="noreferrer">NestJS docs</a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  async migratePostgresData() {
    if (!environments.OLD_DATABASE_URL || !environments.DATABASE_URL) {
      throw new InternalServerErrorException(
        'Both OLD_DATABASE_URL and DATABASE_URL must be configured.',
      );
    }

    const startedAt = Date.now();
    const sourceClient = await this.sourcePool.connect();
    const targetClient = await this.targetPool.connect();
    const tableSummaries: Array<{ table: string; rows: number }> = [];
    let replicationRoleChanged = false;
    let transactionStarted = false;

    try {
      const tables = await this.fetchPublicTables(sourceClient);
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

  private async fetchPublicTables(client: PoolClient): Promise<string[]> {
    const skipTables = new Set<string>(['_report_visits']);
    const result = await client.query<{ tablename: string }>(
      `SELECT tablename
       FROM pg_tables
       WHERE schemaname = 'public'
       ORDER BY tablename ASC;`,
    );

    return result.rows
      .map((row) => row.tablename)
      .filter(
        (table) =>
          !table.startsWith('pg_') &&
          !table.startsWith('sql_') &&
          !skipTables.has(table),
      );
  }

  private async copyTable(
    tableName: string,
    columnMeta: TableColumnMeta[],
    sourceClient: PoolClient,
    targetClient: PoolClient,
  ): Promise<number> {
    const sourceData = await sourceClient.query(`SELECT * FROM "${tableName}"`);

    if (sourceData.rowCount === 0) {
      return 0;
    }

    for (const row of sourceData.rows) {
      const columns: string[] = [];
      const values: any[] = [];
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
}

type TableColumnMeta = {
  name: string;
  isNullable: boolean;
  hasDefault: boolean;
};
