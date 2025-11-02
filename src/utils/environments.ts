export const environments = {
  JWT_SECRETS: process.env.JWT_SECRET || 'jdjdjdjdj',
  COOKIE_NAME: '__helar',
  USER_COOKIE: '__user',
  APP_COOKIE_NAME: '__helar_app',
  CLOUDINARY_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET: process.env.CLOUDINARY_API_SECRET,
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  MAIL_SENDER: {
    email: 'no-reply@helar.law',
    name: 'Helar Law',
  },
};
