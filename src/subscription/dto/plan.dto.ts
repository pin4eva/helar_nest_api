import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { PlanIntervalEnum } from 'src/generated/enums';

export class CreatePlanDTO {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsInt()
  amount: number;
  @ApiProperty({ default: 'monthly' })
  @IsEnum(PlanIntervalEnum)
  interval: PlanIntervalEnum;
  @ApiProperty({ default: 'NGN' })
  description?: string;
}

export interface Authorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: string;
}

export interface Subscription {
  customer: number;
  plan: number;
  integration: number;
  domain: string;
  start: number;
  status: string;
  quantity: number;
  amount: number;
  subscription_code: string;
  email_token: string;
  authorization: Authorization;
  easy_cron_id?: any;
  cron_expression: string;
  next_payment_date: string;
  open_invoice?: any;
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Data {
  subscriptions: Subscription[];
  integration: number;
  domain: string;
  name: string;
  plan_code: string;
  description?: any;
  amount: number;
  interval: PlanIntervalEnum;
  send_invoices: boolean;
  send_sms: boolean;
  hosted_page: boolean;
  hosted_page_url?: any;
  hosted_page_summary?: any;
  currency: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  total: number;
  skipped: number;
  perPage: number;
  page: number;
  pageCount: number;
}

export class PaystackPlanListResponse {
  status: boolean;
  message: string;
  data: Data[];
  meta: Meta;
}

export interface CreatePlanResponse {
  status: boolean;
  message: string;
  data: Data;
}
