import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SummaryTypeEnum } from 'src/generated/enums';

export class CreateSummaryTopicDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  subjectId!: string;

  @ApiProperty({
    required: false,
    enum: SummaryTypeEnum,
    default: SummaryTypeEnum.Faculty_Summary,
  })
  @IsOptional()
  @IsEnum(SummaryTypeEnum)
  type?: SummaryTypeEnum;
}

export class UpdateSummaryTopicDto extends PartialType(CreateSummaryTopicDto) {}

export class SummaryTopicsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subjectSlug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  type?: SummaryTypeEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
