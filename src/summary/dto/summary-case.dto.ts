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
}

export class UpdateSummaryCaseDto extends PartialType(CreateSummaryCaseDto) {
  @ApiProperty()
  @IsString()
  id: string;
}
