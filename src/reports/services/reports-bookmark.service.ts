import { Injectable } from '@nestjs/common';
import { User } from 'src/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportBookmarkDTO } from '../dto/reports-book.dto';

@Injectable()
export class ReportsBookmarkService {
  constructor(private readonly prisma: PrismaService) {}

  // bookmark report
  async toggleBookmarkReport(input: CreateReportBookmarkDTO, user: User) {
    try {
      const { reportId } = input;
      const existingBookmark = await this.prisma.bookmark.findUnique({
        where: {
          userId_reportId: {
            userId: user.id,
            reportId,
          },
        },
      });

      if (existingBookmark) {
        await this.prisma.bookmark.delete({
          where: {
            userId_reportId: {
              userId: user.id,
              reportId,
            },
          },
        });
        return {
          message: 'Bookmark removed',
          action: 'removed',
          bookmark: existingBookmark,
        };
      }
      const bookmark = await this.prisma.bookmark.upsert({
        where: {
          userId_reportId: {
            reportId,
            userId: user.id,
          },
        },
        create: {
          userId: user.id,
          reportId,
        },
        update: {},
      });
      return {
        message: 'Bookmark added',
        action: 'added',
        bookmark,
      };
    } catch (error) {
      throw error;
    }
  }

  // get bookmarks
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
}
