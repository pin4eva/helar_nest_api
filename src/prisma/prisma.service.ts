import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/client';
import { environments } from 'src/utils/environments';
// import { withAccelerate } from '@prisma/extension-accelerate';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = environments.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not defined in the environment variables',
      );
    }

    const adapter = new PrismaPg({ connectionString });
    // super({ accelerateUrl: connectionString });
    super({
      adapter,
      // log:
      //   process.env.NODE_ENV === 'production'
      //     ? ['warn', 'error']
      //     : ['query', 'info', 'warn', 'error'],
    });

    return this.$extends({
      result: {
        report: {
          caseRef: {
            needs: { date: true, reportId: true },
            compute({ date, reportId }) {
                const year = new Date(date).getFullYear();
              return `helar-${year}-${reportId}`;
            }
          }
        }
      }
    }) as this;
  }
  async onModuleInit() {
    // Establish connection to the database when the module initializes
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
