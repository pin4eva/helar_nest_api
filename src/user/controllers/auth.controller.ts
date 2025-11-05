import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreatePasswordDTO,
  LoginDTO,
  LoginResponse,
  RegisterDTO,
} from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Authentication')
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
  async signup(@Body() input: RegisterDTO) {
    return this.authService.register(input);
  }

  // create password
  @Post('create-password')
  async createPassword(@Body() input: CreatePasswordDTO) {
    return this.authService.createPassword(input);
  }

  // refresh token
  @Post('refresh-token')
  async refreshToken(@Body('refresh_token') refresh_token: string) {
    return this.authService.refreshAccessToken(refresh_token);
  }

  // logout

  // forgot password

  // reset password
}
