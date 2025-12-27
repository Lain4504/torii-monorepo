/*
  Warnings:

  - You are about to drop the column `bucket_name` on the `file_assets` table. All the data in the column will be lost.
  - You are about to drop the column `file_key` on the `file_assets` table. All the data in the column will be lost.
  - You are about to drop the column `file_name` on the `file_assets` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `file_assets` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `file_assets` table. All the data in the column will be lost.
  - You are about to drop the `recordings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[file_url]` on the table `file_assets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file_url` to the `file_assets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "recordings" DROP CONSTRAINT "recordings_room_sid_fkey";

-- DropIndex
DROP INDEX "file_assets_file_key_idx";

-- DropIndex
DROP INDEX "file_assets_file_key_key";

-- AlterTable
ALTER TABLE "file_assets" DROP COLUMN "bucket_name",
DROP COLUMN "file_key",
DROP COLUMN "file_name",
DROP COLUMN "provider",
DROP COLUMN "region",
ADD COLUMN     "file_url" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "recordings";

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_file_url_key" ON "file_assets"("file_url");

-- CreateIndex
CREATE INDEX "file_assets_file_url_idx" ON "file_assets"("file_url");
