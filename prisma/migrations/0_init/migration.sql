-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PlanIntervalEnum" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually');

-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "UserProfileType" AS ENUM ('Student', 'Lawyer', 'Guest', 'User', 'Staff');

-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('Admin', 'Editor', 'User', 'Developer', 'SuperAdmin');

-- CreateEnum
CREATE TYPE "UserStatusEnum" AS ENUM ('Active', 'Suspended', 'Banned');

-- CreateEnum
CREATE TYPE "SubscriptionPlanEnum" AS ENUM ('Monthly', 'Yearly');

-- CreateEnum
CREATE TYPE "SubscriptionStatusEnum" AS ENUM ('Pending', 'Trialing', 'Active', 'PastDue', 'Cancelled', 'Expired', 'Paused');

-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');

-- CreateEnum
CREATE TYPE "PaymentTypeEnum" AS ENUM ('Initial', 'Renewal', 'Refund');

-- CreateEnum
CREATE TYPE "TopicTypeEnum" AS ENUM ('Textbook', 'Handbook');

-- CreateEnum
CREATE TYPE "SummaryTypeEnum" AS ENUM ('Faculty Summary', 'NLS Summary', 'Final Bar Exam Questions and Answers');

-- CreateTable
CREATE TABLE "auths" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "iterations" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "bio" TEXT,
    "city" TEXT,
    "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "image" TEXT,
    "imagePublicId" TEXT,
    "isContactPublic" BOOLEAN,
    "isPhonePublic" BOOLEAN,
    "lastName" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profileType" "UserProfileType" NOT NULL DEFAULT 'Guest',
    "role" "UserRoleEnum" NOT NULL DEFAULT 'User',
    "state" TEXT,
    "status" "UserStatusEnum" NOT NULL DEFAULT 'Active',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,
    "passwordUpdateToken" TEXT,
    "gender" "GenderEnum" DEFAULT 'Male',
    "emailToken" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,
    "currentSubscriptionId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "reference" TEXT NOT NULL,
    "emailToken" TEXT,
    "startsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "nextBillingAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "canceledReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "amount" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "paymentId" TEXT,
    "provider" TEXT,
    "providerCustomerId" TEXT,
    "providerSubscriptionId" TEXT,
    "providerPlanId" TEXT,
    "plan" "PlanIntervalEnum" NOT NULL DEFAULT 'monthly',
    "status" "SubscriptionStatusEnum" NOT NULL DEFAULT 'Pending',
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "meta" JSONB,
    "planCode" TEXT,
    "subscriptionPlanId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "court" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "issues" TEXT,
    "ratios" TEXT,
    "reportId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "suitNo" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "added_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "views" INTEGER DEFAULT 0,
    "vol" INTEGER,
    "objectId" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_report_to_subject" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "_report_to_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_comments" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "objectId" TEXT,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_comment_likes" (
    "id" TEXT NOT NULL,
    "reportCommentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "report_comment_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_likes" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "report_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_report_tags" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "_report_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_report_visits" (
    "reportId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "userId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intro" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handbook_topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "subjectId" TEXT NOT NULL,
    "type" "TopicTypeEnum" NOT NULL DEFAULT 'Handbook',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handbook_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handbook_cases" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "byline" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topicId" TEXT NOT NULL,
    "ref" INTEGER NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handbook_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summary_topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "type" "SummaryTypeEnum" NOT NULL DEFAULT 'Faculty Summary',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "summary_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summary_cases" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topicId" TEXT NOT NULL,
    "slug" TEXT,
    "ref" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "summary_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "subscriptionId" TEXT,
    "organizationId" TEXT,
    "provider" TEXT NOT NULL,
    "providerTransactionId" TEXT,
    "reference" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "PaymentStatusEnum" NOT NULL,
    "type" "PaymentTypeEnum" NOT NULL,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_subscriptions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "seatsTotal" INTEGER NOT NULL,
    "seatsAssigned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "organization_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "integration" INTEGER NOT NULL,
    "domain" TEXT NOT NULL DEFAULT 'test',
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "interval" "PlanIntervalEnum" NOT NULL DEFAULT 'monthly',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);


-- CreateIndex
CREATE UNIQUE INDEX "auths_userId_key" ON "auths"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_currentSubscriptionId_key" ON "users"("currentSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_reference_key" ON "subscriptions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_paymentId_key" ON "subscriptions"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_providerSubscriptionId_key" ON "subscriptions"("providerSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_organizationId_idx" ON "subscriptions"("organizationId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_expiresAt_idx" ON "subscriptions"("expiresAt");

-- CreateIndex
CREATE INDEX "subscriptions_nextBillingAt_idx" ON "subscriptions"("nextBillingAt");

-- CreateIndex
CREATE UNIQUE INDEX "reports_reportId_key" ON "reports"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_slug_key" ON "reports"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_report_to_subject_subjectId_reportId_key" ON "_report_to_subject"("subjectId", "reportId");

-- CreateIndex
CREATE UNIQUE INDEX "report_comment_likes_reportCommentId_userId_key" ON "report_comment_likes"("reportCommentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "report_likes_reportId_userId_key" ON "report_likes"("reportId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_report_tags_reportId_tag_key" ON "_report_tags"("reportId", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "_report_visits_reportId_sessionId_key" ON "_report_visits"("reportId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_reportId_key" ON "bookmarks"("userId", "reportId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "handbook_topics_title_key" ON "handbook_topics"("title");

-- CreateIndex
CREATE UNIQUE INDEX "handbook_cases_ref_key" ON "handbook_cases"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "summary_topics_title_key" ON "summary_topics"("title");

-- CreateIndex
CREATE UNIQUE INDEX "summary_cases_ref_key" ON "summary_cases"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");

-- CreateIndex
CREATE INDEX "payment_transactions_userId_idx" ON "payment_transactions"("userId");

-- CreateIndex
CREATE INDEX "payment_transactions_subscriptionId_idx" ON "payment_transactions"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_planCode_key" ON "subscription_plans"("planCode");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_currentSubscriptionId_fkey" FOREIGN KEY ("currentSubscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_report_to_subject" ADD CONSTRAINT "_report_to_subject_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_report_to_subject" ADD CONSTRAINT "_report_to_subject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comment_likes" ADD CONSTRAINT "report_comment_likes_reportCommentId_fkey" FOREIGN KEY ("reportCommentId") REFERENCES "report_comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comment_likes" ADD CONSTRAINT "report_comment_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_likes" ADD CONSTRAINT "report_likes_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_likes" ADD CONSTRAINT "report_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_report_tags" ADD CONSTRAINT "_report_tags_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_report_visits" ADD CONSTRAINT "_report_visits_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handbook_topics" ADD CONSTRAINT "handbook_topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handbook_cases" ADD CONSTRAINT "handbook_cases_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "handbook_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary_topics" ADD CONSTRAINT "summary_topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary_cases" ADD CONSTRAINT "summary_cases_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "summary_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

