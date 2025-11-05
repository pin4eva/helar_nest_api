import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { UserResolver } from './resolvers/user.resolver';
import { Auth, AuthSchema } from './schema/auth.schema';
import { User, UserSchema } from './schema/user.schema';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

@Module({
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, UserResolver],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Auth.name, schema: AuthSchema },
    ]),
  ],
  exports: [UserService, AuthService],
})
export class UserModule {}
