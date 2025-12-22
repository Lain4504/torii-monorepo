-- Create file_assets table migration
-- Run: npx prisma migrate dev --name add_file_assets_table
-- Or manually: psql -d your_database -f add_file_assets_table.sql

CREATE TABLE IF NOT EXISTS "file_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "file_name" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "bucket_name" TEXT NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "region" VARCHAR(50),
    "mime_type" VARCHAR(100),
    "file_size" BIGINT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "owner_id" UUID,
    "module_origin" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "file_assets_file_key_key" ON "file_assets"("file_key");
CREATE INDEX IF NOT EXISTS "idx_file_assets_owner" ON "file_assets"("owner_id");
CREATE INDEX IF NOT EXISTS "idx_file_assets_key" ON "file_assets"("file_key");
CREATE INDEX IF NOT EXISTS "idx_file_assets_status" ON "file_assets"("status");


