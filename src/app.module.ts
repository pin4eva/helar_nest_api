import KeyvMongo from '@keyv/mongo';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import Keyv from 'keyv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { HandbookModule } from './handbook/handbook.module';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { SubjectModule } from './subject/subject.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SummaryModule } from './summary/summary.module';
import { UserModule } from './user/user.module';
import { environments } from './utils/environments';

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
    SummaryModule,
    SubscriptionModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
