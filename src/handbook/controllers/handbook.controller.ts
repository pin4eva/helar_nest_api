import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { HandbookService } from '../services/handbook.service';
import {
  CreateHandbookTopicDto,
  UpdateHandbookTopicDto,
} from '../dto/handbook-topic.dto';
import {
  CreateHandbookCaseDto,
  UpdateHandbookCaseDto,
} from '../dto/handbook-case.dto';

@Controller('handbook')
export class HandbookController {
  constructor(private readonly handbookService: HandbookService) {}

  // Topics
  @Get('topics')
  getTopics() {
    return this.handbookService.listTopics();
  }

  @Get('topics/:id')
  getTopic(@Param('id') id: string) {
    return this.handbookService.getTopicById(id);
  }

  @Get('topics/subject/:subjectId')
  getTopicsBySubjectId(@Param('subjectId') subjectId: string) {
    return this.handbookService.getTopicsBySubjectId(subjectId);
  }

  @Post('topics')
  createTopic(@Body() input: CreateHandbookTopicDto) {
    return this.handbookService.createTopic(input);
  }

  @Patch('topics/:id')
  updateTopic(@Param('id') id: string, @Body() input: UpdateHandbookTopicDto) {
    return this.handbookService.updateTopic(id, input);
  }

  @Delete('topics/:id')
  deleteTopic(@Param('id') id: string) {
    return this.handbookService.deleteTopic(id);
  }

  // Cases
  @Get('cases')
  getCases() {
    return this.handbookService.listCases();
  }

  @Get('cases/:id')
  getCase(@Param('id') id: string) {
    return this.handbookService.getCaseById(id);
  }

  @Get('cases/topic/:topicId')
  getCasesByTopicId(@Param('topicId') topicId: string) {
    return this.handbookService.getCasesByTopicId(topicId);
  }

  @Post('cases')
  createCase(@Body() input: CreateHandbookCaseDto) {
    return this.handbookService.createCase(input);
  }

  @Patch('cases/:id')
  updateCase(@Param('id') id: string, @Body() input: UpdateHandbookCaseDto) {
    return this.handbookService.updateCase(id, input);
  }

  @Delete('cases/:id')
  deleteCase(@Param('id') id: string) {
    return this.handbookService.deleteCase(id);
  }

  @Patch('update-slugs')
  async updateSlugs() {
    return this.handbookService.generateSlugs();
  }
}
