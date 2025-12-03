import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SummaryService } from '../services/summary.service';
import {
  CreateSummaryTopicDto,
  SummaryTopicsQueryDto,
  UpdateSummaryTopicDto,
} from '../dto/summary-topic.dto';
import {
  CreateSummaryCaseDto,
  UpdateSummaryCaseDto,
} from '../dto/summary-case.dto';
import { SummarySearchQueryDto } from '../dto/summary-search.dto';
import { SummaryTypeEnum } from 'src/generated/enums';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  // Search
  @Get('search')
  search(@Query() query: SummarySearchQueryDto) {
    return this.summaryService.search(query);
  }

  // Topics
  @Get('topics')
  getTopics() {
    return this.summaryService.listTopics();
  }

  @Get('topics/subjects')
  getTopicSubjects(@Query('type') type?: SummaryTypeEnum) {
    return this.summaryService.getTopicSubjects(type);
  }

  @Get('topics/subject-slug')
  getTopicsBySubjectSlug(@Query() query: SummaryTopicsQueryDto) {
    return this.summaryService.getTopicsBySubjectSlug(query);
  }

  @Get('topics/slug/:slug')
  getTopicBySlug(@Param('slug') slug: string) {
    return this.summaryService.getTopicBySlug(slug);
  }

  @Get('topics/:id')
  getTopic(@Param('id') id: string) {
    return this.summaryService.getTopicById(id);
  }

  @Post('topics')
  createTopic(@Body() input: CreateSummaryTopicDto) {
    return this.summaryService.createTopic(input);
  }

  @Patch('topics/:id')
  updateTopic(@Param('id') id: string, @Body() input: UpdateSummaryTopicDto) {
    return this.summaryService.updateTopic(id, input);
  }

  @Delete('topics/:id')
  deleteTopic(@Param('id') id: string) {
    return this.summaryService.deleteTopic(id);
  }

  // Cases
  @Get('cases')
  getCases() {
    return this.summaryService.listCases();
  }

  @Get('topics/:topicId/cases')
  getCasesByTopic(@Param('topicId') topicId: string) {
    return this.summaryService.getCasesByTopicIdOrTopicSlug(topicId);
  }

  @Get('cases/:id')
  getCase(@Param('id') id: string) {
    return this.summaryService.getCaseById(id);
  }

  @Post('cases')
  createCase(@Body() input: CreateSummaryCaseDto) {
    return this.summaryService.createCase(input);
  }

  @Put('cases')
  updateCase(@Body() input: UpdateSummaryCaseDto) {
    return this.summaryService.updateCase(input);
  }

  @Delete('cases/:id')
  deleteCase(@Param('id') id: string) {
    return this.summaryService.deleteCase(id);
  }
}
