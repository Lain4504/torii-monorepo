-- CreateTable
CREATE TABLE "room_info" (
    "id" SERIAL NOT NULL,
    "room_title" TEXT NOT NULL DEFAULT '',
    "roomId" VARCHAR(64) NOT NULL,
    "sid" VARCHAR(64) NOT NULL,
    "joined_participants" INTEGER NOT NULL DEFAULT 0,
    "is_running" BOOLEAN NOT NULL DEFAULT false,
    "is_recording" BOOLEAN NOT NULL DEFAULT false,
    "recorder_id" VARCHAR(36) NOT NULL DEFAULT '',
    "is_active_rtmp" BOOLEAN NOT NULL DEFAULT false,
    "rtmp_node_id" VARCHAR(36) NOT NULL DEFAULT '',
    "webhook_url" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "is_breakout_room" BOOLEAN NOT NULL DEFAULT false,
    "parent_room_id" VARCHAR(64) NOT NULL DEFAULT '',
    "creation_time" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended" TIMESTAMP(3),
    "modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recordings" (
    "id" SERIAL NOT NULL,
    "record_id" VARCHAR(64) NOT NULL,
    "room_id" VARCHAR(64) NOT NULL,
    "room_sid" VARCHAR(64) NOT NULL,
    "recorder_id" VARCHAR(36) NOT NULL,
    "file_path" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "creation_time" INTEGER NOT NULL DEFAULT 0,
    "room_creation_time" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_files" (
    "id" SERIAL NOT NULL,
    "fileId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "room_info_sid_key" ON "room_info"("sid");

-- CreateIndex
CREATE INDEX "room_info_roomId_is_running_idx" ON "room_info"("roomId", "is_running");

-- CreateIndex
CREATE UNIQUE INDEX "recordings_record_id_key" ON "recordings"("record_id");

-- CreateIndex
CREATE INDEX "recordings_room_id_idx" ON "recordings"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_files_fileId_key" ON "room_files"("fileId");

-- CreateIndex
CREATE INDEX "room_files_roomId_idx" ON "room_files"("roomId");

-- AddForeignKey
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_room_sid_fkey" FOREIGN KEY ("room_sid") REFERENCES "room_info"("sid") ON DELETE RESTRICT ON UPDATE CASCADE;
