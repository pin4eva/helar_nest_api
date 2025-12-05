import { Body, Controller, Headers, Post } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';

@Controller('paystack')
export class PaystackWebhookController {
  constructor(private readonly service: PaymentsService) {}

  @Post('webhook')
  async webhook(
    @Body() payload: unknown,
    @Headers('x-paystack-signature') signature?: string,
  ) {
    // TODO: verify signature and pass payload to service for idempotent processing
    return this.service.handlePaystackWebhook
      ? this.service.handlePaystackWebhook(payload, signature)
      : { ok: true };
  }
}
