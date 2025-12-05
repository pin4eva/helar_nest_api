import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionService } from './services/subscription.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PrismaService],
})
export class SubscriptionModule {}
