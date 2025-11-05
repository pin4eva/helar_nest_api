import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true, id: true })
export class ReportComment {
  @Field(() => ID)
  id: string;
  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: true })
  reportId: string;

  @Prop({ type: Types.ObjectId, required: true })
  @Field(() => ID)
  authorId: string;

  @Field()
  @Prop({ type: String, required: true })
  comment: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}

export const ReportCommentSchema = SchemaFactory.createForClass(ReportComment);

@ObjectType()
@Schema({ timestamps: true, id: true })
export class ReportCommentLike {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: true })
  reportCommentId: string;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: true })
  userId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}

export const ReportCommentLikeSchema =
  SchemaFactory.createForClass(ReportCommentLike);
