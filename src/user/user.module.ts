import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, PrismaService, EmailService],
  imports: [],
  exports: [UserService, AuthService],
})
export class UserModule {}
