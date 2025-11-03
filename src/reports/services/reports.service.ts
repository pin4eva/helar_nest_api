import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '../../generated/client';
import { PrismaService } from '../../prisma.service';
import { slugify } from '../../utils/helpers';
import {
  CreateReportBookmarkDTO,
  CreateReportDTO,
  GetReportsFilter,
  UpdateReportDTO,
} from '../dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

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
      const { search, limit = 20 } = filter || {};
      let where: Prisma.ReportWhereInput = {};
      if (search) {
        where = {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              body: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              issues: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        };
      }
      const reports = await this.prisma.report.findMany({
        where,
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

  // bookmark report
  async bookmarkReport(input: CreateReportBookmarkDTO, user: User) {
    try {
      const { reportId } = input;
      const bookmark = await this.prisma.bookmark.create({
        data: {
          userId: user.id,
          reportId,
        },
      });
      return bookmark;
    } catch (error) {
      throw error;
    }
  }

  // remove bookmark
  async removeBookmark(input: CreateReportBookmarkDTO, user: User) {
    try {
      const { reportId } = input;
      const bookmark = await this.prisma.bookmark.delete({
        where: {
          userId_reportId: {
            userId: user.id,
            reportId,
          },
        },
      });
      return bookmark;
    } catch (error) {
      throw error;
    }
  }

  async getBookmarks(user: User) {
    try {
      const bookmarks = await this.prisma.bookmark.findMany({
        where: { userId: user.id },
        include: {
          report: true,
        },
      });
      return bookmarks.map((b) => b.report);
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
          where: { id: existingLike.id },
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
        reportLike: like,
      };
    } catch (error) {
      throw error;
    }
  }

  // like report

  // unlike report
}
