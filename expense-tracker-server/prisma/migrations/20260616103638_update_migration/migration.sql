/*
  Warnings:

  - A unique constraint covering the columns `[group_expense_id,member_id]` on the table `group_expense_splits` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "settlements" DROP CONSTRAINT "settlements_from_user_id_fkey";

-- DropForeignKey
ALTER TABLE "settlements" DROP CONSTRAINT "settlements_to_user_id_fkey";

-- DropIndex
DROP INDEX "group_expense_splits_group_expense_id_user_id_key";

-- AlterTable
ALTER TABLE "settlements" ALTER COLUMN "from_user_id" DROP NOT NULL,
ALTER COLUMN "to_user_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "group_expense_splits_member_id_idx" ON "group_expense_splits"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_expense_splits_group_expense_id_member_id_key" ON "group_expense_splits"("group_expense_id", "member_id");

-- CreateIndex
CREATE INDEX "settlements_from_member_id_idx" ON "settlements"("from_member_id");

-- CreateIndex
CREATE INDEX "settlements_to_member_id_idx" ON "settlements"("to_member_id");

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
