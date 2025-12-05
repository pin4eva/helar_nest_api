import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  SubscriptionPlanEnum,
  SubscriptionStatusEnum,
} from 'src/generated/enums';

export class CreateSubscriptionDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsInt()
  amount!: number; // stored in smallest currency unit (kobo/cents)

  @IsOptional()
  @IsString()
  currency?: string;

  @IsEnum(SubscriptionPlanEnum)
  plan!: SubscriptionPlanEnum;

  @IsOptional()
  @IsEnum(SubscriptionStatusEnum)
  status?: SubscriptionStatusEnum;

  @IsOptional()
  @IsString()
  provider?: string; // e.g. 'paystack'

  @IsOptional()
  @IsString()
  providerCustomerId?: string;

  @IsOptional()
  @IsString()
  providerSubscriptionId?: string;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsString()
  cancelledReason?: string | null;

  @IsOptional()
  @IsString()
  providerSubscriptionId?: string | null;
}

export class SubscriptionQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  providerSubscriptionId?: string;
}
