import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSummaryCaseDto {
  @ApiProperty()
  @IsString()
  topicId!: string;

  @ApiProperty()
  @IsString()
  question!: string;

  @ApiProperty()
  @IsString()
  answer!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  ref!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateSummaryCaseDto extends PartialType(CreateSummaryCaseDto) {}
