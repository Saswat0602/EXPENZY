/*
  Warnings:

  - You are about to drop the `category_cache` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category_keywords` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exchange_rates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expense_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `income_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('EXPENSE', 'INCOME', 'GROUP');

-- DropForeignKey
ALTER TABLE "category_keywords" DROP CONSTRAINT "category_keywords_user_id_fkey";

-- DropForeignKey
ALTER TABLE "expense_tags" DROP CONSTRAINT "expense_tags_expense_id_fkey";

-- DropForeignKey
ALTER TABLE "expense_tags" DROP CONSTRAINT "expense_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "income_categories" DROP CONSTRAINT "income_categories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "incomes" DROP CONSTRAINT "incomes_category_id_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_user_id_fkey";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "type",
ADD COLUMN     "type" "CategoryType" NOT NULL;

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "allow_non_members" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "color" TEXT DEFAULT 'purple',
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'INR',
ADD COLUMN     "group_type" TEXT NOT NULL DEFAULT 'other',
ADD COLUMN     "icon" TEXT DEFAULT 'friends',
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "simplify_debts" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "category_cache";

-- DropTable
DROP TABLE "category_keywords";

-- DropTable
DROP TABLE "exchange_rates";

-- DropTable
DROP TABLE "expense_tags";

-- DropTable
DROP TABLE "income_categories";

-- DropTable
DROP TABLE "tags";

-- CreateIndex
CREATE INDEX "categories_user_id_type_idx" ON "categories"("user_id", "type");

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_name_type_key" ON "categories"("user_id", "name", "type");

-- CreateIndex
CREATE INDEX "groups_is_archived_idx" ON "groups"("is_archived");

-- CreateIndex
CREATE INDEX "groups_group_type_idx" ON "groups"("group_type");

-- CreateIndex
CREATE INDEX "groups_currency_idx" ON "groups"("currency");

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
