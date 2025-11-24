import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { SessionId } from '../../decorators/client-id.decorator';
import { User } from '../../generated/client';
import { AuthGuard } from '../../guards/auth.guard';
import {
  CreateReportDTO,
  GetReportsFilter,
  UpdateReportDTO,
} from '../dto/report.dto';
import { ReportsService } from '../services/reports.service';
import { Request } from 'express';
import { CreateReportBookmarkDTO } from '../dto/reports-book.dto';
import { ReportsBookmarkService } from '../services/reports-bookmark.service';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly bookmarkService: ReportsBookmarkService,
  ) {}

  @Get()
  async getReports(@Query() query?: GetReportsFilter) {
    return this.reportsService.getReports(query);
  }

  @Get('single/:id')
  async getReportById(@Param('id') id: string) {
    return this.reportsService.getReportById(id);
  }
  @Get('reportId/:reportId')
  async getReportByReportId(
    @Param('reportId') reportId: number,
    @Req() request: Request,
  ) {
    return this.reportsService.getReportByReportId(reportId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createReport(
    @Body() input: CreateReportDTO,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.createReport(input, user);
  }

  @UseGuards(AuthGuard)
  @Put()
  async updateReport(
    @Body() input: UpdateReportDTO,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.updateReport(input, user);
  }

  @Post('like-dislike/:id')
  @UseGuards(AuthGuard)
  async likeReport(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reportsService.likeReport(id, user);
  }

  @Patch('mark-viewed/:id')
  async markReportAsViewed(
    @Param('id') id: string,
    @SessionId() clientId?: string,
  ) {
    return this.reportsService.markReportAsViewed(id, clientId);
  }

  @Delete('single/:id')
  @UseGuards(AuthGuard)
  async deleteReport(@Param('id') id: string) {
    return this.reportsService.deleteReport(id);
  }

  @Patch('bookmark/:id')
  @UseGuards(AuthGuard)
  toggleBookmark(
    @Body() CreateReportBookmarkDTO: CreateReportBookmarkDTO,
    @CurrentUser() user: User,
  ) {
    return this.bookmarkService.toggleBookmarkReport(
      CreateReportBookmarkDTO,
      user,
    );
  }

  @Get('bookmarks')
  @UseGuards(AuthGuard)
  getBookmarks(@CurrentUser() user: User) {
    return this.bookmarkService.getBookmarks(user);
  }
}
