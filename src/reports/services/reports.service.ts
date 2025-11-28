import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '../../generated/client';
import { PrismaService } from '../../prisma/prisma.service';
import { slugify } from '../../utils/helpers';
import {
  normalizeSearchQuery,
  generateSimpleExcerpt,
  stripHtmlAndMarkdown,
  removeStopWords,
} from '../../utils/search';
import {
  CourtEnum,
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
        throw new BadRequestException('Report with this title already exists');
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

      let slug = slugify(input.title);

      const lastReportId = lastReport?.[0]?.reportId || 5000;

      const createdDate = new Date(input.date);
      const { court } = input;
      const reportId = lastReportId + 1;
      slug += `-${reportId}`;
      const report = await this.prisma.report.create({
        data: {
          court: court as string,
          title,
          slug,
          vol: 1,
          reportId,
          date: createdDate,
          added_by_id: user.id,
          updated_by_id: user.id,
          body: input.body,
          issues: '',
          ratios: '',
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
      const { id, date, ...data } = input;
      const existingReport = await this.prisma.report.findUnique({
        where: { id },
      });
      if (!existingReport) {
        throw new NotFoundException(`Report with id ${id} not found`);
      }
      let slug = existingReport.slug;

      if (data?.title && existingReport.title !== data.title) {
        slug = slugify(data.title) + `-${existingReport.reportId}`;
      }
      const report = await this.prisma.report.update({
        where: { id },
        data: {
          ...data,
          updated_by_id: user.id,
          court: data?.court as string,
          slug,
          date: date ? new Date(date) : existingReport.date,
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

  // Get all reports without limits
  async getAllReports() {
    try {
      const reports = await this.prisma.report.findMany({
        select: {
          id: true,
          reportId: true,
          slug: true,
          title: true,
          court: true,
          date: true,
          isPublished: true,
          _count: {
            select: {
              likes: true,
              visits: true,
              comments: true,
              bookmarks: true,
            },
          },
        },
      });
      return reports;
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
        const searchQuery = normalizeSearchQuery(normalizedSearch);
        if (searchQuery) {
          // Use plainto_tsquery which automatically handles stop words and stemming
          const query = `
            SELECT
              r.*,
              ts_rank(
                setweight(to_tsvector('english', COALESCE(r.title, '')), 'A') ||
                setweight(to_tsvector('english', COALESCE(r.body, '')), 'B'),
                plainto_tsquery('english', $1)
              ) as relevance_score
            FROM reports r
            WHERE (
              to_tsvector('english', r.title) @@ plainto_tsquery('english', $1) OR
              to_tsvector('english', r.body) @@ plainto_tsquery('english', $1)
            )
            ORDER BY relevance_score DESC, r."reportId" DESC
            LIMIT $2
          `;

          const results: any[] = await this.prisma.$queryRawUnsafe(
            query,
            searchQuery,
            Number(limit),
          );

          // Process results: strip markdown/HTML first, then apply highlighting
          return results.map((report) => {
            // Filter out stop words from search terms for highlighting
            const filteredSearchQuery = removeStopWords(searchQuery);

            // Helper function to generate excerpt with highlighting
            const generateExcerpt = (
              text: string,
              searchTerms: string,
              maxWords: number = 50,
            ): string => {
              if (!text) return '';

              // Strip HTML/markdown first
              const cleanText = stripHtmlAndMarkdown(text);

              // Create regex from search terms (now just space-separated words)
              const terms = searchTerms.split(/\s+/).filter(Boolean);

              // Find first occurrence of any search term
              let firstIndex = -1;
              let foundTerm = '';
              for (const term of terms) {
                const idx = cleanText.toLowerCase().indexOf(term.toLowerCase());
                if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
                  firstIndex = idx;
                  foundTerm = term;
                }
              }

              if (firstIndex === -1) {
                // No match found, return beginning
                const words = cleanText.split(/\s+/).slice(0, maxWords);
                return (
                  words.join(' ') +
                  (cleanText.split(/\s+/).length > maxWords ? '...' : '')
                );
              }

              // Calculate word boundaries around the match
              const words = cleanText.split(/\s+/);
              let currentPos = 0;
              let matchWordIdx = 0;

              for (let i = 0; i < words.length; i++) {
                const wordEnd = currentPos + words[i].length;
                if (currentPos <= firstIndex && firstIndex <= wordEnd) {
                  matchWordIdx = i;
                  break;
                }
                currentPos = wordEnd + 1;
              }

              const startIdx = Math.max(
                0,
                matchWordIdx - Math.floor(maxWords / 2),
              );
              const endIdx = Math.min(
                words.length,
                matchWordIdx + Math.floor(maxWords / 2),
              );

              let excerpt = words.slice(startIdx, endIdx).join(' ');
              const prefix = startIdx > 0 ? '...' : '';
              const suffix = endIdx < words.length ? '...' : '';

              // Highlight all matching terms (case-insensitive)
              terms.forEach((term) => {
                const regex = new RegExp(`(${term})`, 'gi');
                excerpt = excerpt.replace(regex, '<mark>$1</mark>');
              });

              return prefix + excerpt + suffix;
            };

            // Determine which field has the best match
            let excerpt = '';
            let matchedField: 'title' | 'body' = 'title';

            // Check title first (highest priority)
            if (
              report.title &&
              filteredSearchQuery
                .split(/\s+/)
                .some((term) =>
                  report.title.toLowerCase().includes(term.toLowerCase()),
                )
            ) {
              excerpt = generateExcerpt(report.title, filteredSearchQuery, 30);
              matchedField = 'title';
            }
            // Then body
            else if (
              report.body &&
              filteredSearchQuery
                .split(/\s+/)
                .some((term) =>
                  report.body.toLowerCase().includes(term.toLowerCase()),
                )
            ) {
              excerpt = generateExcerpt(report.body, filteredSearchQuery, 50);
              matchedField = 'body';
            }

            // Remove unwanted fields
            const { relevance_score, ratios, body, ...reportData } = report;

            return {
              ...reportData,
              excerpt: excerpt || undefined,
              matchedField: excerpt ? matchedField : undefined,
            };
          });
        } else {
          // Fallback to basic contains search with simple excerpts
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

          const reports = await this.prisma.report.findMany({
            where,
            take: Number(limit),
            orderBy: { reportId: 'desc' },
          });

          // Generate simple excerpts
          return reports.map((report) => {
            let excerpt = '';
            let matchedField: 'title' | 'body' | 'issues' | 'ratios' = 'title';

            // Check each field for the search term
            if (
              report.title
                .toLowerCase()
                .includes(normalizedSearch.toLowerCase())
            ) {
              excerpt = generateSimpleExcerpt(
                report.title,
                normalizedSearch,
                40,
              );
              matchedField = 'title';
            } else if (
              report.issues
                ?.toLowerCase()
                .includes(normalizedSearch.toLowerCase())
            ) {
              excerpt = generateSimpleExcerpt(
                report.issues,
                normalizedSearch,
                40,
              );
              matchedField = 'issues';
            } else if (
              report.body.toLowerCase().includes(normalizedSearch.toLowerCase())
            ) {
              excerpt = generateSimpleExcerpt(
                report.body,
                normalizedSearch,
                40,
              );
              matchedField = 'body';
            }

            const { ratios, body, ...reportData } = report;
            return {
              ...reportData,
              excerpt: excerpt || undefined,
              matchedField: excerpt ? matchedField : undefined,
            };
          });
        }
      }

      // No search - return normal results without excerpts
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
  async getReportByReportId(reportId: number, user?: User) {
    try {
      const where: Prisma.ReportWhereInput = { reportId };
      const include: Prisma.ReportInclude = {
        _count: {
          select: {
            comments: true,
            bookmarks: true,
            likes: true,
            visits: true,
          },
        },
      };

      const report = await this.prisma.report.findFirst({
        where,
        include,
      });

      let isLikedByUser = false;
      let isBookmarkedByUser = false;

      if (!report)
        throw new NotFoundException(
          `Report with reportId ${reportId} not found`,
        );

      if (user) {
        const bookmark = await this.prisma.bookmark.findFirst({
          where: {
            reportId: report.id,
            userId: user.id,
          },
        });
        isBookmarkedByUser = !!bookmark;

        const like = await this.prisma.reportLike.findFirst({
          where: {
            reportId: report.id,
            userId: user.id,
          },
        });
        isLikedByUser = !!like;
      }

      return {
        ...report,
        isBookmarkedByUser,
        isLikedByUser,
      };
    } catch (error) {
      throw error;
    }
  }

  // get report by slug
  async getReportBySlug(slug: string) {
    try {
      const report = await this.prisma.report.findFirst({
        where: { slug },
      });
      if (!report)
        throw new NotFoundException(`Report with slug ${slug} not found`);

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

  // like report
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

  // ensure slug is unique by appending the reportId for all reports
  async updateAllReports() {
    try {
      const reports = await this.prisma.report.findMany({
        select: { id: true, court: true },
      });

      for (const report of reports) {
        // regularize court string with CourtEnum values
        let court = report.court?.toLowerCase()?.trim();
        if (court?.includes('sup')) {
          court = CourtEnum.SUPREME_COURT;
        } else if (court?.includes('ap')) {
          court = CourtEnum.APPEAL_COURT;
        } else {
          court = report.court;
        }
        await this.prisma.report.update({
          where: { id: report.id },
          data: { court },
        });
      }

      return { message: 'Report slugs updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // get dashboard metrics
  async getReportMetrics() {
    try {
      const [totalReports, publishedReports, draftReports, viewsAggregate] =
        await Promise.all([
          this.prisma.report.count(),
          this.prisma.report.count({
            where: { isPublished: true },
          }),
          this.prisma.report.count({
            where: { isPublished: false },
          }),
          this.prisma.report.aggregate({
            _sum: {
              views: true,
            },
          }),
        ]);

      return {
        totalReports,
        publishedReports,
        draftReports,
        totalViews: viewsAggregate._sum.views || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  async publishReport(id: string) {
    try {
      const report = await this.prisma.report.findFirst({
        where: { id },
      });
      if (!report)
        throw new NotFoundException(`Report with id ${id} not found`);
      const isPublished = !report?.isPublished || false;
      await this.prisma.report.update({
        where: { id },
        data: {
          isPublished,
        },
      });
      return {
        message: `Report ${isPublished ? 'published' : 'unpublished'} successfully`,
        isPublished,
      };
    } catch (error) {
      throw error;
    }
  }
}
