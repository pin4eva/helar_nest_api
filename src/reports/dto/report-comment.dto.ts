import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class CreateReportCommentDTO {
  @ApiProperty()
  @IsMongoId()
  reportId: string;

  @ApiProperty()
  @IsString()
  comment: string;
}

export class UpdateReportCommentDTO {
  @ApiProperty()
  @IsString()
  comment: string;

  @ApiProperty()
  @IsMongoId()
  commentId: string;
}
