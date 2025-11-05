import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@Schema({ timestamps: true, id: true })
export class Auth {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  salt: string;

  @Prop({ type: String })
  iterations: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
