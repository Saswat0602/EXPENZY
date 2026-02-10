-- AlterTable
ALTER TABLE "group_expenses" ADD COLUMN "paid_by_member_id" TEXT;

-- AlterTable
ALTER TABLE "group_expense_splits" ADD COLUMN "member_id" TEXT;

-- AlterTable
ALTER TABLE "settlements" ADD COLUMN "from_member_id" TEXT;
ALTER TABLE "settlements" ADD COLUMN "to_member_id" TEXT;

-- AlterTable
ALTER TABLE "user_contacts" ADD COLUMN "contact_avatar" TEXT;
