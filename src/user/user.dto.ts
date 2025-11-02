import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsString } from 'class-validator';
import {
  UserProfileTypeEnum,
  UserRoleEnum,
  UserStatusEnum,
} from 'src/generated/enums';
import { User } from './user.schema';

export class GetUsersFilterInput {
  @ApiProperty({ required: false })
  @IsString()
  search?: string;
  @ApiProperty({ required: false })
  limit?: number;
}
export class UpdateUserDTO extends PartialType(User) {
  @ApiProperty({ required: true })
  @IsMongoId()
  id?: string;
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
