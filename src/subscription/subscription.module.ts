import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionService } from './services/subscription.service';
import { PaystackService } from 'src/payments/services/paystack.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PrismaService, PaystackService],
})
export class SubscriptionModule {}
