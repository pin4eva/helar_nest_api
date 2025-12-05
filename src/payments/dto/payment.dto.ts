import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export enum PaymentStatusEnumLocal {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
  Refunded = 'Refunded',
}

export enum PaymentTypeEnumLocal {
  Initial = 'Initial',
  Renewal = 'Renewal',
  Refund = 'Refund',
}

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  subscriptionId?: string;

  @IsString()
  provider!: string; // 'paystack'

  @IsOptional()
  @IsString()
  providerTransactionId?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsInt()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsEnum(PaymentStatusEnumLocal)
  status!: PaymentStatusEnumLocal;

  @IsEnum(PaymentTypeEnumLocal)
  type!: PaymentTypeEnumLocal;

  @IsOptional()
  @IsString()
  response?: string; // raw JSON string (or consider Json in model)
}
