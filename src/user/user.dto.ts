import { Optional } from '@nestjs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';
import {
  GenderEnum,
  UserProfileTypeEnum,
  UserRoleEnum,
  UserStatusEnum,
} from 'src/generated/enums';

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
  @IsString()
  id: string;

  @ApiProperty({ required: true })
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}

export class UpdateStatusDTO {
  @ApiProperty({ required: true })
  @IsString()
  id: string;

  @ApiProperty({ required: true })
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;
}

export class UpdateProfileTypeDTO {
  @ApiProperty({ required: true })
  @IsString()
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
  @IsString()
  userId: string;
}

// assign permissions DTO
export class AssignPermissionsDTO {
  @ApiProperty({ required: true })
  @IsString()
  userId: string;

  @ApiProperty({ required: true, isArray: true, enum: String })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

// bulk delete users DTO
export class BulkDeleteUsersDTO {
  @ApiProperty({ required: true, isArray: true })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
