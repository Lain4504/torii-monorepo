/*
  Warnings:

  - The primary key for the `courses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `courses` table. All the data in the column will be lost.
  - The `id` column on the `courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[slug]` on the table `courses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jlpt_level` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "courses" DROP CONSTRAINT "courses_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "published",
DROP COLUMN "updatedAt",
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" UUID,
ADD COLUMN     "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" UUID,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "discount_price" DECIMAL(10,2),
ADD COLUMN     "duration_weeks" INTEGER,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_free" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jlpt_level" VARCHAR(5) NOT NULL,
ADD COLUMN     "learning_outcomes" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "preview_video_url" TEXT,
ADD COLUMN     "requirements" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "short_description" VARCHAR(500),
ADD COLUMN     "slug" VARCHAR(255) NOT NULL,
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
ADD COLUMN     "tags" VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR(50)[],
ADD COLUMN     "thumbnail_url" TEXT,
ADD COLUMN     "total_lessons" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_quizzes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_reviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_students" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_jlpt_level_idx" ON "courses"("jlpt_level");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "courses"("status");

-- CreateIndex
CREATE INDEX "courses_created_by_idx" ON "courses"("created_by");
