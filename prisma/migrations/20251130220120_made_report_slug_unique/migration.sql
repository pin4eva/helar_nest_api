-- DropIndex
DROP INDEX "handbook_cases_slug_key";

-- DropIndex
DROP INDEX "handbook_topics_slug_key";

-- DropIndex
DROP INDEX "summary_cases_slug_key";

-- DropIndex
DROP INDEX "summary_topics_slug_key";

-- AlterTable
ALTER TABLE "handbook_cases" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "handbook_topics" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "summary_cases" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "summary_topics" ALTER COLUMN "slug" DROP NOT NULL;
