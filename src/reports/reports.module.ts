import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './controllers/reports.controller';
import { ReportsResolver } from './resolver/resolver.resolver';
import {
  Report,
  ReportLike,
  ReportLikeSchema,
  ReportSchema,
} from './schema/report.schema';
import { Bookmark, BookmarkSchema } from './schema/report-bookmark.schema';
import {
  ReportComment,
  ReportCommentSchema,
} from './schema/report-comment.schema';
import { BookmarkService } from './services/bookmark.service';
import { ReportsService } from './services/reports.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportsResolver, BookmarkService],
  imports: [
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: ReportLike.name, schema: ReportLikeSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: ReportComment.name, schema: ReportCommentSchema },
    ]),
  ],
})
export class ReportsModule {}
