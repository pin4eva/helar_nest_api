import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../generated/client';
import { AuthGuard } from '../../guards/auth.guard';
import {
  CreateReportDTO,
  GetReportsFilter,
  UpdateReportDTO,
} from '../dto/report.dto';
import { ReportsService } from '../services/reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getReports(@Query() query?: GetReportsFilter) {
    return this.reportsService.getReports(query);
  }

  @Get('single/:id')
  async getReportById(@Param('id') id: string) {
    return this.reportsService.getReportById(id);
  }
  @Get('reportId/:reportId')
  async getReportByReportId(@Param('reportId') reportId: number) {
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
}
