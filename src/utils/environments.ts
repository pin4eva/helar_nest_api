import * as dotenv from 'dotenv';
import ms from 'ms';

dotenv.config();

export const environments = {
  JWT_SECRETS: process.env.JWT_SECRET || 'jdjdjdjdj',
  ACCESS_TOKEN_EXPIRY: '15m' as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: '7d' as ms.StringValue,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  OLD_DATABASE_URL: process.env.OLD_DATABASE_URL || '',
  MONGO_URL: process.env.MONGO_URL || '',
  COOKIE_NAME: '__helar',
  USER_COOKIE: '__user',
  APP_COOKIE_NAME: '__helar_app',
  CLOUDINARY_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET: process.env.CLOUDINARY_API_SECRET,
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_BASE_URL: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  CA_CERTIFICATE: process.env.CA_CERTIFICATE || '',
  MAIL_SENDER: {
    email: 'no-reply@helar.law',
    name: 'Helar Law',
  },
};
