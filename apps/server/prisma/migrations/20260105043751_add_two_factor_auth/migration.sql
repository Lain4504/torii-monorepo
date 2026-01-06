-- CreateTable
CREATE TABLE "two_factor_auth" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "method" VARCHAR(20),
    "totp_secret" VARCHAR(255),
    "totp_backup_codes" VARCHAR(100)[] DEFAULT ARRAY[]::VARCHAR(100)[],
    "phone_number" VARCHAR(20),
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "enabled_at" TIMESTAMP,
    "last_used_at" TIMESTAMP,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_auth_user_id_key" ON "two_factor_auth"("user_id");

-- CreateIndex
CREATE INDEX "two_factor_auth_user_id_idx" ON "two_factor_auth"("user_id");

-- AddForeignKey
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
