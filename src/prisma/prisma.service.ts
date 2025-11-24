import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/client';
import { Pool } from 'pg';
import { environments } from 'src/utils/environments';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const DATABASE_URL = environments.DATABASE_URL;
    const pool = new Pool({
      connectionString: DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
  async onModuleInit() {}

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
