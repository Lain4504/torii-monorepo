-- Planning layer + Gamification V2 (skeleton tables)
-- Note: This is a skeleton migration to unblock model wiring.

-- ==================================================
-- Planning Layer: personal_learning_*
-- ==================================================

-- personal_learning_plans
CREATE TABLE IF NOT EXISTS "personal_learning_plans" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "target_jlpt_level" VARCHAR(10),
  "plan_type" VARCHAR(30) NOT NULL DEFAULT 'ADAPTIVE',
  "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  "current_version" INTEGER NOT NULL DEFAULT 1,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "ended_at" TIMESTAMPTZ,
  "goal_snapshot" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_personal_learning_plans" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_plans_user_status" ON "personal_learning_plans" ("user_id", "status");

ALTER TABLE "personal_learning_plans"
  ADD CONSTRAINT "fk_personal_learning_plans_user_id"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- personal_learning_plan_weeks
CREATE TABLE IF NOT EXISTS "personal_learning_plan_weeks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "plan_id" UUID NOT NULL,
  "version" INTEGER NOT NULL,
  "week_index" INTEGER NOT NULL,
  "week_start_date" TIMESTAMPTZ NOT NULL,
  "week_end_date" TIMESTAMPTZ NOT NULL,
  "objective" VARCHAR(255) NOT NULL,
  "estimated_minutes" INTEGER NOT NULL DEFAULT 0,
  "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_personal_learning_plan_weeks" PRIMARY KEY ("id"),
  CONSTRAINT "uq_personal_learning_plan_weeks_plan_ver_week" UNIQUE ("plan_id", "version", "week_index")
);

CREATE INDEX IF NOT EXISTS "idx_personal_learning_plan_weeks_plan_status" ON "personal_learning_plan_weeks" ("plan_id", "status");

ALTER TABLE "personal_learning_plan_weeks"
  ADD CONSTRAINT "fk_personal_learning_plan_weeks_plan_id"
  FOREIGN KEY ("plan_id") REFERENCES "personal_learning_plans"("id") ON DELETE CASCADE;

-- personal_learning_plan_tasks
CREATE TABLE IF NOT EXISTS "personal_learning_plan_tasks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "plan_week_id" UUID NOT NULL,
  "task_type" VARCHAR(40) NOT NULL,
  "priority" VARCHAR(10) NOT NULL DEFAULT 'must',
  "title" VARCHAR(255) NOT NULL,
  "estimated_minutes" INTEGER NOT NULL DEFAULT 0,
  "actual_minutes" INTEGER,
  "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  "due_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ,
  "source_type" VARCHAR(40),
  "source_enrollment_id" UUID,
  "source_lesson_id" UUID,
  "source_live_session_id" UUID,
  "source_assignment_id" UUID,
  "source_study_set_id" UUID,
  "source_jlpt_template_id" UUID,
  "explanation" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_personal_learning_plan_tasks" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_plan_tasks_week_status" ON "personal_learning_plan_tasks" ("plan_week_id", "status");
CREATE INDEX IF NOT EXISTS "idx_plan_tasks_source_enrollment" ON "personal_learning_plan_tasks" ("source_enrollment_id");

ALTER TABLE "personal_learning_plan_tasks"
  ADD CONSTRAINT "fk_personal_learning_plan_tasks_plan_week_id"
  FOREIGN KEY ("plan_week_id") REFERENCES "personal_learning_plan_weeks"("id") ON DELETE CASCADE;

-- Optional source refs (enrollment/lesson/etc)
ALTER TABLE "personal_learning_plan_tasks"
  ADD CONSTRAINT "fk_personal_learning_plan_tasks_source_enrollment_id"
  FOREIGN KEY ("source_enrollment_id") REFERENCES "academy_enrollments"("id") ON DELETE SET NULL;

ALTER TABLE "personal_learning_plan_tasks"
  ADD CONSTRAINT "fk_personal_learning_plan_tasks_source_lesson_id"
  FOREIGN KEY ("source_lesson_id") REFERENCES "academy_lessons"("id") ON DELETE SET NULL;

ALTER TABLE "personal_learning_plan_tasks"
  ADD CONSTRAINT "fk_personal_learning_plan_tasks_source_live_session_id"
  FOREIGN KEY ("source_live_session_id") REFERENCES "academy_live_schedule_sessions"("id") ON DELETE SET NULL;

ALTER TABLE "personal_learning_plan_tasks"
  ADD CONSTRAINT "fk_personal_learning_plan_tasks_source_assignment_id"
  FOREIGN KEY ("source_assignment_id") REFERENCES "academy_live_class_assignments"("id") ON DELETE SET NULL;

ALTER TABLE "personal_learning_plan_tasks"
  ADD CONSTRAINT "fk_personal_learning_plan_tasks_source_study_set_id"
  FOREIGN KEY ("source_study_set_id") REFERENCES "academy_study_sets"("id") ON DELETE SET NULL;

ALTER TABLE "personal_learning_plan_tasks"
  ADD CONSTRAINT "fk_personal_learning_plan_tasks_source_jlpt_template_id"
  FOREIGN KEY ("source_jlpt_template_id") REFERENCES "jlpt_mock_exam_templates"("id") ON DELETE SET NULL;

-- personal_learning_skill_snapshots
CREATE TABLE IF NOT EXISTS "personal_learning_skill_snapshots" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "plan_id" UUID,
  "snapshot_date" TIMESTAMPTZ NOT NULL,
  "skill_key" VARCHAR(64) NOT NULL,
  "jlpt_level" VARCHAR(10),
  "score" NUMERIC(5,4) NOT NULL,
  "confidence_score" NUMERIC(5,4) NOT NULL DEFAULT 0.5,
  "source_breakdown" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_personal_learning_skill_snapshots" PRIMARY KEY ("id"),
  CONSTRAINT "uq_personal_learning_skill_snapshots_user_date_skill" UNIQUE ("user_id", "snapshot_date", "skill_key")
);

CREATE INDEX IF NOT EXISTS "idx_skill_snapshots_user_date" ON "personal_learning_skill_snapshots" ("user_id", "snapshot_date" DESC);

ALTER TABLE "personal_learning_skill_snapshots"
  ADD CONSTRAINT "fk_personal_learning_skill_snapshots_user_id"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "personal_learning_skill_snapshots"
  ADD CONSTRAINT "fk_personal_learning_skill_snapshots_plan_id"
  FOREIGN KEY ("plan_id") REFERENCES "personal_learning_plans"("id") ON DELETE SET NULL;

-- personal_learning_replan_logs
CREATE TABLE IF NOT EXISTS "personal_learning_replan_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "plan_id" UUID NOT NULL,
  "from_version" INTEGER NOT NULL,
  "to_version" INTEGER NOT NULL,
  "trigger_type" VARCHAR(50) NOT NULL,
  "reason_context" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "changes_summary" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_personal_learning_replan_logs" PRIMARY KEY ("id")
);

ALTER TABLE "personal_learning_replan_logs"
  ADD CONSTRAINT "fk_personal_learning_replan_logs_plan_id"
  FOREIGN KEY ("plan_id") REFERENCES "personal_learning_plans"("id") ON DELETE CASCADE;


-- ==================================================
-- Gamification V2: game_*
-- ==================================================

-- game_profiles
CREATE TABLE IF NOT EXISTS "game_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE,
  "level" INTEGER NOT NULL DEFAULT 1,
  "current_xp" INTEGER NOT NULL DEFAULT 0,
  "total_xp" INTEGER NOT NULL DEFAULT 0,
  "points" INTEGER NOT NULL DEFAULT 0,
  "current_streak" INTEGER NOT NULL DEFAULT 0,
  "longest_streak" INTEGER NOT NULL DEFAULT 0,
  "freeze_count" INTEGER NOT NULL DEFAULT 0,
  "total_active_days" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_profiles" PRIMARY KEY ("id")
);

ALTER TABLE "game_profiles"
  ADD CONSTRAINT "fk_game_profiles_user_id"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- game_ledger_entries
CREATE TABLE IF NOT EXISTS "game_ledger_entries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" "GamificationCurrency" NOT NULL DEFAULT 'POINT',
  "type" "GamificationTransactionType" NOT NULL,
  "reason_code" VARCHAR(100),
  "source_type" VARCHAR(50),
  "source_ref_key" VARCHAR(200),
  "idempotency_key" VARCHAR(200) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_ledger_entries" PRIMARY KEY ("id"),
  CONSTRAINT "uq_game_ledger_entries_idem_and_ref" UNIQUE ("idempotency_key", "source_ref_key")
);

CREATE INDEX IF NOT EXISTS "idx_game_ledger_entries_user_id" ON "game_ledger_entries" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_game_ledger_entries_type" ON "game_ledger_entries" ("type");
CREATE INDEX IF NOT EXISTS "idx_game_ledger_entries_created_at" ON "game_ledger_entries" ("created_at");

ALTER TABLE "game_ledger_entries"
  ADD CONSTRAINT "fk_game_ledger_entries_user_id"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- game_coupon_rewards
CREATE TABLE IF NOT EXISTS "game_coupon_rewards" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(50) NOT NULL UNIQUE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "cost_points" INTEGER NOT NULL,
  "discount_type" VARCHAR NOT NULL,
  "discount_value" NUMERIC(12,2) NOT NULL,
  "max_discount_amount" NUMERIC(12,2),
  "min_order_value" NUMERIC(12,2),
  "expires_in_days" INTEGER,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_coupon_rewards" PRIMARY KEY ("id")
);

-- game_coupon_redemptions
CREATE TABLE IF NOT EXISTS "game_coupon_redemptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "reward_id" UUID,
  "ledger_entry_id" UUID,
  "coupon_id" UUID,
  "coupon_code" VARCHAR(50),
  "cost_points" INTEGER NOT NULL,
  "status" VARCHAR(20) NOT NULL,
  "redeemed_at" TIMESTAMPTZ,
  "used_at" TIMESTAMPTZ,
  "expires_at" TIMESTAMPTZ,
  "idempotency_key" VARCHAR(200) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_coupon_redemptions" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_game_coupon_redemptions_user_id" ON "game_coupon_redemptions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_game_coupon_redemptions_status" ON "game_coupon_redemptions" ("status");

ALTER TABLE "game_coupon_redemptions"
  ADD CONSTRAINT "fk_game_coupon_redemptions_user_id"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- game_missions
CREATE TABLE IF NOT EXISTS "game_missions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(64) NOT NULL UNIQUE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "window_type" VARCHAR(30) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_missions" PRIMARY KEY ("id")
);

-- game_user_missions
CREATE TABLE IF NOT EXISTS "game_user_missions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "mission_id" UUID NOT NULL,
  "period_key" VARCHAR(20) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "target" INTEGER NOT NULL DEFAULT 1,
  "completed_at" TIMESTAMPTZ,
  "claimed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_user_missions" PRIMARY KEY ("id"),
  CONSTRAINT "uq_game_user_missions_user_mission_period" UNIQUE ("user_id", "mission_id", "period_key")
);

CREATE INDEX IF NOT EXISTS "idx_game_user_missions_user_period" ON "game_user_missions" ("user_id", "period_key");

ALTER TABLE "game_user_missions"
  ADD CONSTRAINT "fk_game_user_missions_user_id"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "game_user_missions"
  ADD CONSTRAINT "fk_game_user_missions_mission_id"
  FOREIGN KEY ("mission_id") REFERENCES "game_missions"("id") ON DELETE CASCADE;

-- game_leagues
CREATE TABLE IF NOT EXISTS "game_leagues" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(64) NOT NULL UNIQUE,
  "title" VARCHAR(255) NOT NULL,
  "season_start_at" TIMESTAMPTZ,
  "season_end_at" TIMESTAMPTZ,
  "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_leagues" PRIMARY KEY ("id")
);

-- game_league_memberships
CREATE TABLE IF NOT EXISTS "game_league_memberships" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "league_id" UUID NOT NULL,
  "weekly_xp_valid" INTEGER NOT NULL DEFAULT 0,
  "rank" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_league_memberships" PRIMARY KEY ("id"),
  CONSTRAINT "uq_game_league_memberships_user_league" UNIQUE ("user_id", "league_id")
);

CREATE INDEX IF NOT EXISTS "idx_game_league_memberships_league_weekly_xp" ON "game_league_memberships" ("league_id", "weekly_xp_valid" DESC);

ALTER TABLE "game_league_memberships"
  ADD CONSTRAINT "fk_game_league_memberships_user_id"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "game_league_memberships"
  ADD CONSTRAINT "fk_game_league_memberships_league_id"
  FOREIGN KEY ("league_id") REFERENCES "game_leagues"("id") ON DELETE CASCADE;

-- game_achievements
CREATE TABLE IF NOT EXISTS "game_achievements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(64) NOT NULL UNIQUE,
  "tier" VARCHAR(20) NOT NULL,
  "category" VARCHAR(32) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "requirements" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "rewards" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_achievements" PRIMARY KEY ("id")
);

-- game_user_achievements
CREATE TABLE IF NOT EXISTS "game_user_achievements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "achievement_id" UUID NOT NULL,
  "is_unlocked" BOOLEAN NOT NULL DEFAULT FALSE,
  "progress" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "unlocked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_user_achievements" PRIMARY KEY ("id"),
  CONSTRAINT "uq_game_user_achievements_user_achievement" UNIQUE ("user_id", "achievement_id")
);

CREATE INDEX IF NOT EXISTS "idx_game_user_achievements_achievement_id" ON "game_user_achievements" ("achievement_id");

ALTER TABLE "game_user_achievements"
  ADD CONSTRAINT "fk_game_user_achievements_user_id"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "game_user_achievements"
  ADD CONSTRAINT "fk_game_user_achievements_achievement_id"
  FOREIGN KEY ("achievement_id") REFERENCES "game_achievements"("id") ON DELETE CASCADE;

-- game_streak_logs
CREATE TABLE IF NOT EXISTS "game_streak_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "date" VARCHAR(10) NOT NULL,
  "status" VARCHAR(20) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "pk_game_streak_logs" PRIMARY KEY ("id"),
  CONSTRAINT "uq_game_streak_logs_user_date" UNIQUE ("user_id", "date")
);

CREATE INDEX IF NOT EXISTS "idx_game_streak_logs_user_id" ON "game_streak_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_game_streak_logs_date" ON "game_streak_logs" ("date");

ALTER TABLE "game_streak_logs"
  ADD CONSTRAINT "fk_game_streak_logs_user_id"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

