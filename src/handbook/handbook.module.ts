import { Module } from '@nestjs/common';
import { HandbookService } from './services/handbook.service';
import { HandbookController } from './controllers/handbook.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [HandbookController],
  providers: [HandbookService, PrismaService],
})
export class HandbookModule {}
