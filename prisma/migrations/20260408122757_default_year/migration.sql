/*
  Warnings:

  - Made the column `year` on table `final_bar_exam_qa` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "final_bar_exam_qa" ALTER COLUMN "year" SET NOT NULL,
ALTER COLUMN "year" SET DEFAULT 1900;
