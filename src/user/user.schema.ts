import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, id: true })
export class User {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  email: string;

  // @Prop({ required: true })
  // password: string;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
