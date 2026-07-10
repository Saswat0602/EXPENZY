/*
  Warnings:

  - You are about to drop the column `auto_detected_category` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `category_confidence` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `category_source` on the `expenses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "auto_detected_category",
DROP COLUMN "category_confidence",
DROP COLUMN "category_source";
