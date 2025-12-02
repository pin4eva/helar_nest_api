import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';

let cachedApp: NestExpressApplication | null = null;

const devOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8000',
  'https://dev-helar-nuxt.vercel.app',
  'https://helar-nuxt.vercel.app',
  'https://helar-dev.ububa.org',
  'https://helar.ububa.org',
];

const prodOrigins = [
  'https://helar.law',
  'https://dev-helar-nuxt.vercel.app',
  'https://helar-nuxt.vercel.app',
  // UBUBA hostnames used in production
  'https://helar.ububa.org',
  'https://helar-dev.ububa.org',
];

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use(express.json({ limit: '50mb' }));

  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = Array.from(
    new Set(isProduction ? prodOrigins : [...prodOrigins, ...devOrigins]),
  );

  // Log allowed origins to aid debugging on startup
  Logger.debug('CORS allowed origins: ' + allowedOrigins.join(', '));

  app.enableCors({
    origin: (origin, callback) => {
      // When the request is from a non-browser client (e.g. server-to-server, curl), origin is undefined
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow exact subdomain match for helar.ububa.org if present in allowedOrigins
      // (Optional) Add more flexible matching if needed in future
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth({
      name: 'Authorization',
      type: 'http',
      scheme: 'Bearer',
      bearerFormat: 'Bearer',
      in: 'header',
    })
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config, {
    autoTagControllers: true,
  });

  SwaggerModule.setup('api/docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
  });

  await app.init();
  cachedApp = app;
  return app;
}

bootstrap().then((app) => {
  app.listen(process.env.PORT ?? 8000, async () => {
    const url = await app.getUrl();
    Logger.debug(`Server is running on ${url}`);
  });
});
