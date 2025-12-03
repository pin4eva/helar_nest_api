import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TopicTypeEnum } from 'src/generated/enums';

export class HandbookSearchQueryDto {
  @ApiProperty({ required: true, description: 'Search query string' })
  @IsString()
  q!: string;

  @ApiProperty({ required: false, enum: TopicTypeEnum })
  @IsOptional()
  @IsEnum(TopicTypeEnum)
  type?: TopicTypeEnum;

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

export interface HandbookSearchResult {
  topics: HandbookTopicSearchResult[];
  cases: HandbookCaseSearchResult[];
  totalTopics: number;
  totalCases: number;
}

export interface HandbookTopicSearchResult {
  id: string;
  title: string;
  slug: string | null;
  type: TopicTypeEnum;
  subject: {
    id: string;
    name: string;
    slug: string;
  };
  caseCount: number;
  matchType: 'title';
}

export interface HandbookCaseSearchResult {
  id: string;
  title: string;
  body: string;
  byline: string;
  citation: string;
  slug: string;
  ref: number;
  topic: {
    id: string;
    title: string;
    slug: string | null;
    type: TopicTypeEnum;
    subject: {
      id: string;
      name: string;
      slug: string;
    };
  };
  matchType: 'title' | 'body' | 'citation' | 'multiple';
  excerpt: string;
}
