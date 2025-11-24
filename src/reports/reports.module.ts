import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsBookmarkService } from './services/reports-bookmark.service';
import { ReportCommentController } from './controllers/report-comment.controller';
import { ReportCommentService } from './services/report-comment.service';

@Module({
  controllers: [ReportsController, ReportCommentController],
  providers: [
    ReportsService,
    PrismaService,
    ReportsBookmarkService,
    ReportCommentService,
  ],
})
export class ReportsModule {}
