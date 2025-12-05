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
