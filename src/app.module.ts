import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(),
    ReportsModule,
    // MongooseModule.forRoot(process.env.MONGO_URL || ''),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
