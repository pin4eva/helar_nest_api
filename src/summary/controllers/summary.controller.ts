import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SummaryService } from '../services/summary.service';
import {
  CreateSummaryTopicDto,
  UpdateSummaryTopicDto,
} from '../dto/summary-topic.dto';
import {
  CreateSummaryCaseDto,
  UpdateSummaryCaseDto,
} from '../dto/summary-case.dto';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  // Topics
  @Get('topics')
  getTopics() {
    return this.summaryService.listTopics();
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
    return this.summaryService.getCasesByTopicId(topicId);
  }

  @Get('cases/:id')
  getCase(@Param('id') id: string) {
    return this.summaryService.getCaseById(id);
  }

  @Post('cases')
  createCase(@Body() input: CreateSummaryCaseDto) {
    return this.summaryService.createCase(input);
  }

  @Patch('cases/:id')
  updateCase(@Param('id') id: string, @Body() input: UpdateSummaryCaseDto) {
    return this.summaryService.updateCase(id, input);
  }

  @Delete('cases/:id')
  deleteCase(@Param('id') id: string) {
    return this.summaryService.deleteCase(id);
  }
}
