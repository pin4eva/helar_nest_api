import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  PlanIntervalEnum,
  SubscriptionPlanEnum,
  SubscriptionStatusEnum,
} from 'src/generated/enums';

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty()
  @IsInt()
  amount: number; // stored in smallest currency unit (kobo/cents)

  @ApiProperty()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty()
  @IsEnum(PlanIntervalEnum)
  plan: PlanIntervalEnum;

  @ApiProperty()
  @IsOptional()
  @IsString()
  planCode?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(SubscriptionStatusEnum)
  status?: SubscriptionStatusEnum;

  @ApiProperty()
  @IsOptional()
  @IsString()
  provider?: string; // e.g. 'paystack'

  @ApiProperty()
  @IsOptional()
  @IsString()
  providerCustomerId?: string;

  @ApiProperty()
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

export class PostSubscriptionPaymentDTO {
  @ApiProperty()
  @IsString()
  subscriptionId: string;

  @ApiProperty()
  @IsString()
  paymentId: string;

  @ApiProperty()
  @IsString()
  reference: string;
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
