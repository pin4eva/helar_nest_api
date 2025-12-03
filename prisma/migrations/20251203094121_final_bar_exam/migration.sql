/*
  Warnings:

  - You are about to drop the column `handbookId` on the `handbook_cases` table. All the data in the column will be lost.
  - You are about to drop the column `objectId` on the `handbook_cases` table. All the data in the column will be lost.
  - Made the column `slug` on table `summary_topics` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "SummaryTypeEnum" ADD VALUE 'Final Bar Exam Questions and Answers';

-- AlterTable
ALTER TABLE "handbook_cases" DROP COLUMN "handbookId",
DROP COLUMN "objectId";

-- AlterTable
ALTER TABLE "summary_topics" ALTER COLUMN "slug" SET NOT NULL;
