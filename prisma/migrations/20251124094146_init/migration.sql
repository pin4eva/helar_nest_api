-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "UserProfileType" AS ENUM ('Student', 'Lawyer', 'Guest', 'Staff');

-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('Admin', 'Editor', 'User', 'Developer');

-- CreateEnum
CREATE TYPE "UserStatusEnum" AS ENUM ('Active', 'Suspended', 'Banned');

-- CreateEnum
CREATE TYPE "SubscriptionPlanEnum" AS ENUM ('Monthly', 'Yearly');

-- CreateEnum
CREATE TYPE "SubscriptionStatusEnum" AS ENUM ('Active', 'Expired');

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
    "lawSchoolCampus" TEXT,
    "townState" TEXT,
    "universityCampus" TEXT,
    "currentSubscriptionId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentId" TEXT NOT NULL,
    "plan" "SubscriptionPlanEnum" NOT NULL DEFAULT 'Monthly',
    "status" "SubscriptionStatusEnum" NOT NULL DEFAULT 'Active',

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
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "_report_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handbook_cases" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "byline" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handbookId" TEXT NOT NULL,
    "ref" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "handbook_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handbooks" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "handbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_items" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,
    "ref" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "facultyNoteSummaryId" TEXT,
    "nlsNoteSummaryId" TEXT,

    CONSTRAINT "note_items_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "faculty_note_summaries" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ref" INTEGER NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "faculty_note_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nls_note_summaries" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ref" INTEGER NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "nls_note_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "textbook_cases" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "byline" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ref" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "textbookId" TEXT NOT NULL,

    CONSTRAINT "textbook_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "textbooks" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "textbooks_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_expiresAt_idx" ON "subscriptions"("expiresAt");

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
CREATE UNIQUE INDEX "handbook_cases_ref_key" ON "handbook_cases"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "handbook_cases_slug_key" ON "handbook_cases"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "handbooks_slug_key" ON "handbooks"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "note_items_slug_key" ON "note_items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "note_items_ref_key" ON "note_items"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_note_summaries_slug_key" ON "faculty_note_summaries"("slug");

-- CreateIndex
CREATE INDEX "faculty_note_summaries_subjectId_idx" ON "faculty_note_summaries"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "nls_note_summaries_slug_key" ON "nls_note_summaries"("slug");

-- CreateIndex
CREATE INDEX "nls_note_summaries_subjectId_idx" ON "nls_note_summaries"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "textbook_cases_ref_key" ON "textbook_cases"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "textbook_cases_slug_key" ON "textbook_cases"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "textbooks_slug_key" ON "textbooks"("slug");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_currentSubscriptionId_fkey" FOREIGN KEY ("currentSubscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

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
ALTER TABLE "handbook_cases" ADD CONSTRAINT "handbook_cases_handbookId_fkey" FOREIGN KEY ("handbookId") REFERENCES "handbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handbooks" ADD CONSTRAINT "handbooks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_items" ADD CONSTRAINT "note_items_facultyNoteSummaryId_fkey" FOREIGN KEY ("facultyNoteSummaryId") REFERENCES "faculty_note_summaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_items" ADD CONSTRAINT "note_items_nlsNoteSummaryId_fkey" FOREIGN KEY ("nlsNoteSummaryId") REFERENCES "nls_note_summaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_note_summaries" ADD CONSTRAINT "faculty_note_summaries_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nls_note_summaries" ADD CONSTRAINT "nls_note_summaries_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "textbook_cases" ADD CONSTRAINT "textbook_cases_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "textbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "textbooks" ADD CONSTRAINT "textbooks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
