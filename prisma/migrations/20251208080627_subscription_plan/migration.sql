/*
  Warnings:

  - The `plan` column on the `subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PlanIntervalEnum" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually');

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "plan",
ADD COLUMN     "plan" "PlanIntervalEnum" NOT NULL DEFAULT 'monthly';

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "integration" INTEGER NOT NULL,
    "domain" TEXT NOT NULL DEFAULT 'test',
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "interval" "PlanIntervalEnum" NOT NULL DEFAULT 'monthly',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_planCode_key" ON "subscription_plans"("planCode");
