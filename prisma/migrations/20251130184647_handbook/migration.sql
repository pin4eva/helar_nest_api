/*
  Warnings:

  - You are about to drop the `faculty_note_summaries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `handbooks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nls_note_summaries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `note_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `textbook_cases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `textbooks` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `topicId` to the `handbook_cases` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TopicTypeEnum" AS ENUM ('Textbook', 'Handbook');

-- CreateEnum
CREATE TYPE "SummaryTypeEnum" AS ENUM ('Faculty_Summary', 'NLS_Summary');

-- DropForeignKey
ALTER TABLE "faculty_note_summaries" DROP CONSTRAINT "faculty_note_summaries_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "handbook_cases" DROP CONSTRAINT "handbook_cases_handbookId_fkey";

-- DropForeignKey
ALTER TABLE "handbooks" DROP CONSTRAINT "handbooks_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "nls_note_summaries" DROP CONSTRAINT "nls_note_summaries_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "note_items" DROP CONSTRAINT "note_items_facultyNoteSummaryId_fkey";

-- DropForeignKey
ALTER TABLE "note_items" DROP CONSTRAINT "note_items_nlsNoteSummaryId_fkey";

-- DropForeignKey
ALTER TABLE "textbook_cases" DROP CONSTRAINT "textbook_cases_textbookId_fkey";

-- DropForeignKey
ALTER TABLE "textbooks" DROP CONSTRAINT "textbooks_subjectId_fkey";

-- AlterTable
ALTER TABLE "handbook_cases" ADD COLUMN     "topicId" TEXT NOT NULL,
ALTER COLUMN "handbookId" DROP NOT NULL;

-- DropTable
DROP TABLE "faculty_note_summaries";

-- DropTable
DROP TABLE "handbooks";

-- DropTable
DROP TABLE "nls_note_summaries";

-- DropTable
DROP TABLE "note_items";

-- DropTable
DROP TABLE "textbook_cases";

-- DropTable
DROP TABLE "textbooks";

-- CreateTable
CREATE TABLE "handbook_topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handbook_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summary_topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "type" "SummaryTypeEnum" NOT NULL DEFAULT 'Faculty_Summary',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "summary_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summary_cases" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topicId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ref" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "summary_cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "handbook_topics_title_key" ON "handbook_topics"("title");

-- CreateIndex
CREATE UNIQUE INDEX "handbook_topics_slug_key" ON "handbook_topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "summary_topics_title_key" ON "summary_topics"("title");

-- CreateIndex
CREATE UNIQUE INDEX "summary_topics_slug_key" ON "summary_topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "summary_cases_slug_key" ON "summary_cases"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "summary_cases_ref_key" ON "summary_cases"("ref");

-- AddForeignKey
ALTER TABLE "handbook_topics" ADD CONSTRAINT "handbook_topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handbook_cases" ADD CONSTRAINT "handbook_cases_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "handbook_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary_topics" ADD CONSTRAINT "summary_topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summary_cases" ADD CONSTRAINT "summary_cases_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "summary_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
