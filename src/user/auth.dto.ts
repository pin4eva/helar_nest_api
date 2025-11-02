import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

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

export class RegisterDTO {
  @ApiProperty({ required: true })
  @IsString()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  lastName: string;

  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  password: string;
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
