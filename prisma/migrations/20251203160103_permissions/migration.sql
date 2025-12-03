/*
  Warnings:

  - You are about to drop the column `schoolId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "schoolId",
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
