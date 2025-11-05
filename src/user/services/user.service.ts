import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { cloudinaryUpload, deleteImage } from '../../utils/cloudinary';
import {
  GetUsersFilterInput,
  UpdateProfileTypeDTO,
  UpdateStatusDTO,
  UpdateUserDTO,
  UpdateUserRoleDTO,
  UploadImageDTO,
} from '../dto/user.dto';
import { User } from '../schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // get users
  async getUsers(input?: GetUsersFilterInput) {
    try {
      const { search, limit = 100 } = input || {};
      const where: FilterQuery<User> = {};
      if (search) {
        where.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await this.userModel.find(where).limit(limit);
      return users;
    } catch (error) {
      throw error;
    }
  }

  // get user by id
  async getUserById(id: string) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  // update user
  async updateUser(input: UpdateUserDTO) {
    try {
      const { id, ...data } = input;
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.userModel.updateOne({ _id: id }, { $set: data });

      return 'User updated successfully';
    } catch (error) {
      throw error;
    }
  }

  // delete user
  async deleteUser(id: string) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.userModel.deleteOne({ _id: id });

      return 'User deleted successfully';
    } catch (error) {
      throw error;
    }
  }

  // update role
  async updateRole(input: UpdateUserRoleDTO) {
    try {
      const { id, role } = input;
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.userModel.updateOne({ _id: id }, { $set: { role } });
      return { data: 'User role updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // update user status
  async updateStatus(input: UpdateStatusDTO) {
    try {
      const { id, status } = input;
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.userModel.updateOne({ _id: id }, { $set: { status } });

      return { data: 'User status updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // update profile type
  async updateProfileType(input: UpdateProfileTypeDTO) {
    try {
      const { id, profileType } = input;
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.userModel.updateOne({ _id: id }, { $set: { profileType } });
      return { data: 'User profile type updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // upload profile image
  async uploadProfileImage(input: UploadImageDTO) {
    try {
      const { image, userId } = input;
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
      if (user?.imagePublicId) {
        // delete previous image
        await deleteImage(user.imagePublicId);
      }
      const result = await cloudinaryUpload(image).catch((err) => {
        throw err;
      });
      user.imagePublicId = result?.publicId;
      user.image = result?.imageUrl;
      await user.save();

      return { data: result?.imageUrl };
    } catch (error) {
      throw error;
    }
  }
}
