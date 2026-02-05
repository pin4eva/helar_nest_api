/*
 Warnings:
 
 - You are about to drop the column `status` on the `subscriptions` table. All the data in the column will be lost.
 - A unique constraint covering the columns `[providerSubscriptionId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
 
 */
-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');
-- CreateEnum
CREATE TYPE "PaymentTypeEnum" AS ENUM ('Initial', 'Renewal', 'Refund');
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.
ALTER TYPE "SubscriptionStatusEnum"
ADD VALUE 'Pending';
ALTER TYPE "SubscriptionStatusEnum"
ADD VALUE 'Trialing';
ALTER TYPE "SubscriptionStatusEnum"
ADD VALUE 'PastDue';
ALTER TYPE "SubscriptionStatusEnum"
ADD VALUE 'Cancelled';
ALTER TYPE "SubscriptionStatusEnum"
ADD VALUE 'Paused';
-- DropIndex
DROP INDEX "subscriptions_status_idx";
-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "status",
  ADD COLUMN "autoRenew" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "canceledReason" TEXT,
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'NGN',
  ADD COLUMN "currentPeriodEnd" TIMESTAMP(3),
  ADD COLUMN "currentPeriodStart" TIMESTAMP(3),
  ADD COLUMN "meta" JSONB,
  ADD COLUMN "nextBillingAt" TIMESTAMP(3),
  ADD COLUMN "organizationId" TEXT,
  ADD COLUMN "provider" TEXT,
  ADD COLUMN "providerCustomerId" TEXT,
  ADD COLUMN "providerPlanId" TEXT,
  ADD COLUMN "providerSubscriptionId" TEXT,
  ADD COLUMN "startsAt" TIMESTAMP(3),
  ADD COLUMN "trialEndsAt" TIMESTAMP(3),
  ALTER COLUMN "userId" DROP NOT NULL,
  ALTER COLUMN "expiresAt" DROP NOT NULL,
  ALTER COLUMN "amount" DROP NOT NULL,
  ALTER COLUMN "paymentId" DROP NOT NULL;
-- CreateTable
CREATE TABLE "payment_transactions" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "subscriptionId" TEXT,
  "organizationId" TEXT,
  "provider" TEXT NOT NULL,
  "providerTransactionId" TEXT,
  "reference" TEXT,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "status" "PaymentStatusEnum" NOT NULL,
  "type" "PaymentTypeEnum" NOT NULL,
  "response" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "organization_subscriptions" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "subscriptionId" TEXT,
  "seatsTotal" INTEGER NOT NULL,
  "seatsAssigned" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "organization_subscriptions_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "payment_transactions_userId_idx" ON "payment_transactions"("userId");
-- CreateIndex
CREATE INDEX "payment_transactions_subscriptionId_idx" ON "payment_transactions"("subscriptionId");
-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_providerSubscriptionId_key" ON "subscriptions"("providerSubscriptionId");
-- CreateIndex
CREATE INDEX "subscriptions_organizationId_idx" ON "subscriptions"("organizationId");
-- CreateIndex
CREATE INDEX "subscriptions_nextBillingAt_idx" ON "subscriptions"("nextBillingAt");
-- AddForeignKey
ALTER TABLE "subscriptions"
ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "schools"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "payment_transactions"
ADD CONSTRAINT "payment_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "payment_transactions"
ADD CONSTRAINT "payment_transactions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "payment_transactions"
ADD CONSTRAINT "payment_transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "schools"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "organization_subscriptions"
ADD CONSTRAINT "organization_subscriptions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "organization_subscriptions"
ADD CONSTRAINT "organization_subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
