import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePlanDTO,
  CreatePlanResponse,
  PaystackPlanListResponse,
} from '../dto/plan.dto';
import { SubscriptionPlan } from 'src/generated/client';
import axios from 'axios';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPlans() {
    return this.prisma.subscriptionPlan.findMany();
  }

  async getPlanByCode(planCode: string) {
    return this.prisma.subscriptionPlan.findUnique({
      where: { planCode },
    });
  }

  async getPaystackPlans() {
    try {
      const { data } = await axios<PaystackPlanListResponse>(
        `https://api.paystack.co/plan`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      ).catch((error) => {
        throw new BadRequestException(
          `Error fetching paystack plans: ${error.message}`,
        );
      });

      console.log('fetched paystack plans:');
      console.log({ data });

      // const plans = data.data;
      // const subscriptionPlans: SubscriptionPlan[] = [];
      // if (plans.length) {
      //   for (const plan of plans) {
      //     const dbPlan = await this.prisma.subscriptionPlan.upsert({
      //       where: { planCode: plan.plan_code, id: plan.id },
      //       create: {
      //         id: plan.id,
      //         name: plan.name,
      //         planCode: plan.plan_code,
      //         amount: plan.amount,
      //         interval: plan.interval,
      //         description: plan.description,
      //         currency: plan.currency,
      //         integration: plan.integration,
      //       },
      //       update: {
      //         name: plan.name,
      //         amount: plan.amount,
      //         interval: plan.interval,
      //         description: plan.description,
      //         currency: plan.currency,
      //         integration: plan.integration,
      //       },
      //     });

      //     subscriptionPlans.push(dbPlan);
      //   }
      // }

      // return subscriptionPlans;
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createPlan(input: CreatePlanDTO) {
    console.log({ input });

    try {
      const { data } = await axios
        .post<CreatePlanResponse>(
          `https://api.paystack.co/plan`,
          {
            name: input.name,
            amount: Number(input.amount) * 100, // convert to kobo
            interval: input.interval,
            description: input.description,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        )
        .catch((error) => {
          throw new BadRequestException(error?.response?.data);
        });

      const createdPlan = await this.prisma.subscriptionPlan.create({
        data: {
          id: data.data.id,
          name: data.data.name,
          planCode: data.data.plan_code,
          amount: data.data.amount,
          interval: data.data.interval,
          description: data.data.description,
          currency: data.data.currency,
          integration: data.data.integration,
        },
      });

      return createdPlan;
    } catch (error) {
      throw error;
    }
  }
}
