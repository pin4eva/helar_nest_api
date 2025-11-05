import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { slugify } from '../../utils/helpers';
import {
  CreateReportDTO,
  GetReportsFilter,
  UpdateReportDTO,
} from '../dto/report.dto';
import { Report, ReportLike } from '../schema/report.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @InjectModel(ReportLike.name) private reportLikeModel: Model<ReportLike>,
  ) {}

  // create report
  async createReport(input: CreateReportDTO, user: User) {
    try {
      const title = input?.title?.toLowerCase().trim().replace(/\s+$/, '');
      const existingReport = await this.reportModel.findOne({ title });

      if (existingReport) {
        throw new Error('Report with this title already exists');
      }

      const lastReport = await this.reportModel
        .find({})
        .sort({ reportId: -1 })
        .limit(1)
        .lean()
        .exec();

      const slug = slugify(input.title);

      const lastReportId = lastReport?.[0]?.reportId || 5000;

      const createdDate = new Date(input.date);
      const { court } = input;
      const report = await this.reportModel.create({
        ...input,
        reportId: lastReportId + 1,
        slug,
        date: Number.isNaN(createdDate.getTime()) ? new Date() : createdDate,
        court: court ? court : 'Unknown',
        added_by_id: user.id,
      });

      return report;
    } catch (error) {
      throw error;
    }
  }

  // update report
  async updateReport(input: UpdateReportDTO, user: User) {
    try {
      const { id, ...data } = input;

      const report = await this.reportModel.findById(id);
      if (!report) {
        throw new NotFoundException(`Report with id ${id} not found`);
      }
      Object.assign(report, data);
      report.updated_by_id = user.id;
      await report.save();

      return report;
    } catch (error) {
      throw error;
    }
  }

  // delete report
  async deleteReport(id: string) {
    try {
      const report = await this.reportModel.findById(id);
      if (!report) {
        throw new NotFoundException(`Report with id ${id} not found`);
      }
      await this.reportModel.deleteOne({ _id: report._id });
      return {
        message: `Report with id ${id} deleted successfully`,
        success: true,
        id: report.id,
      };
    } catch (error) {
      throw error;
    }
  }

  // get reports
  async getReports(filter?: GetReportsFilter) {
    try {
      const { search, limit = 20 } = filter || { search: '', limit: 20 };
      const where: FilterQuery<Report> = {};
      if (search) {
        where.$or = [
          { title: { $regex: search, $options: 'i' } },
          { body: { $regex: search, $options: 'i' } },
          { issues: { $regex: search, $options: 'i' } },
        ];
      }
      const reports = await this.reportModel
        .find(where)
        .limit(Number(limit))
        .select('-ratios -body')
        .exec();
      return reports;
    } catch (error) {
      throw error;
    }
  }

  // get report by id
  async getReportById(id: string) {
    try {
      const report = await this.reportModel.findById(id);
      if (!report)
        throw new NotFoundException(`Report with id ${id} not found`);
      return report;
    } catch (error) {
      throw error;
    }
  }

  // get report by reportId
  async getReportByReportId(reportId: number) {
    try {
      const report = await this.reportModel.findOne({
        reportId,
      });
      if (!report)
        throw new NotFoundException(
          `Report with reportId ${reportId} not found`,
        );
      return report;
    } catch (error) {
      throw error;
    }
  }

  // get top viewed reports
  async getTopViewedReports(limit: number = 5) {
    try {
      const reports = await this.reportModel
        .find({}, { body: 0, ratios: 0 })
        .sort({ views: -1 })
        .limit(limit)
        .exec();
      return reports;
    } catch (error) {
      throw error;
    }
  }

  async likeReport(reportId: string, user: User) {
    try {
      const existingLike = await this.reportLikeModel.findOne({
        reportId,
        userId: user.id,
      });
      if (existingLike) {
        // delete like ie unlike
        await this.reportLikeModel.deleteOne({
          _id: existingLike._id,
        });
        return {
          message: 'Report unliked successfully',
          success: true,
          id: existingLike._id,
        };
      }
      const like = await this.reportLikeModel.create({
        reportId,
        userId: user.id,
      });
      return {
        message: 'Report liked successfully',
        success: true,
        id: like.id,
      };
    } catch (error) {
      throw error;
    }
  }

  // like report

  // unlike report
}
