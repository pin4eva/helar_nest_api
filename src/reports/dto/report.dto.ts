import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDate, IsEnum, IsString } from 'class-validator';

export enum CourtEnum {
  SUPREME_COURT = 'Supreme Court',
  HIGH_COURT = 'High Court',
  APPEAL_COURT = 'Appeal Court',
  TRIBUNAL = 'Tribunal',
}

export class GetReportsFilter {
  @ApiProperty({ required: false })
  limit?: number;

  @ApiProperty({ required: false })
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

export class CreateReportBookmarkDTO {
  @ApiProperty()
  @IsString()
  reportId: string;
}
