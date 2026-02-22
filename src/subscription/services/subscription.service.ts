import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PlanIntervalEnum,
  SubscriptionStatusEnum,
  type Prisma,
} from 'src/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import type {
  UpdateSubscriptionDto,
  SubscriptionQueryDto,
  CreateSubscriptionDto,
  PostSubscriptionPaymentDTO,
} from '../dto/subscription.dto';
import { PaystackService } from 'src/payments/services/paystack.service';
import axios from 'axios';
import { PaystackPlanListResponse } from '../dto/plan.dto';
import { environments } from 'src/utils/environments';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private readonly paystackService: PaystackService,
  ) {}

  async create(data: CreateSubscriptionDto) {
    const { userId, organizationId, ...rest } = data;

    let planCode = rest?.planCode;
    const status: SubscriptionStatusEnum = SubscriptionStatusEnum.Pending;
    const { data: res } = await axios<PaystackPlanListResponse>(
      `${environments.PAYSTACK_BASE_URL}/plan`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${environments.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const foundPlan = res.data.find((plan) => plan.amount === rest.amount);
    if (!foundPlan) {
      throw new BadRequestException('Invalid plan code');
    }

    planCode = foundPlan.plan_code;
    console.log(planCode);

    if (!planCode) {
      const plan = await this.prisma.subscriptionPlan.findFirst({
        where: { interval: rest.plan },
      });
      if (!plan) {
        throw new BadRequestException('Invalid plan interval');
      }
      planCode = plan.planCode;
    }

    // check for active subscription
    const isActiveSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId: data.userId,
        // plan: data.plan,
        status: SubscriptionStatusEnum.Active,
      },
    });
    if (isActiveSubscription) {
      throw new BadRequestException(
        'User already has an active subscription for this plan',
      );
    }

    const existingSub = await this.prisma.subscription.findFirst({
      where: {
        userId: data.userId,
        plan: data.plan,
        status: SubscriptionStatusEnum.Pending,
      },
    });

    if (existingSub) {
      return existingSub;
    }

    const userConnect = userId ? { user: { connect: { id: userId } } } : {};
    const organizationConnect = organizationId
      ? { organization: { connect: { id: organizationId } } }
      : {};
    const meta = this.mergeStatus(rest as unknown as Prisma.JsonValue, status);

    // calculate nextBillingDate based on plan interval (no trials)
    const nextBillingDate = new Date();
    if (rest.plan === PlanIntervalEnum.monthly) {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      Object.assign(meta as Record<string, unknown>, {
        nextBillingDate: nextBillingDate.toISOString(),
      });
    } else if (rest.plan === PlanIntervalEnum.annually) {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      Object.assign(meta as Record<string, unknown>, {
        nextBillingDate: nextBillingDate.toISOString(),
      });
    }

    return this.prisma.subscription.create({
      data: {
        ...userConnect,
        ...organizationConnect,
        amount: rest.amount,
        planCode,
        reference: this.generateReference(),
        currency: rest.currency ?? 'NGN',
        provider: rest.provider ?? 'paystack',
        meta,
        nextBillingAt: nextBillingDate,
      },
    });
  }

  async postPayment(input: PostSubscriptionPaymentDTO) {
    const { subscriptionId, paymentId, reference } = input;
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: { id: subscriptionId },
        include: { user: true, organization: true },
      });
      if (!subscription) {
        throw new BadRequestException('Subscription not found');
      }
      if (subscription.reference !== reference) {
        throw new BadRequestException('Invalid reference for subscription');
      }

      if (!subscription?.planCode) {
        throw new BadRequestException('Subscription plan code not found');
      }

      if (subscription.status === SubscriptionStatusEnum.Active) {
        return subscription;
      }

      // create the subscription payment record on paystack
      const payment = await this.paystackService.verifyPayment(reference);

      if (!payment) {
        throw new BadRequestException('Payment data not found');
      }

      const customer_code =
        payment?.customer?.customer_code || subscription.user?.email || '';

      const subscribe = await this.paystackService.createSubscription(
        customer_code,
        subscription.planCode,
      );

      const nextBillingDate = new Date();
      if (subscribe?.data?.next_payment_date) {
        nextBillingDate.setTime(
          new Date(subscribe.data.next_payment_date).getTime(),
        );
      } else {
        if (subscription.plan === PlanIntervalEnum.monthly) {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else if (subscription.plan === PlanIntervalEnum.annually) {
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }
      }
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatusEnum.Active,
          paymentId: payment.id?.toString() || paymentId,
          providerCustomerId: payment.customer?.id?.toString() || '',
          providerSubscriptionId: subscribe.data.subscription_code,
          providerPlanId: subscribe.data.plan.toString(),
          emailToken: subscribe?.data?.email_token,
          nextBillingAt: nextBillingDate,
          meta: this.mergeStatus(subscription.meta, 'Active'),
        },
      });
      return updatedSubscription;
    } catch (error) {
      throw error;
    }
  }

  async list(query: SubscriptionQueryDto) {
    const where: Prisma.SubscriptionWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.providerSubscriptionId)
      where.providerSubscriptionId = query.providerSubscriptionId;
    if (query.status)
      where.meta = {
        path: ['status'],
        equals: query.status,
      } as unknown as Prisma.JsonNullableFilter;

    return this.prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return this.prisma.subscription.findUnique({ where: { id } });
  }

  async update(id: string, input: UpdateSubscriptionDto) {
    const data: Prisma.SubscriptionUpdateInput = {};
    if (input.autoRenew !== undefined) data.autoRenew = input.autoRenew;
    if (input.cancelledReason !== undefined)
      data.canceledReason = input.cancelledReason;
    if (input.providerSubscriptionId !== undefined)
      data.providerSubscriptionId = input.providerSubscriptionId;

    return this.prisma.subscription.update({ where: { id }, data });
  }

  // async enableAutorenewal(id: string) {
  //   const sub = await this.prisma.subscription.findUnique({ where: { id } });
  //   if (!sub) return null;

  //   const subscriptionCode = sub.providerSubscriptionId;
  //   const emailToken = sub.emailToken;

  //   if (!subscriptionCode || !emailToken) {
  //     throw new BadRequestException('Missing provider subscription data');
  //   }
  //   if (subscriptionCode && emailToken) {
  //     await this.paystackService.enableSubscriptionAutoRenewal(
  //       subscriptionCode,
  //       emailToken,
  //     );
  //   }

  //   return this.prisma.subscription.update({
  //     where: { id },
  //     data: {
  //       autoRenew: true,
  //       cancelledAt: null,
  //       meta: this.mergeStatus(sub.meta, 'Active'),
  //     },
  //   });
  // }

  // async disableAutorenewal(id: string) {
  //   const sub = await this.prisma.subscription.findUnique({ where: { id } });
  //   if (!sub) return null;

  //   const subscriptionCode = sub.providerSubscriptionId;
  //   const emailToken = sub.emailToken;

  //   if (!subscriptionCode || !emailToken) {
  //     throw new BadRequestException('Missing provider subscription data');
  //   }
  //   if (subscriptionCode && emailToken) {
  //     await this.paystackService.disableSubscriptionAutoRenewal(
  //       subscriptionCode,
  //       emailToken,
  //     );
  //   }

  //   return this.prisma.subscription.update({
  //     where: { id },
  //     data: {
  //       autoRenew: false,
  //       cancelledAt: new Date(),
  //       meta: this.mergeStatus(sub.meta, 'Cancelled'),
  //     },
  //   });
  // }

  async toggleAutorenewal(id: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!sub) {
      throw new NotFoundException('Subscription not found');
    }

    const { providerSubscriptionId, emailToken, autoRenew } = sub;

    if (!providerSubscriptionId || !emailToken) {
      throw new BadRequestException('Missing provider subscription data');
    }

    if (autoRenew) {
      console.log('Disabling subscription...');
      await this.paystackService.disableSubscriptionAutoRenewal(
        providerSubscriptionId,
        emailToken,
      );
    } else {
      console.log('Enabling subscription...');
      await this.paystackService.enableSubscriptionAutoRenewal(
        providerSubscriptionId,
        emailToken,
      );
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        autoRenew: !autoRenew,
        cancelledAt: autoRenew ? null : new Date(),
        meta: this.mergeStatus(sub.meta, autoRenew ? 'Active' : 'Cancelled'),
      },
    });
  }

  private mergeStatus(
    meta: Prisma.JsonValue | null | undefined,
    status?: string,
  ): Prisma.InputJsonValue | undefined {
    if (!status) return meta as Prisma.InputJsonValue | undefined;
    const base: Record<string, unknown> = {};
    if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
      Object.assign(base, meta as Record<string, unknown>);
    }
    base.status = status;
    return base as Prisma.InputJsonValue;
  }

  private generateReference() {
    return `sub_${Math.random().toString(36).slice(2, 10)}`;
  }
}
