/*
  Warnings:

  - The primary key for the `_report_visits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `_report_visits` table. All the data in the column will be lost.
  - The primary key for the `bookmarks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `bookmarks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "_report_visits" DROP CONSTRAINT "_report_visits_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_pkey",
DROP COLUMN "id";
