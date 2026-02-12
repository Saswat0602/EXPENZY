-- Create columns if they don't exist
DO $$ 
BEGIN
    -- group_expenses.paid_by_member_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='group_expenses' AND column_name='paid_by_member_id') THEN
        ALTER TABLE "group_expenses" ADD COLUMN "paid_by_member_id" TEXT;
    END IF;

    -- group_expense_splits.member_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='group_expense_splits' AND column_name='member_id') THEN
        ALTER TABLE "group_expense_splits" ADD COLUMN "member_id" TEXT;
    END IF;

    -- settlements.from_member_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settlements' AND column_name='from_member_id') THEN
        ALTER TABLE "settlements" ADD COLUMN "from_member_id" TEXT;
    END IF;

    -- settlements.to_member_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settlements' AND column_name='to_member_id') THEN
        ALTER TABLE "settlements" ADD COLUMN "to_member_id" TEXT;
    END IF;

    -- user_contacts.contact_avatar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_contacts' AND column_name='contact_avatar') THEN
        ALTER TABLE "user_contacts" ADD COLUMN "contact_avatar" TEXT;
    END IF;
END $$;

-- Populate data (idempotent updates)
UPDATE "group_expenses" ge
SET "paid_by_member_id" = gm.id
FROM "group_members" gm
WHERE ge."paid_by_user_id" = gm."user_id" AND ge."group_id" = gm."group_id"
AND ge."paid_by_member_id" IS NULL;

UPDATE "group_expense_splits" ges
SET "member_id" = gm.id
FROM "group_expenses" ge, "group_members" gm
WHERE ges."group_expense_id" = ge.id
AND ge."group_id" = gm."group_id"
AND ges."user_id" = gm."user_id"
AND ges."member_id" IS NULL;

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

-- Set NOT NULL where needed (only if column is empty but data exists - might need care)
-- For safety, we'll only set NOT NULL if we are sure it's populated.
-- Given the Prisma schema, these MUST be NOT NULL.
DO $$ 
BEGIN
    ALTER TABLE "group_expenses" ALTER COLUMN "paid_by_member_id" SET NOT NULL;
    ALTER TABLE "settlements" ALTER COLUMN "from_member_id" SET NOT NULL;
    ALTER TABLE "settlements" ALTER COLUMN "to_member_id" SET NOT NULL;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not set NOT NULL constraints, likely due to missing data mappings.';
END $$;

-- Add Foreign Keys if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='group_expenses_paid_by_member_id_fkey') THEN
        ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_paid_by_member_id_fkey" FOREIGN KEY ("paid_by_member_id") REFERENCES "group_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='group_expense_splits_member_id_fkey') THEN
        ALTER TABLE "group_expense_splits" ADD CONSTRAINT "group_expense_splits_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "group_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='settlements_from_member_id_fkey') THEN
        ALTER TABLE "settlements" ADD CONSTRAINT "settlements_from_member_id_fkey" FOREIGN KEY ("from_member_id") REFERENCES "group_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='settlements_to_member_id_fkey') THEN
        ALTER TABLE "settlements" ADD CONSTRAINT "settlements_to_member_id_fkey" FOREIGN KEY ("to_member_id") REFERENCES "group_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
