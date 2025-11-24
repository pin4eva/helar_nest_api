import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateReportBookmarkDTO {
  @ApiProperty()
  @IsString()
  reportId: string;
}
