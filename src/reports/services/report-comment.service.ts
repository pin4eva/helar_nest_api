import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import {
  CreateReportCommentDTO,
  UpdateReportCommentDTO,
} from '../dto/report-comment.dto';
import { Report } from '../schema/report.schema';
import {
  ReportComment,
  ReportCommentLike,
} from '../schema/report-comment.schema';

@Injectable()
export class ReportCommentService {
  constructor(
    @InjectModel(ReportComment.name)
    private readonly reportCommentModel: Model<ReportComment>,
    @InjectModel(Report.name) private readonly reportModel: Model<Report>,
    @InjectModel(ReportCommentLike.name)
    private readonly likeModel: Model<ReportCommentLike>,
  ) {}

  // create comment
  async createComment(input: CreateReportCommentDTO, user: User) {
    try {
      const report = await this.reportModel.findById(input.reportId, {
        title: 1,
      });

      if (!report) {
        throw new NotFoundException('Report not found');
      }

      const comment = await this.reportCommentModel.create({
        reportId: input.reportId,
        authorId: user.id,
        comment: input.comment,
      });

      return comment;
    } catch (error) {
      throw error;
    }
  }

  // update comment
  async updateReportComment(input: UpdateReportCommentDTO, user: User) {
    try {
      const existingComment = await this.reportCommentModel.findById(
        input.commentId,
      );

      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      if (String(existingComment.authorId) !== user.id) {
        throw new NotFoundException(
          'You are not authorized to update this comment',
        );
      }

      existingComment.comment = input.comment;

      const comment = await existingComment.save();
      return comment;
    } catch (error) {
      throw error;
    }
  }

  // delete comment
  async deleteReportComment(commentId: string, user: User) {
    try {
      const existingComment = await this.reportCommentModel.findById(commentId);

      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      if (existingComment.authorId !== user.id) {
        throw new NotFoundException(
          'You are not authorized to delete this comment',
        );
      }

      await this.reportCommentModel.deleteOne({ _id: existingComment._id });

      return {
        message: 'Comment deleted successfully',
        success: true,
        id: existingComment._id,
      };
    } catch (error) {
      throw error;
    }
  }

  // get comments for a report
  async getCommentsForReport(reportId: string) {
    try {
      const comments = await this.reportCommentModel.find({
        reportId,
      });

      return comments;
    } catch (error) {
      throw error;
    }
  }

  // like or dislike comment
  async toggleLikeComment(commentId: string, user: User) {
    try {
      const existingLike = await this.likeModel.findOne({
        reportCommentId: commentId,
        userId: user.id,
      });

      if (existingLike) {
        // delete like ie dislike
        await this.likeModel.deleteOne({ _id: existingLike._id });
        return {
          message: 'Comment disliked successfully',
          success: true,
          id: existingLike.id,
        };
      }

      const like = await this.likeModel.create({
        reportCommentId: commentId,
        userId: user.id,
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
