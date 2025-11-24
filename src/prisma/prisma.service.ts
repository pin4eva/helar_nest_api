import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/client';
import { Pool } from 'pg';
import { environments } from 'src/utils/environments';
// import { withAccelerate } from '@prisma/extension-accelerate';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const db = environments.database;

    const connectionString = db.DATABASE_URL;
    console.log('connectionString:', connectionString);

    const pool = new Pool({
      connectionString,
    });
    pool.on('connect', () => {
      console.log('Connected to the database');
    });
    const adapter = new PrismaPg(pool);
    // super({ accelerateUrl: connectionString });
    super({ adapter });
  }
  async onModuleInit() {
    // this.$extends(withAccelerate());
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
