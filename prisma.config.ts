import 'dotenv/config';
import { defineConfig, env, PrismaConfig } from 'prisma/config';

const config: PrismaConfig = {
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
};

export default defineConfig(config);
