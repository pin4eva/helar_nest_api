/*
  Warnings:

  - You are about to drop the column `lawSchoolCampus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `townState` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `universityCampus` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "lawSchoolCampus",
DROP COLUMN "townState",
DROP COLUMN "universityCampus",
ADD COLUMN     "schoolId" TEXT;

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");
