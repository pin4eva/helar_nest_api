import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { CreateReportBookmarkDTO } from '../dto/report.dto';
import { Bookmark } from '../schema/report-bookmark.schema';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<Bookmark>,
  ) {}

  // bookmark report
  async bookmarkReport(input: CreateReportBookmarkDTO, user: User) {
    try {
      const { reportId } = input;
      const existingBookmark = await this.bookmarkModel.findOne({
        reportId,
        userId: user.id,
      });
      if (existingBookmark) {
        await this.bookmarkModel.deleteOne({ _id: existingBookmark._id });
        return {
          message: 'Bookmark removed successfully',
          success: true,
          id: existingBookmark._id,
        };
      }
      const bookmark = await this.bookmarkModel.create({
        userId: user.id,
        reportId,
      });
      return {
        message: 'Bookmark added successfully',
        success: true,
        id: bookmark._id,
      };
    } catch (error) {
      throw error;
    }
  }

  async getBookmarks(user: User) {
    try {
      const bookmarks = await this.bookmarkModel.find({
        userId: user.id,
      });
      return bookmarks;
    } catch (error) {
      throw error;
    }
  }
}
