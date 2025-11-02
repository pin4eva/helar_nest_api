import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/client';
import { PrismaService } from '../prisma.service';
import { cloudinaryUpload, deleteImage } from '../utils/cloudinary';
import {
  GetUsersFilterInput,
  UpdateProfileTypeDTO,
  UpdateStatusDTO,
  UpdateUserDTO,
  UpdateUserRoleDTO,
  UploadImageDTO,
} from './user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // get users
  async getUsers(input?: GetUsersFilterInput) {
    const { search, limit = 100 } = input || {};
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return this.prisma.user.findMany({
      where,
      take: limit,
    });
  }

  // get user by id
  async getUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
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
      const user = await this.prisma.user.findFirst({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.prisma.user.update({
        where: { id },
        data,
      });

      return { data: 'User updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // delete user
  async deleteUser(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.prisma.user.delete({
        where: { id },
      });
      return { data: 'User deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // update role
  async updateRole(input: UpdateUserRoleDTO) {
    try {
      const { id, role } = input;
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.prisma.user.update({
        where: { id },
        data: { role },
      });
      return { data: 'User role updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // update user status
  async updateStatus(input: UpdateStatusDTO) {
    try {
      const { id, status } = input;
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.prisma.user.update({
        where: { id },
        data: { status },
      });
      return { data: 'User status updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // update profile type
  async updateProfileType(input: UpdateProfileTypeDTO) {
    try {
      const { id, profileType } = input;
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.prisma.user.update({
        where: { id },
        data: { profileType },
      });
      return { data: 'User profile type updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // upload profile image
  async uploadProfileImage(input: UploadImageDTO) {
    try {
      const { image, userId } = input;
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
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
      await this.prisma.user.update({
        where: { id: userId },
        data: { image: result?.imageUrl, imagePublicId: result?.publicId },
      });
      return { data: result?.imageUrl };
    } catch (error) {
      throw error;
    }
  }
}
