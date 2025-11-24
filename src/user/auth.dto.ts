import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { User } from 'src/generated/client';

export class LoginDTO {
  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  password: string;
}

export class LoginResponse {
  message: string;
  success: boolean;
  userId: string;
  passwordUpdateRequired?: boolean;
  passwordUpdateToken?: string;
  access_token?: string;
  refresh_token?: string;
}

export class CreatePasswordDTO {
  @ApiProperty({ required: true })
  @IsString()
  userId: string;

  @ApiProperty({ required: true })
  @IsString()
  token: string;

  @ApiProperty({ required: true })
  @IsString()
  password: string;
}

export class SessionInfo {
  sessionId: string;
  userId: string;
  refresh_token?: string;
  createdAt: Date;
  expiresAt?: Date;
  user?: User;
}

export class VerifyEmailTokenDTO {
  @ApiProperty({ required: true })
  @IsString()
  token: string;

  @ApiProperty({ required: true })
  @IsString()
  password: string;
}
