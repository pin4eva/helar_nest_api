import { Module } from '@nestjs/common';
import { SubjectService } from './services/subject.service';
import { SubjectController } from './controllers/subject.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PlanController } from '../subscription/controllers/plan.controller';
import { PlanService } from '../subscription/services/plan.service';

@Module({
  controllers: [SubjectController, PlanController],
  providers: [SubjectService, PrismaService, PlanService],
})
export class SubjectModule {}
