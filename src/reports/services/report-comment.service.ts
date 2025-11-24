import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../generated/client';

import {
  CreateReportCommentDTO,
  UpdateReportCommentDTO,
} from '../dto/report-comment.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportCommentService {
  constructor(private readonly prisma: PrismaService) {}

  // create comment
  async createComment(input: CreateReportCommentDTO, user: User) {
    try {
      const report = await this.prisma.report.findUnique({
        where: { id: input.reportId },
      });

      if (!report) {
        throw new NotFoundException('Report not found');
      }

      const comment = await this.prisma.reportComment.create({
        data: {
          reportId: input.reportId,
          authorId: user.id,
          comment: input.comment,
        },
      });

      return comment;
    } catch (error) {
      throw error;
    }
  }

  // update comment
  async updateReportComment(input: UpdateReportCommentDTO, user: User) {
    try {
      const existingComment = await this.prisma.reportComment.findUnique({
        where: { id: input.commentId },
      });

      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      if (existingComment.authorId !== user.id) {
        throw new NotFoundException(
          'You are not authorized to update this comment',
        );
      }

      const updatedComment = await this.prisma.reportComment.update({
        where: { id: input.commentId },
        data: {
          comment: input.comment,
        },
      });

      return updatedComment;
    } catch (error) {
      throw error;
    }
  }

  // delete comment
  async deleteReportComment(commentId: string, user: User) {
    try {
      const existingComment = await this.prisma.reportComment.findUnique({
        where: { id: commentId },
      });

      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      if (existingComment.authorId !== user.id) {
        throw new NotFoundException(
          'You are not authorized to delete this comment',
        );
      }

      await this.prisma.reportComment.delete({
        where: { id: commentId },
      });

      return { message: 'Comment deleted successfully', success: true };
    } catch (error) {
      throw error;
    }
  }

  // get comments for a report
  async getCommentsForReport(reportId: string) {
    try {
      const comments = await this.prisma.reportComment.findMany({
        where: { reportId },
      });

      return comments;
    } catch (error) {
      throw error;
    }
  }

  // like or dislike comment
  async toggleLikeComment(commentId: string, user: User) {
    try {
      const existingLike = await this.prisma.reportCommentLike.findFirst({
        where: {
          reportCommentId: commentId,
          userId: user.id,
        },
      });

      if (existingLike) {
        // delete like ie dislike
        await this.prisma.reportCommentLike.delete({
          where: { id: existingLike.id },
        });
        return {
          message: 'Comment disliked successfully',
          success: true,
        };
      }

      const like = await this.prisma.reportCommentLike.create({
        data: {
          reportCommentId: commentId,
          userId: user.id,
        },
      });

      return {
        message: 'Comment liked successfully',
        success: true,
        data: like,
      };
    } catch (error) {
      throw error;
    }
  }
}
