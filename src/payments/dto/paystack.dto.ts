import {
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentTypeEnumLocal } from './payment.dto';

export class PaystackInitDto {
  @IsEmail()
  email!: string;

  @IsInt()
  amount!: number; // amount in major currency unit (e.g. NGN)

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  subscriptionId?: string;

  @IsOptional()
  @IsEnum(PaymentTypeEnumLocal)
  type?: PaymentTypeEnumLocal;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
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

export interface Data {
  customer: number;
  plan: number;
  integration: number;
  domain: string;
  start: number;
  status: string;
  quantity: number;
  amount: number;
  authorization: Authorization;
  subscription_code: string;
  next_payment_date?: string | Date;
  email_token: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaystackSubscriptionResponse {
  status: boolean;
  message: string;
  data: Data;
}
export interface History {
  type: string;
  message: string;
  time: number;
}

export interface Log {
  start_time: number;
  time_spent: number;
  attempts: number;
  errors: number;
  success: boolean;
  mobile: boolean;
  input: any[];
  history: History[];
}

export interface Custom_field {
  display_name: string;
  variable_name: string;
  value: string;
}

export interface Metadata {
  custom_fields: Custom_field[];
}

export interface Customer {
  id: number;
  first_name?: any;
  last_name?: any;
  email: string;
  phone?: any;
  metadata: Metadata;
  customer_code: string;
  risk_action: string;
}

export interface Plan {}

export interface Split {}

export interface Subaccount {}

export interface Source {
  source: string;
  type: string;
  identifier?: any;
  entry_point: string;
}

export interface VerifyPaymentDataResponse {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message?: any;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata?: any;
  log: Log;
  fees: number;
  fees_split?: any;
  customer: Customer;
  authorization: Authorization;
  plan: Plan;
  split: Split;
  subaccount: Subaccount;
  order_id?: any;
  paidAt: string;
  createdAt: string;
  requested_amount: number;
  source: Source;
  connect?: any;
  pos_transaction_data?: any;
}

interface Meta {
  next: string;
  previous?: any;
  perPage: number;
}

export interface VerifyPaystackPaymentResponse {
  status: boolean;
  message: string;
  data: VerifyPaymentDataResponse;
  meta: Meta;
}
