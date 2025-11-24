import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '../../generated/client';
import { PrismaService } from '../../prisma/prisma.service';
import { slugify } from '../../utils/helpers';
import { buildTsQuery } from '../../utils/search';
import {
  CreateReportDTO,
  GetReportsFilter,
  ReportSession,
  UpdateReportDTO,
} from '../dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // create report
  async createReport(input: CreateReportDTO, user: User) {
    try {
      const title = input?.title?.toLowerCase().trim().replace(/\s+$/, '');
      const existingReport = await this.prisma.report.findFirst({
        where: { title },
      });

      if (existingReport) {
        throw new Error('Report with this title already exists');
      }

      const lastReport = await this.prisma.report.findMany({
        orderBy: {
          reportId: 'desc',
        },
        take: 1,
        select: {
          reportId: true,
        },
      });

      const slug = slugify(input.title);

      const lastReportId = lastReport?.[0]?.reportId || 5000;

      const createdDate = new Date(input.date);
      const { court } = input;
      const report = await this.prisma.report.create({
        data: {
          court: court as string,
          title,
          slug,
          vol: 1,
          reportId: lastReportId + 1,
          date: createdDate,
          added_by_id: user.id,
          updated_by_id: user.id,
          body: input.body,
          issues: input.issues,
          ratios: input.ratios,
          suitNo: input.suitNo,
          summary: input.summary,
        },
      });

      return report;
    } catch (error) {
      throw error;
    }
  }

  // update report
  async updateReport(input: UpdateReportDTO, user: User) {
    try {
      const { id, ...data } = input;
      const report = await this.prisma.report.update({
        where: { id },
        data: {
          ...data,
          updated_by_id: user.id,
          court: data?.court as string,
        },
      });

      return report;
    } catch (error) {
      throw error;
    }
  }

  // delete report
  async deleteReport(id: string) {
    try {
      const report = await this.prisma.report.delete({
        where: { id },
      });
      return report;
    } catch (error) {
      throw error;
    }
  }

  // get reports
  async getReports(filter?: GetReportsFilter) {
    try {
      const { search, limit = 20 } = filter || { search: '', limit: 20 };
      const normalizedSearch = search?.trim();
      let where: Prisma.ReportWhereInput = {};
      let orderBy:
        | Prisma.ReportOrderByWithRelationInput
        | Prisma.ReportOrderByWithRelationInput[]
        | undefined = {
        reportId: 'desc',
      };

      if (normalizedSearch) {
        const tsQuery = buildTsQuery(normalizedSearch);
        if (tsQuery) {
          const searchFilter: Prisma.StringFilter = {
            search: tsQuery,
            mode: 'insensitive',
          };
          where = {
            OR: [
              { title: searchFilter },
              { body: searchFilter },
              { issues: searchFilter },
              { ratios: searchFilter },
            ],
          };
          orderBy = {
            _relevance: {
              fields: ['title', 'issues', 'body'],
              search: tsQuery,
              sort: 'desc',
            },
          };
        } else {
          const containsFilter: Prisma.StringFilter = {
            contains: normalizedSearch,
            mode: 'insensitive',
          };
          where = {
            OR: [
              { title: containsFilter },
              { body: containsFilter },
              { issues: containsFilter },
            ],
          };
        }
      }

      const reports = await this.prisma.report.findMany({
        where,
        take: Number(limit),
        omit: {
          ratios: true,
          body: true,
        },
        orderBy,
      });
      return reports;
    } catch (error) {
      throw error;
    }
  }

  // get report by id
  async getReportById(id: string) {
    try {
      const report = await this.prisma.report.findUnique({
        where: { id },
      });
      if (!report)
        throw new NotFoundException(`Report with id ${id} not found`);

      return report;
    } catch (error) {
      throw error;
    }
  }

  // get report by reportId
  async getReportByReportId(reportId: number) {
    try {
      const report = await this.prisma.report.findFirst({
        where: { reportId },
      });
      if (!report)
        throw new NotFoundException(
          `Report with reportId ${reportId} not found`,
        );

      return report;
    } catch (error) {
      throw error;
    }
  }

  // get top viewed reports
  async getTopViewedReports(limit: number = 5) {
    try {
      const reports = await this.prisma.report.findMany({
        orderBy: {
          views: 'desc',
        },
        take: limit,
        omit: {
          ratios: true,
          body: true,
        },
      });
      return reports;
    } catch (error) {
      throw error;
    }
  }

  // mark report as viewed
  async markReportAsViewed(reportId: string, sessionId?: string) {
    if (!sessionId) {
      return;
    }

    try {
      // check cache if session has viewed report
      const cacheKey = `report:${reportId}:session:${sessionId}`;
      const cachedVisit = await this.cacheManager.get<ReportSession>(cacheKey);
      if (cachedVisit) {
        return;
      }

      const existingVisit = await this.prisma.reportVisits.findUnique({
        where: {
          reportId_sessionId: {
            reportId,
            sessionId,
          },
        },
      });

      if (existingVisit) {
        return;
      }
      await this.prisma.reportVisits.upsert({
        where: {
          reportId_sessionId: {
            reportId,
            sessionId: sessionId,
          },
        },
        create: {
          reportId,
          sessionId: sessionId,
        },
        update: {
          reportId,
          sessionId: sessionId,
        },
      });
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async likeReport(reportId: string, user: User) {
    try {
      const existingLike = await this.prisma.reportLike.findFirst({
        where: {
          reportId,
          userId: user.id,
        },
      });
      if (existingLike) {
        // delete like ie unlike
        await this.prisma.reportLike.delete({
          where: {
            reportId_userId: {
              reportId,
              userId: user.id,
            },
          },
        });
        return {
          message: 'Report unliked successfully',
          success: true,
        };
      }
      const like = await this.prisma.reportLike.create({
        data: {
          reportId,
          userId: user.id,
        },
      });
      return {
        message: 'Report liked successfully',
        success: true,
        data: like,
      };
    } catch (error) {
      throw error;
    }
  }

  // like report

  // unlike report
}
