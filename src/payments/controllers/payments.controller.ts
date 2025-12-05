import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import type { CreatePaymentDto } from '../dto/payment.dto';
import { PaystackInitDto } from '../dto/paystack.dto';
import { PaymentsService } from '../services/payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post('transactions')
  create(@Body() body: CreatePaymentDto) {
    return this.service.createTransaction(body);
  }

  @Get('transactions')
  list(@Query() query: { userId?: string; subscriptionId?: string }) {
    return this.service.list(query);
  }

  @Get('transactions/:id')
  get(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('paystack/initiate')
  initiatePaystack(@Body() body: PaystackInitDto) {
    return this.service.initiatePaystackPayment(body);
  }

  @Get('paystack/verify/:reference')
  verifyPaystack(@Param('reference') reference: string) {
    return this.service.verifyPaystackTransaction(reference);
  }
}
