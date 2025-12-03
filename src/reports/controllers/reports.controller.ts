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
import { User, UserRoleEnum } from '../../generated/client';
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
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';

@UseGuards(AuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly bookmarkService: ReportsBookmarkService,
  ) {}

  @Public()
  @Get()
  async getReports(@Query() query?: GetReportsFilter) {
    return this.reportsService.getReports(query);
  }

  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor, UserRoleEnum.Developer)
  @Get('all')
  getAllReports() {
    return this.reportsService.getAllReports();
  }

  @Get('metrics')
  @UseGuards(AuthGuard)
  async getReportMetrics() {
    return this.reportsService.getReportMetrics();
  }

  @Get('single/:id')
  async getReportById(@Param('id') id: string) {
    return this.reportsService.getReportById(id);
  }

  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor, UserRoleEnum.Developer)
  @Patch('publish/:id')
  @UseGuards(AuthGuard)
  async publishReport(@Param('id') id: string) {
    return this.reportsService.publishReport(id);
  }

  @Public()
  @Get('reportId/:reportId')
  async getReportByReportId(
    @Param('reportId') reportId: number,
    @Req() request: Request,
  ) {
    return this.reportsService.getReportByReportId(reportId);
  }

  @Public()
  @Get('slug/:slug')
  async getReportBySlug(@Param('slug') slug: string, @Req() request: Request) {
    return this.reportsService.getReportBySlug(slug);
  }

  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor, UserRoleEnum.Developer)
  @Post()
  async createReport(
    @Body() input: CreateReportDTO,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.createReport(input, user);
  }

  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor, UserRoleEnum.Developer)
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

  @Public()
  @Patch('mark-viewed/:id')
  async markReportAsViewed(
    @Param('id') id: string,
    @SessionId() clientId?: string,
  ) {
    return this.reportsService.markReportAsViewed(id, clientId);
  }

  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor, UserRoleEnum.Developer)
  @Delete('single/:id')
  async deleteReport(@Param('id') id: string) {
    return this.reportsService.deleteReport(id);
  }

  @Patch('bookmark')
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
  getBookmarks(@CurrentUser() user: User) {
    return this.bookmarkService.getBookmarks(user);
  }

  @Patch('update-all-slugs')
  updateAllSlugs() {
    return this.reportsService.updateAllReports();
  }
}
