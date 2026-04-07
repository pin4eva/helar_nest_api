import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateBarExamDto {
  @ApiProperty()
  @IsString()
  subjectId: string;
  @ApiProperty()
  @IsString()
  question: string;
  @ApiProperty()
  @IsString()
  answer: string;
  @ApiProperty()
  @IsNumber()
  year: number;
}

export class UpdateBarExamDto extends PartialType(CreateBarExamDto) {
  @ApiProperty()
  @IsString()
  id: string;
}
