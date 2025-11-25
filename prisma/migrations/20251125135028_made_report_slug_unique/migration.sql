/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects"("slug");
