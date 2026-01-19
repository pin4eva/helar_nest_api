import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
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
  }
  async onModuleInit() {
    // this.$extends(withAccelerate());
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
