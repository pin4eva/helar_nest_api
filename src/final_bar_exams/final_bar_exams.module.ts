import { Module } from '@nestjs/common';
import { FinalBarExamsService } from './final_bar_exams.service';
import { FinalBarExamsController } from './final_bar_exams.controller';

@Module({
  controllers: [FinalBarExamsController],
  providers: [FinalBarExamsService],
})
export class FinalBarExamsModule {}
