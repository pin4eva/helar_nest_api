import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { Bookmark, ReportVisit } from './report-bookmark.schema';
import { ReportComment } from './report-comment.schema';

@ObjectType()
@Schema({ timestamps: true, id: true })
export class Report {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({ type: String, required: true })
  body: string;

  @Field()
  @Prop({ type: String, required: true })
  court: string;

  @Field(() => Date)
  @Prop({ type: Date, required: false })
  date: Date;

  @Field()
  @Prop({ type: Boolean, required: false, default: false })
  isPublished: boolean;

  @Field()
  @Prop({ type: String, required: false })
  issues: string;

  @Field()
  @Prop({ type: String, required: false })
  ratios: string;

  @Field()
  @Prop({ type: Number, required: true })
  reportId: number;

  @Field()
  @Prop({ type: String, required: true })
  slug: string;

  @Field()
  @Prop({ type: String, required: true })
  suitNo: string;

  @Field()
  @Prop({ type: String, required: true })
  summary: string;

  @Field()
  @Prop({ type: String, required: true })
  title: string;

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, required: false })
  added_by_id: string;

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, required: false })
  updated_by_id: string;

  @Field(() => Int)
  @Prop({ type: Number, required: false })
  views: number;

  @Field()
  @Prop({ type: Number, required: false })
  vol: number;

  // tags         : ReportTags[];
  // lawSubjects  : ReportToSubject[];
  @Field(() => [ReportVisit])
  visits: ReportVisit[];

  @Field(() => [Bookmark])
  bookmarks: Bookmark[];

  @Field(() => [ReportComment])
  comments: ReportComment[];

  @Field(() => [ReportLike])
  likes: ReportLike[];

  // @Field(() => User)
  // added_by: User;

  // @Field(() => User)
  // updated_by: User;

  @Field(() => Date)
  updatedAt: Date;
  @Field(() => Date)
  createdAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

@ObjectType()
@Schema({ timestamps: true, id: true })
export class ReportLike {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: true })
  reportId: ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: true })
  userId: ObjectId;
}

export const ReportLikeSchema = SchemaFactory.createForClass(ReportLike);
