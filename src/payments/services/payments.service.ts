import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import type { PaymentTransaction, Prisma } from 'src/generated/client';
import { PaymentStatusEnum, PaymentTypeEnum } from 'src/generated/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CreatePaymentDto } from '../dto/payment.dto';
import type { PaystackInitDto } from '../dto/paystack.dto';

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async initiatePaystackPayment(input: PaystackInitDto) {
    const secret = this.ensurePaystackSecret();
    const reference = input.reference ?? this.generateReference('psk');
    const currency = input.currency ?? 'NGN';
    const type = this.normalizePaymentType(input.type);

    const payload = {
      email: input.email,
      amount: this.toPaystackAmount(input.amount),
      currency,
      reference,
      callback_url: input.callbackUrl,
      metadata: {
        userId: input.userId,
        subscriptionId: input.subscriptionId,
        type,
        ...(input.metadata ?? {}),
      },
    };

    const apiResponse = await this.callPaystack('transaction/initialize', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${secret}` },
    });

    const data = this.asRecord(apiResponse.data);
    const authUrl = this.getString(data, 'authorization_url');
    const accessCode = this.getString(data, 'access_code');
    const providerTxnId =
      this.getString(data, 'id') ??
      (this.getNumber(data, 'id') ? String(this.getNumber(data, 'id')) : null);

    const transactionPayload = {
      provider: 'paystack',
      providerTransactionId: providerTxnId,
      reference,
      amount: input.amount,
      currency,
      status: PaymentStatusEnum.Pending,
      type,
      response: this.parseJsonValue(apiResponse) ?? {},
      userId: input.userId,
      subscriptionId: input.subscriptionId,
    } satisfies Prisma.PaymentTransactionUncheckedCreateInput;

    const existing = await this.prisma.paymentTransaction.findFirst({
      where: { reference },
    });

    if (existing) {
      await this.prisma.paymentTransaction.update({
        where: { id: existing.id },
        data: transactionPayload,
      });
    } else {
      await this.prisma.paymentTransaction.create({ data: transactionPayload });
    }

    return {
      authorizationUrl: authUrl,
      accessCode,
      reference,
    };
  }

  async verifyPaystackTransaction(reference: string) {
    const secret = this.ensurePaystackSecret();
    const apiResponse = await this.callPaystack(
      `transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${secret}` },
      },
    );
    const data = this.asRecord(apiResponse.data);
    const paystackStatus = (this.getString(data, 'status') ?? '').toLowerCase();
    const paymentStatus =
      paystackStatus === 'success'
        ? PaymentStatusEnum.Paid
        : PaymentStatusEnum.Failed;

    const amount = this.normalizePaystackAmount(this.getNumber(data, 'amount'));
    const currency = this.getString(data, 'currency') ?? 'NGN';
    const providerTxnId =
      this.getString(data, 'id') ??
      (this.getNumber(data, 'id') ? String(this.getNumber(data, 'id')) : null);
    const metadata = this.asRecord(data?.['metadata']);
    const subscriptionId = this.getString(metadata, 'subscriptionId');
    const userId = this.getString(metadata, 'userId');
    const type = this.normalizePaymentType(
      this.getString(metadata, 'type') as unknown as PaymentTypeEnum,
    );

    const existing = await this.prisma.paymentTransaction.findFirst({
      where: { reference },
    });

    if (existing) {
      await this.prisma.paymentTransaction.update({
        where: { id: existing.id },
        data: {
          provider: 'paystack',
          providerTransactionId: providerTxnId,
          amount,
          currency,
          status: paymentStatus,
          type,
          response: this.parseJsonValue(apiResponse) ?? {},
          userId: userId ?? existing.userId,
          subscriptionId: subscriptionId ?? existing.subscriptionId,
        },
      });
    } else {
      await this.prisma.paymentTransaction.create({
        data: {
          provider: 'paystack',
          providerTransactionId: providerTxnId,
          reference,
          amount,
          currency,
          status: paymentStatus,
          type,
          response: this.parseJsonValue(apiResponse) ?? {},
          userId,
          subscriptionId,
        },
      });
    }

    if (subscriptionId && paymentStatus === PaymentStatusEnum.Paid) {
      const sub = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });
      if (sub) {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: {
            meta: this.mergeSubscriptionStatus(sub.meta, 'Active'),
          },
        });
      }
    }

    return {
      status: paymentStatus,
      reference,
      amount,
      currency,
      providerTransactionId: providerTxnId,
    };
  }

  async createTransaction(input: CreatePaymentDto) {
    const response = this.parseJsonValue(input.response) ?? {};

    return this.prisma.paymentTransaction.create({
      data: {
        userId: input?.userId,
        subscriptionId: input?.subscriptionId,
        provider: input.provider,
        providerTransactionId: input.providerTransactionId ?? null,
        reference: input.reference ?? null,
        amount: input.amount,
        currency: input.currency ?? 'NGN',
        status: input.status as unknown as PaymentStatusEnum,
        type: input.type as unknown as PaymentTypeEnum,
        response,
      },
    });
  }

  async list(_query: unknown) {
    const q = _query as { userId?: string; subscriptionId?: string };
    const where: Prisma.PaymentTransactionWhereInput = {};
    if (q.userId) where.userId = q.userId;
    if (q.subscriptionId) where.subscriptionId = q.subscriptionId;
    return await this.prisma.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(_id: string) {
    return this.prisma.paymentTransaction.findUnique({ where: { id: _id } });
  }

  async handlePaystackWebhook(payload: unknown, signature?: string) {
    // Verify webhook signature using PAYSTACK_SECRET
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      this.logger.warn('PAYSTACK_SECRET not set; webhook will not be verified');
    } else if (signature) {
      const computed = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      if (computed !== signature) {
        this.logger.warn('Invalid Paystack signature');
        throw new Error('Invalid signature');
      }
    }

    // Basic processing: handle charge.success and subscription events
    const body = payload as Record<string, unknown>;
    const event = body?.['event'] as string | undefined;
    const data = body?.['data'] as Record<string, unknown> | undefined;

    if (!event || !data) return { ok: true };

    // Handle charge.success - create payment transaction
    if (event === 'charge.success') {
      const providerTxnId =
        this.getString(data, 'id') ??
        this.getString(this.getObj(data, 'transaction'), 'id') ??
        null;
      const reference =
        this.getString(data, 'reference') ??
        this.getString(this.getObj(data, 'transaction'), 'reference') ??
        null;
      const amount = this.normalizePaystackAmount(
        this.getNumber(data, 'amount') ??
          this.getNumber(this.getObj(data, 'transaction'), 'amount'),
      );

      // upsert by providerTransactionId or reference
      let existing: PaymentTransaction | null = null;
      if (providerTxnId) {
        existing = await this.prisma.paymentTransaction.findFirst({
          where: { providerTransactionId: providerTxnId },
        });
      }
      if (!existing && reference) {
        existing = await this.prisma.paymentTransaction.findFirst({
          where: { reference },
        });
      }

      const payloadStr = JSON.stringify(data);
      if (existing) {
        await this.prisma.paymentTransaction.update({
          where: { id: existing.id },
          data: { status: 'Paid', response: JSON.parse(payloadStr) },
        });
      } else {
        await this.prisma.paymentTransaction.create({
          data: {
            provider: 'paystack',
            providerTransactionId: providerTxnId,
            reference: reference,
            amount: amount,
            currency: 'NGN',
            status: 'Paid',
            type: 'Initial',
            response: JSON.parse(payloadStr),
          },
        });
      }
    }

    // handle subscription lifecycle events
    if (event?.startsWith('subscription')) {
      const providerSubId =
        this.getString(data, 'id') ??
        this.getString(this.getObj(data, 'subscription'), 'id') ??
        this.getString(data, 'subscription_code');
      const statusFromProvider =
        this.getString(data, 'status') ??
        this.getString(this.getObj(data, 'subscription'), 'status');

      if (providerSubId) {
        const sub = await this.prisma.subscription.findFirst({
          where: { providerSubscriptionId: providerSubId },
        });
        if (sub) {
          // map provider status to our enum
          if (event === 'subscription.deactivated') {
            await this.prisma.subscription.update({
              where: { id: sub.id },
              data: {
                cancelledAt: new Date(),
                autoRenew: false,
                meta: this.mergeSubscriptionStatus(sub.meta, 'Cancelled'),
              },
            });
          } else if (statusFromProvider) {
            // try to map provider status names to our enum
            const existingStatus = this.extractStatusFromMeta(sub.meta);
            let newStatus = existingStatus ?? 'Active';
            const s = statusFromProvider.toLowerCase();
            if (s === 'active' || s === 'subscribed') newStatus = 'Active';
            if (s === 'trialing') newStatus = 'Trialing';
            if (s === 'cancelled' || s === 'inactive') newStatus = 'Cancelled';
            if (s === 'past_due' || s === 'past-due') newStatus = 'PastDue';

            await this.prisma.subscription.update({
              where: { id: sub.id },
              data: { meta: this.mergeSubscriptionStatus(sub.meta, newStatus) },
            });
          }
        }
      }
    }

    // handle invoice.payment_failed -> mark subscription past due
    if (event === 'invoice.payment_failed') {
      const providerSubId =
        this.getString(data, 'subscription') ??
        this.getString(data, 'subscription_id');
      if (providerSubId) {
        const sub = await this.prisma.subscription.findFirst({
          where: { providerSubscriptionId: providerSubId },
        });
        if (sub) {
          await this.prisma.subscription.update({
            where: { id: sub.id },
            data: {
              meta: this.mergeSubscriptionStatus(sub.meta, 'PastDue'),
            },
          });
        }
      }
    }

    // handle refund events
    if (event === 'refund') {
      const providerTxnId =
        this.getString(data, 'id') ??
        this.getString(data, 'transaction') ??
        null;
      const reference = this.getString(data, 'reference') ?? null;
      const amount = this.normalizePaystackAmount(
        this.getNumber(data, 'amount') ?? 0,
      );

      await this.prisma.paymentTransaction.create({
        data: {
          provider: 'paystack',
          providerTransactionId: providerTxnId,
          reference: reference,
          amount: amount,
          currency: this.getString(data, 'currency') ?? 'NGN',
          status: 'Refunded',
          type: 'Refund',
          response: this.parseJsonValue(data) ?? {},
        },
      });
    }

    return { ok: true };
  }

  private ensurePaystackSecret(): string {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error('PAYSTACK_SECRET_KEY not set');
    return secret;
  }

  private async callPaystack<T = Record<string, unknown>>(
    path: string,
    init: RequestInit,
  ): Promise<T & { status?: boolean; message?: string; data?: unknown }> {
    const url = `https://api.paystack.co/${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    } as Record<string, string>;

    const res = await fetch(url, { ...init, headers });
    const json = (await res.json()) as T & {
      status?: boolean;
      message?: string;
      data?: unknown;
    };

    if (!res.ok || json?.status === false) {
      const message =
        json?.message ?? `Paystack request failed (${res.status})`;
      this.logger.warn(message);
      throw new Error(message);
    }

    return json;
  }

  private toPaystackAmount(amountMajor: number): number {
    return Math.max(0, Math.round(amountMajor * 100));
  }

  private normalizePaymentType(
    type?: string | PaymentTypeEnum,
  ): PaymentTypeEnum {
    const fallback = PaymentTypeEnum.Initial;
    if (!type) return fallback;
    const asEnum = type as PaymentTypeEnum;
    return Object.values(PaymentTypeEnum).includes(asEnum) ? asEnum : fallback;
  }

  private generateReference(prefix = 'psk'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private asRecord(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  }

  private parseJsonValue(value: unknown): Prisma.JsonValue | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'object') return value as Prisma.JsonValue;

    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as Prisma.JsonValue;
      } catch (error) {
        this.logger.warn('Failed to parse payment response JSON; storing raw');
        return { raw: value } as Prisma.JsonValue;
      }
    }

    return { raw: value } as Prisma.JsonValue;
  }

  private getObj(
    obj: Record<string, unknown> | undefined,
    key: string,
  ): Record<string, unknown> | undefined {
    if (!obj) return undefined;
    const v = obj[key];
    return typeof v === 'object' && v !== null
      ? (v as Record<string, unknown>)
      : undefined;
  }

  private getString(
    obj: Record<string, unknown> | undefined,
    key: string,
  ): string | undefined {
    if (!obj) return undefined;
    const v = obj[key];
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    return undefined;
  }

  private getNumber(
    obj: Record<string, unknown> | undefined,
    key: string,
  ): number | undefined {
    if (!obj) return undefined;
    const v = obj[key];
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    }
    return undefined;
  }

  private normalizePaystackAmount(amountInMinor?: number): number {
    if (!amountInMinor || Number.isNaN(amountInMinor)) return 0;

    // Paystack sends amounts in kobo; divide by 100 when it looks like kobo.
    if (amountInMinor % 100 === 0) {
      return Math.round(amountInMinor / 100);
    }

    return Math.round(amountInMinor);
  }

  private extractStatusFromMeta(
    meta: Prisma.JsonValue | null | undefined,
  ): string | undefined {
    if (!meta || typeof meta !== 'object' || Array.isArray(meta))
      return undefined;
    const status = (meta as Record<string, unknown>)['status'];
    return typeof status === 'string' ? status : undefined;
  }

  private mergeSubscriptionStatus(
    meta: Prisma.JsonValue | null | undefined,
    status: string,
  ): Prisma.InputJsonValue {
    const base: Record<string, unknown> = {};
    if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
      Object.assign(base, meta as Record<string, unknown>);
    }
    base.status = status;
    return base as Prisma.InputJsonValue;
  }
}
