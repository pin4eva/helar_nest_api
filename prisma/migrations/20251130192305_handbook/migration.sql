/*
  Warnings:

  - The values [Faculty_Summary,NLS_Summary] on the enum `SummaryTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SummaryTypeEnum_new" AS ENUM ('Faculty Summary', 'NLS Summary');
ALTER TABLE "public"."summary_topics" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "summary_topics" ALTER COLUMN "type" TYPE "SummaryTypeEnum_new" USING ("type"::text::"SummaryTypeEnum_new");
ALTER TYPE "SummaryTypeEnum" RENAME TO "SummaryTypeEnum_old";
ALTER TYPE "SummaryTypeEnum_new" RENAME TO "SummaryTypeEnum";
DROP TYPE "public"."SummaryTypeEnum_old";
ALTER TABLE "summary_topics" ALTER COLUMN "type" SET DEFAULT 'Faculty Summary';
COMMIT;

-- AlterTable
ALTER TABLE "summary_topics" ALTER COLUMN "type" SET DEFAULT 'Faculty Summary';
