import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SummaryTypeEnum } from 'src/generated/enums';

export class SummarySearchQueryDto {
  @ApiProperty({ required: true, description: 'Search query string' })
  @IsString()
  q!: string;

  @ApiProperty({ required: false, enum: SummaryTypeEnum })
  @IsOptional()
  @IsEnum(SummaryTypeEnum)
  type?: SummaryTypeEnum;

  @ApiProperty({ required: false, description: 'Filter by subject slug' })
  @IsOptional()
  @IsString()
  subjectSlug?: string;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export interface SummarySearchResult {
  topics: SummaryTopicSearchResult[];
  cases: SummaryCaseSearchResult[];
  totalTopics: number;
  totalCases: number;
}

export interface SummaryTopicSearchResult {
  id: string;
  title: string;
  slug: string;
  type: SummaryTypeEnum;
  subject: {
    id: string;
    name: string;
    slug: string;
  };
  caseCount: number;
  matchType: 'title';
}

export interface SummaryCaseSearchResult {
  id: string;
  question: string;
  answer: string;
  slug: string | null;
  ref: number;
  topic: {
    id: string;
    title: string;
    slug: string;
    type: SummaryTypeEnum;
    subject: {
      id: string;
      name: string;
      slug: string;
    };
  };
  matchType: 'question' | 'answer' | 'both';
  excerpt: string;
}
