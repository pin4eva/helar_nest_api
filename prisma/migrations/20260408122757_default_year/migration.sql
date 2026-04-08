/*
  Warnings:

  - Made the column `year` on table `final_bar_exam_qa` required. This step will fail if there are existing NULL values in that column.

*/
-- BackfillNulls
UPDATE "final_bar_exam_qa" SET "year" = 1900 WHERE "year" IS NULL;
-- AlterTable
ALTER TABLE "final_bar_exam_qa" ALTER COLUMN "year" SET NOT NULL,
ALTER COLUMN "year" SET DEFAULT 1900;
