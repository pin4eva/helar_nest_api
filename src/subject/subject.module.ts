import { Module } from '@nestjs/common';
import { SubjectService } from './services/subject.service';
import { SubjectController } from './controllers/subject.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SubjectController],
  providers: [SubjectService, PrismaService],
})
export class SubjectModule {}
