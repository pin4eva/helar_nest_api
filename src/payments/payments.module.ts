import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaystackWebhookController } from './controllers/paystack.controller';
import { PaymentsService } from './services/payments.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaystackService } from './services/paystack.service';

@Module({
  controllers: [PaymentsController, PaystackWebhookController],
  providers: [PaymentsService, PrismaService, PaystackService],
})
export class PaymentsModule {}
