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
];

const prodOrigins = ['https://*.helar.law', 'https://*.vercel.app'];

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(express.json({ limit: '50mb' }));
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins,
    credentials: true,
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
