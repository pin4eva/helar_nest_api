import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHandbookCaseDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;
  @ApiProperty()
  @IsString()
  byline: string;

  @ApiProperty()
  @IsString()
  citation: string;
  @ApiProperty()
  @IsString()
  topicId: string;
}

export class UpdateHandbookCaseDto extends PartialType(CreateHandbookCaseDto) {}
