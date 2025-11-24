import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SubjectService } from '../services/subject.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateSubjectDTO, UpdateSubjectDTO } from '../dto/subject.dto';
import { AuthGuard } from '../../guards/auth.guard';

@ApiBearerAuth()
@ApiTags('Subject')
@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createSubject(@Body() createSubjectDto: CreateSubjectDTO) {
    return this.subjectService.createSubject(createSubjectDto);
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateSubject(@Body() updateSubjectDto: UpdateSubjectDTO) {
    return this.subjectService.updateSubject(updateSubjectDto);
  }

  @Get()
  async getAllSubjects() {
    return this.subjectService.getAllSubjects();
  }

  @Get('slug/:slug')
  async getSubjectBySlug(@Param('slug') slug: string) {
    return this.subjectService.getSubjectBySlug(slug);
  }

  @Get('id/:id')
  async getSubjectById(@Param('id') id: string) {
    return this.subjectService.getSubjectById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteSubject(@Param('id') id: string) {
    return this.subjectService.deleteSubject(id);
  }
}
