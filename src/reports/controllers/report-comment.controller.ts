import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../generated/client';
import { AuthGuard } from '../../guards/auth.guard';
import {
  CreateReportCommentDTO,
  UpdateReportCommentDTO,
} from '../dto/report-comment.dto';
import { ReportCommentService } from '../services/report-comment.service';

@ApiBearerAuth()
@ApiTags('Report Comments')
@Controller('report/comments')
export class ReportCommentController {
  constructor(private readonly reportCommentService: ReportCommentService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createComment(
    @Body() input: CreateReportCommentDTO,
    @CurrentUser() user: User,
  ) {
    return this.reportCommentService.createComment(input, user);
  }

  @UseGuards(AuthGuard)
  @Put()
  async updateComment(
    @Body() input: UpdateReportCommentDTO,
    @CurrentUser() user: User,
  ) {
    return this.reportCommentService.updateReportComment(input, user);
  }

  @Get(':reportId')
  async getCommentsByReportId(@Param('reportId') reportId: string) {
    return this.reportCommentService.getCommentsForReport(reportId);
  }

  @UseGuards(AuthGuard)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return this.reportCommentService.deleteReportComment(commentId, user);
  }

  @UseGuards(AuthGuard)
  @Post('toggle-like/:commentId')
  async toggleLikeComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return this.reportCommentService.toggleLikeComment(commentId, user);
  }
}
