import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TopicTypeEnum } from 'src/generated/enums';

export class CreateHandbookTopicDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  subjectId: string;

  @ApiProperty({
    required: true,
    enum: TopicTypeEnum,
    default: TopicTypeEnum.Handbook,
  })
  @IsEnum(TopicTypeEnum)
  type: TopicTypeEnum;
}

export class UpdateHandbookTopicDto extends PartialType(
  CreateHandbookTopicDto,
) {}

export class HandbookTopicsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subjectSlug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: TopicTypeEnum })
  @IsOptional()
  @IsEnum(TopicTypeEnum)
  type?: TopicTypeEnum;
}
