import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { FinalBarExamsService } from './final_bar_exams.service';
import { CreateBarExamDto, UpdateBarExamDto } from './final_bar_exams.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/generated/client';

@ApiTags('Final Bar Exams')
@ApiBearerAuth()
@Controller('final-bar-exams')
export class FinalBarExamsController {
  constructor(private readonly finalBarExamsService: FinalBarExamsService) {}

  @Public()
  @Get()
  async findAll() {
    return this.finalBarExamsService.findAll();
  }

  @Public()
  @Get('subjects')
  async findAllSubjectsWithExam() {
    return this.finalBarExamsService.findAllSubjectsWithQnA();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.finalBarExamsService.findOne(id);
  }

  @Post()
  async create(@Body() input: CreateBarExamDto, @CurrentUser() user: User) {
    return this.finalBarExamsService.create(input, user);
  }

  @Put()
  async update(@Body() input: UpdateBarExamDto, @CurrentUser() user: User) {
    return this.finalBarExamsService.update(input, user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.finalBarExamsService.delete(id);
  }
}
