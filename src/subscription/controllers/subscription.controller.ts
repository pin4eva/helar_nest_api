import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  SubscriptionQueryDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '../dto/subscription.dto';
import { SubscriptionService } from '../services/subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  @Post()
  create(@Body() input: CreateSubscriptionDto) {
    return this.service.create(input);
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

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }
}
