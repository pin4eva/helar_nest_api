import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSubjectDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  intro: string;
}

export class UpdateSubjectDTO extends PartialType(CreateSubjectDTO) {
  @ApiProperty()
  @IsString()
  id: string;
}

export enum SubjectTypeEnum {
  NLS = 'NLS',
}

export class GetSubjectsFilter {
  @ApiProperty({ required: false })
  @IsString()
  search?: string;
}
