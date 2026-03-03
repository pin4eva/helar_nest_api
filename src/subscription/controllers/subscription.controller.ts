import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  SubscriptionQueryDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  PostSubscriptionPaymentDTO,
} from '../dto/subscription.dto';
import { SubscriptionService } from '../services/subscription.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  @Post()
  create(@Body() input: CreateSubscriptionDto) {
    return this.service.create(input);
  }

  @UseGuards(AuthGuard)
  @Post('post-payment')
  postPayment(@Body() input: PostSubscriptionPaymentDTO) {
    return this.service.postPayment(input);
  }

  @Get()
  list(@Query() query: SubscriptionQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdateSubscriptionDto) {
    return this.service.update(id, input);
  }

  // @UseGuards(AuthGuard)
  @Post(':id/toggle-autorenewal')
  toggleAutorenewal(@Param('id') id: string) {
    return this.service.toggleAutorenewal(id);
  }

  // @UseGuards(AuthGuard)
  // @Post(':id/enable-autorenewal')
  // enableAutorenewal(@Param('id') id: string) {
  //   return this.service.enableAutorenewal(id);
  // }
}
