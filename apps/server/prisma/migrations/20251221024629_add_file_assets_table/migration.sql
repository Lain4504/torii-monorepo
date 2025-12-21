-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "avatar_url" TEXT,
    "role" VARCHAR(20) NOT NULL DEFAULT 'learner',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "date_of_birth" DATE,
    "gender" VARCHAR(10),
    "address" TEXT,
    "bio" TEXT,
    "jlpt_level" VARCHAR(5),
    "current_points" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deck_id" UUID NOT NULL,
    "front_text" TEXT NOT NULL,
    "back_text" TEXT NOT NULL,
    "example_sentence" TEXT,
    "pronunciation" TEXT,
    "image_url" TEXT,
    "audio_url" TEXT,
    "tags" VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR(50)[],
    "difficulty" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "next_review_date" DATE,
    "interval_days" INTEGER NOT NULL DEFAULT 1,
    "ease_factor" DECIMAL(4,2) NOT NULL DEFAULT 2.50,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "file_name" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "bucket_name" TEXT NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "region" VARCHAR(50),
    "mime_type" VARCHAR(100),
    "file_size" BIGINT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB DEFAULT '{}',
    "owner_id" UUID,
    "module_origin" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_file_key_key" ON "file_assets"("file_key");

-- CreateIndex
CREATE INDEX "file_assets_owner_id_idx" ON "file_assets"("owner_id");

-- CreateIndex
CREATE INDEX "file_assets_file_key_idx" ON "file_assets"("file_key");

-- CreateIndex
CREATE INDEX "file_assets_status_idx" ON "file_assets"("status");
