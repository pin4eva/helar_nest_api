import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum CourtEnum {
  SUPREME_COURT = 'Supreme Court',
  HIGH_COURT = 'High Court',
  APPEAL_COURT = 'Appeal Court',
  TRIBUNAL = 'Tribunal',
}

export class GetReportsFilter {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateReportDTO {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty()
  @IsEnum(CourtEnum)
  court: CourtEnum;

  @ApiProperty()
  @IsDate()
  date: string;

  @ApiProperty()
  @IsString()
  issues: string;

  @ApiProperty()
  @IsString()
  ratios: string;

  @ApiProperty()
  @IsString()
  suitNo: string;

  @ApiProperty()
  @IsString()
  summary: string;

  // @ApiProperty()
  // tags: string[];

  // @ApiProperty()
  // lawSubjects: string[];
}

export class UpdateReportDTO extends PartialType(CreateReportDTO) {
  @ApiProperty({ required: true })
  @IsString()
  id: string;
}

export class ReportSession {
  sessionId: string;
  userId?: string;
  reports: Set<string>;
  createdAt: Date;
}
