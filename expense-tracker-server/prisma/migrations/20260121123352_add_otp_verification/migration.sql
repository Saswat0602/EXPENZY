-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otps_email_purpose_idx" ON "otps"("email", "purpose");

-- CreateIndex
CREATE INDEX "otps_code_idx" ON "otps"("code");

-- CreateIndex
CREATE INDEX "otps_expires_at_idx" ON "otps"("expires_at");

-- CreateIndex
CREATE INDEX "otps_email_created_at_idx" ON "otps"("email", "created_at");

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
