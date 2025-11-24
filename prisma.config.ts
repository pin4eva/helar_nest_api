import 'dotenv/config';
import { defineConfig, env, PrismaConfig } from 'prisma/config';

const database = {
  DATABASE_URL: env('DATABASE_URL') || '',
  DATABASE_NAME: env('DATABASE_NAME') || 'helar_2',
  DATABASE_HOST: env('DATABASE_HOST') || 'localhost',
  DATABASE_PORT: env('DATABASE_PORT') || '5432',
  DATABASE_USER: env('DATABASE_USER') || 'postgres',
  DATABASE_PASSWORD: env('DATABASE_PASSWORD') || '',
};
if (database.DATABASE_HOST.includes('prisma.io')) {
  database.DATABASE_URL = `postgresql://${database.DATABASE_USER}:${database.DATABASE_PASSWORD}@${database.DATABASE_HOST}:${database.DATABASE_PORT}/${database.DATABASE_NAME}?sslmode=require`;
}

const config: PrismaConfig = {
  schema: './prisma/schema.prisma',
  datasource: {
    url: database.DATABASE_URL,
  },
};

export default defineConfig(config);
