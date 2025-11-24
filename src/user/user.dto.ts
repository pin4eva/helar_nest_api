import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsString } from 'class-validator';
import {
  GenderEnum,
  UserProfileTypeEnum,
  UserRoleEnum,
  UserStatusEnum,
} from 'src/generated/enums';
import { type User } from 'src/generated/client';
import { Optional } from '@nestjs/common';

export class GetUsersFilterInput {
  @ApiProperty({ required: false })
  search?: string;
  @ApiProperty({ required: false })
  limit?: number;
}

export class CreateUserDTO {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  email: string;

  // @ApiProperty({ required: true })
  // @IsString()
  // password?: string;

  @ApiProperty({ required: true })
  @IsString()
  phone: string;

  @ApiProperty({ required: true })
  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @ApiProperty({ required: false })
  @Optional()
  schoolId: string;
}
export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @ApiProperty({ required: true })
  @IsString()
  id: string;

  @ApiProperty({ required: false })
  @Optional()
  bio?: string;
}

export class UpdateUserRoleDTO {
  @ApiProperty({ required: true })
  @IsMongoId()
  id: string;

  @ApiProperty({ required: true })
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}

export class UpdateStatusDTO {
  @ApiProperty({ required: true })
  @IsMongoId()
  id: string;

  @ApiProperty({ required: true })
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;
}

export class UpdateProfileTypeDTO {
  @ApiProperty({ required: true })
  @IsMongoId()
  id: string;

  @ApiProperty({ required: true })
  @IsEnum(UserProfileTypeEnum)
  profileType: UserProfileTypeEnum;
}

export class UploadImageDTO {
  @ApiProperty({ required: true })
  @IsString()
  image: string;

  @ApiProperty({ required: true })
  @IsMongoId()
  userId: string;
}
