import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UserProfileTypeEnum {
  'Student',
  'Lawyer',
  'Guest',
  'Staff',
}

export enum UserRoleEnum {
  'Admin',
  'Editor',
  'User',
  'Developer',
}

export enum UserStatusEnum {
  'Active',
  'Suspended',
  'Banned',
}

export enum SubscriptionPlanEnum {
  'Monthly',
  'Yearly',
}

export enum SubscriptionStatusEnum {
  'Active',
  'Expired',
}

export enum GenderEnum {
  'Male',
  'Female',
}

registerEnumType(UserProfileTypeEnum, { name: 'UserProfileTypeEnum' });
registerEnumType(UserRoleEnum, { name: 'UserRoleEnum' });
registerEnumType(UserStatusEnum, { name: 'UserStatusEnum' });
registerEnumType(SubscriptionPlanEnum, { name: 'SubscriptionPlanEnum' });
registerEnumType(SubscriptionStatusEnum, { name: 'SubscriptionStatusEnum' });
registerEnumType(GenderEnum, { name: 'GenderEnum' });

@ObjectType()
@Schema({ timestamps: true, id: true })
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  bio?: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  city?: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  contact?: string;

  @Field(() => String)
  @Prop({ type: String })
  email: string;

  @Field(() => String)
  @Prop({ type: String })
  firstName: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  lastName?: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  image?: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  imagePublicId?: string;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date, default: null })
  lastSeen?: Date;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  phone?: string;

  @Field(() => UserProfileTypeEnum, { nullable: true })
  @Prop({
    type: String,
    enum: UserProfileTypeEnum,
    default: UserProfileTypeEnum.Guest,
  })
  profileType: UserProfileTypeEnum;

  @Field(() => UserRoleEnum, { nullable: true })
  @Prop({ type: String, enum: UserRoleEnum, default: UserRoleEnum.User })
  role?: UserRoleEnum;

  @Field(() => UserStatusEnum, { nullable: true })
  @Prop({ type: String, enum: UserStatusEnum, default: UserStatusEnum.Active })
  status?: UserStatusEnum;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  passwordUpdateToken?: string;
  // password         String
  @Field(() => GenderEnum, { nullable: true })
  @Prop({ type: String, enum: GenderEnum, default: null })
  gender?: GenderEnum;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  emailToken?: string;

  @Field(() => Boolean, { nullable: true })
  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;

  // @Field(() => [Bookmark], { nullable: true })
  // @Prop({ type: [Bookmark], default: [] })
  // bookmarks?: Bookmark[];
  // @Field(() => [ReportComment], { nullable: true })
  // @Prop({ type: [ReportComment], default: [] })
  // report_comments?: ReportComment[];
  // @Field(() => [ReportLike], { nullable: true })
  // @Prop({ type: [ReportLike], default: [] })
  // report_likes?: ReportLike[];
  // @Field(() => [Report], { nullable: true })
  // @Prop({ type: [Report], default: [] })
  // reports_added?: Report[];
  // @Field(() => [Report], { nullable: true })
  // @Prop({ type: [Report], default: [] })
  // reports_updated?: Report[];
  // @Field(() => [Subscription], { nullable: true })
  // @Prop({ type: [Subscription], default: [] })
  // subscriptions?: Subscription[];
  // @Field(() => String, { nullable: true })
  // @Prop({ type: String, default: null })
  // currentSubscriptionId?: string;
  // @Field(() => Subscription, { nullable: true })
  // @Prop({ type: Subscription, default: null })
  // currentSubscription?: Subscription;
  // @Field(() => [ReportCommentLike], { nullable: true })
  // @Prop({ type: [ReportCommentLike], default: [] })
  // ReportCommentLike?: ReportCommentLike[];
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
