/*
  Warnings:

  - You are about to drop the column `createdAt` on the `room_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `room_files` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `room_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `room_files` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `room_files` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `room_files` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `room_files` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `room_files` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `room_info` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[file_id]` on the table `room_files` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file_id` to the `room_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_path` to the `room_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_type` to the `room_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `room_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_id` to the `room_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `room_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_id` to the `room_info` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "room_files_fileId_key";

-- DropIndex
DROP INDEX "room_files_roomId_idx";

-- DropIndex
DROP INDEX "room_info_roomId_is_running_idx";

-- AlterTable
ALTER TABLE "room_files" DROP COLUMN "createdAt",
DROP COLUMN "fileId",
DROP COLUMN "filePath",
DROP COLUMN "fileSize",
DROP COLUMN "fileType",
DROP COLUMN "mimeType",
DROP COLUMN "roomId",
DROP COLUMN "userId",
ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "file_id" TEXT NOT NULL,
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "file_size" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "file_type" TEXT NOT NULL,
ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "room_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "room_info" DROP COLUMN "roomId",
ADD COLUMN     "room_id" VARCHAR(64) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "room_files_file_id_key" ON "room_files"("file_id");

-- CreateIndex
CREATE INDEX "room_files_room_id_idx" ON "room_files"("room_id");

-- CreateIndex
CREATE INDEX "room_info_room_id_is_running_idx" ON "room_info"("room_id", "is_running");
