import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true, id: true })
export class Bookmark {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Prop({ type: String, required: true })
  reportId: string;

  @Field(() => ID)
  @Prop({ type: String, required: true })
  userId: string;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

@ObjectType()
@Schema({ timestamps: true, id: true })
export class ReportVisit {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: true })
  reportId: string;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: false })
  userId: string;

  @Field()
  @Prop({ type: String, required: false })
  ipAddress: string;
}

export const ReportVisitSchema = SchemaFactory.createForClass(ReportVisit);
