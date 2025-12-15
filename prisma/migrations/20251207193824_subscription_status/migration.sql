-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "status" "SubscriptionStatusEnum" NOT NULL DEFAULT 'Pending';

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
