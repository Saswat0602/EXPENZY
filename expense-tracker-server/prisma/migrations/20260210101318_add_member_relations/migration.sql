-- AlterTable
ALTER TABLE "group_expenses" ADD COLUMN "paid_by_member_id" TEXT;

-- Populate paid_by_member_id in group_expenses
UPDATE "group_expenses" ge
SET "paid_by_member_id" = gm.id
FROM "group_members" gm
WHERE ge."paid_by_user_id" = gm."user_id" AND ge."group_id" = gm."group_id"
AND ge."paid_by_member_id" IS NULL;

-- AlterTable: Make paid_by_member_id NOT NULL
-- (Note: This might fail if there's data where a matching group member cannot be found)
ALTER TABLE "group_expenses" ALTER COLUMN "paid_by_member_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "group_expense_splits" ADD COLUMN "member_id" TEXT;

-- Populate member_id in group_expense_splits
UPDATE "group_expense_splits" ges
SET "member_id" = gm.id
FROM "group_expenses" ge, "group_members" gm
WHERE ges."group_expense_id" = ge.id
AND ge."group_id" = gm."group_id"
AND ges."user_id" = gm."user_id"
AND ges."member_id" IS NULL;

-- AlterTable
ALTER TABLE "settlements" ADD COLUMN "from_member_id" TEXT;
ALTER TABLE "settlements" ADD COLUMN "to_member_id" TEXT;

-- Populate from_member_id and to_member_id in settlements
UPDATE "settlements" s
SET "from_member_id" = gm.id
FROM "group_members" gm
WHERE s."from_user_id" = gm."user_id" AND s."group_id" = gm."group_id"
AND s."from_member_id" IS NULL;

UPDATE "settlements" s
SET "to_member_id" = gm.id
FROM "group_members" gm
WHERE s."to_user_id" = gm."user_id" AND s."group_id" = gm."group_id"
AND s."to_member_id" IS NULL;

-- AlterTable: Make from_member_id and to_member_id NOT NULL
ALTER TABLE "settlements" ALTER COLUMN "from_member_id" SET NOT NULL;
ALTER TABLE "settlements" ALTER COLUMN "to_member_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_contacts" ADD COLUMN "contact_avatar" TEXT;

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_paid_by_member_id_fkey" FOREIGN KEY ("paid_by_member_id") REFERENCES "group_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expense_splits" ADD CONSTRAINT "group_expense_splits_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "group_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_from_member_id_fkey" FOREIGN KEY ("from_member_id") REFERENCES "group_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_to_member_id_fkey" FOREIGN KEY ("to_member_id") REFERENCES "group_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

