import { Injectable } from '@nestjs/common';
import type { Prisma } from 'src/generated/client';
import { PrismaService } from 'src/prisma/prisma.service';

import type {
  UpdateSubscriptionDto,
  SubscriptionQueryDto,
  CreateSubscriptionDto,
} from '../dto/subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSubscriptionDto) {
    const { status, ...rest } = data;
    const meta = this.mergeStatus(rest as unknown as Prisma.JsonValue, status);

    const createData: Prisma.SubscriptionCreateInput = {
      ...rest,
      reference: this.generateReference(),
      currency: rest.currency ?? 'NGN',
      meta,
    };

    return this.prisma.subscription.create({ data: createData });
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

  async cancel(id: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) return null;

    return this.prisma.subscription.update({
      where: { id },
      data: {
        autoRenew: false,
        cancelledAt: new Date(),
        meta: this.mergeStatus(sub.meta, 'Cancelled'),
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
