/*
  Warnings:

  - You are about to drop the column `planId` on the `subscriptions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_planId_fkey";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "planId",
ADD COLUMN     "planCode" TEXT,
ADD COLUMN     "subscriptionPlanId" INTEGER;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
