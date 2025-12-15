-- AlterTable
ALTER TABLE "loans" ADD COLUMN     "external_borrower_email" TEXT,
ADD COLUMN     "external_borrower_name" TEXT,
ADD COLUMN     "external_borrower_phone" TEXT,
ADD COLUMN     "external_lender_email" TEXT,
ADD COLUMN     "external_lender_name" TEXT,
ADD COLUMN     "external_lender_phone" TEXT;

-- CreateTable
CREATE TABLE "user_contacts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "contact_user_id" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_contacts_user_id_idx" ON "user_contacts"("user_id");

-- CreateIndex
CREATE INDEX "user_contacts_contact_user_id_idx" ON "user_contacts"("contact_user_id");

-- CreateIndex
CREATE INDEX "user_contacts_user_id_source_idx" ON "user_contacts"("user_id", "source");

-- CreateIndex
CREATE UNIQUE INDEX "user_contacts_user_id_contact_user_id_key" ON "user_contacts"("user_id", "contact_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_contacts_user_id_contact_email_key" ON "user_contacts"("user_id", "contact_email");

-- AddForeignKey
ALTER TABLE "user_contacts" ADD CONSTRAINT "user_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_contacts" ADD CONSTRAINT "user_contacts_contact_user_id_fkey" FOREIGN KEY ("contact_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
