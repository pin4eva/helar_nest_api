import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaystackWebhookController } from './controllers/paystack-webhook.controller';
import { PaymentsService } from './services/payments.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PaymentsController, PaystackWebhookController],
  providers: [PaymentsService, PrismaService],
})
export class PaymentsModule {}
