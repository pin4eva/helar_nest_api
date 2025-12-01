import { Module } from '@nestjs/common';
import { SummaryService } from './services/summary.service';
import { SummaryController } from './controllers/summary.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SummaryController],
  providers: [SummaryService, PrismaService],
})
export class SummaryModule {}
