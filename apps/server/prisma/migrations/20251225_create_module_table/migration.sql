-- Migration: add modules table

CREATE TABLE IF NOT EXISTS "modules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "course_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "order" integer NOT NULL DEFAULT 0,
  "duration_minutes" integer,
  "created_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "modules_course_id_idx" ON "modules"("course_id");
