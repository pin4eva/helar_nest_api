import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { UserModule } from './user/user.module';
import { ReportsModule } from './reports/reports.module';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvMongo from '@keyv/mongo';
import { environments } from './utils/environments';
import { MulterModule } from '@nestjs/platform-express';
import { EmailModule } from './email/email.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubjectModule } from './subject/subject.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { HandbookModule } from './handbook/handbook.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(),
    ReportsModule,
    CacheModule.register({
      isGlobal: true,
      stores: [
        new Keyv(
          new KeyvMongo({
            url: environments.MONGO_URL,
            collection: 'cache',
          }),
        ),
      ],
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    EmailModule,
    PrismaModule,
    SubjectModule,
    HandbookModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
