import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsString } from 'class-validator';
import {
  User,
  UserProfileTypeEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '../schema/user.schema';

@InputType()
export class GetUsersFilterInput {
  @Field(() => String, { nullable: true })
  @ApiProperty({ required: false })
  search?: string;
  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  limit?: number;
}

@InputType()
export class UpdateUserDTO extends PartialType(User) {
  @Field()
  @ApiProperty({ required: true })
  @IsMongoId()
  id: string;
}

@InputType()
export class UpdateUserRoleDTO {
  @Field()
  @ApiProperty({ required: true })
  @IsMongoId()
  id: string;

  @Field()
  @ApiProperty({ required: true })
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}

@InputType()
export class UpdateStatusDTO {
  @Field()
  @ApiProperty({ required: true })
  @IsMongoId()
  id: string;

  @Field()
  @ApiProperty({ required: true })
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;
}

@InputType()
export class UpdateProfileTypeDTO {
  @Field()
  @ApiProperty({ required: true })
  @IsMongoId()
  id: string;

  @Field()
  @ApiProperty({ required: true })
  @IsEnum(UserProfileTypeEnum)
  profileType: UserProfileTypeEnum;
}

@InputType()
export class UploadImageDTO {
  @Field()
  @ApiProperty({ required: true })
  @IsString()
  image: string;

  @Field()
  @ApiProperty({ required: true })
  @IsMongoId()
  userId: string;
}
