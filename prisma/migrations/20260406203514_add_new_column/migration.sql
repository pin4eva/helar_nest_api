/*
  Warnings:

  - A unique constraint covering the columns `[ref]` on the table `final_bar_exam_qa` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `final_bar_exam_qa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `year` to the `final_bar_exam_qa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "final_bar_exam_qa" ADD COLUMN     "ref" INTEGER,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "final_bar_exam_qa_ref_key" ON "final_bar_exam_qa"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "final_bar_exam_qa_slug_key" ON "final_bar_exam_qa"("slug");
