import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from 'src/generated/client';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import {
  CreatePasswordDTO,
  LoginDTO,
  LoginResponse,
  VerifyEmailTokenDTO,
} from './auth.dto';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './user.dto';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login
  @Post('login')
  async login(@Body() input: LoginDTO): Promise<LoginResponse> {
    return this.authService.login(input);
  }

  // register
  @Post('signup')
  async signup(@Body() input: CreateUserDTO, @Req() req: Request) {
    return this.authService.signup(input, req);
  }

  @Patch('resend-verification')
  async resendVerificationEmail(
    @Body('email') email: string,
    @Req() req: Request,
  ) {
    return this.authService.resendVerificationEmail(email, req);
  }

  @Post('verify-email')
  async verifyEmail(@Body() input: VerifyEmailTokenDTO) {
    return this.authService.verifyEmailToken(input);
  }

  // create password
  @Post('create-password')
  async createPassword(@Body() input: CreatePasswordDTO) {
    return this.authService.createPassword(input);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: User) {
    return this.authService.me(user.id);
  }

  // refresh token
  @Post('refresh')
  async refreshToken(@Body('refresh_token') refresh_token: string) {
    return this.authService.refreshAccessToken(refresh_token);
  }

  // logout
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    const token = req.headers.authorization;
    if (!token) {
      throw new BadRequestException('No token provided');
    }
    return this.authService.logout(token);
  }

  // forgot password
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Req() req: Request) {
    return this.authService.sendForgotPasswordLink(email, req);
  }

  // reset password
}
