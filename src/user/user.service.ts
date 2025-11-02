import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDTO } from './user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async createUser(input: CreateUserDTO) {
    try {
      const email = input.email.trim().toLowerCase();
      const isUserEmailExist = await this.prisma.user.findUnique({
        where: { email },
      });

      if (isUserEmailExist) {
        throw new BadRequestException('Email already exists');
      }
      const user = await this.prisma.user.create({
        data: {
          name: input.name,
          email,
        },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }
}
