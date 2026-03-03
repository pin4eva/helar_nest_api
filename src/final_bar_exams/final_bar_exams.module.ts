import { Module } from '@nestjs/common';
import { FinalBarExamsService } from './final_bar_exams.service';
import { FinalBarExamsController } from './final_bar_exams.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FinalBarExamsController],
  providers: [FinalBarExamsService, PrismaService],
})
export class FinalBarExamsModule {}
