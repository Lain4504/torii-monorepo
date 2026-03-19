-- =============================================================================
-- NEW LMS PROJECT: CONTENT CORE SCHEMA (Program & Course Roadmap)
-- =============================================================================
-- Description: Professional PostgreSQL schema for structured learning paths,
--              versioned courses, and comprehensive content units.
-- =============================================================================

-- Prerequisites: Run auth_flow_schema.sql first to enable uuid-ossp 
--                and common triggers.

-- =============================================================================
-- 1. LEARNING CURRICULUM (TOP-LEVEL)
-- =============================================================================

-- Table: Programs (Specialized tracks or career paths)
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL, -- 'web-fullstack-2024'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    
    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Table: Courses (Reusable learning units)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL, -- 'react-basics'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50),                 -- 'Beginner', 'Advanced'
    thumbnail_url TEXT,
    
    -- Metadata
    category VARCHAR(100),            -- 'Frontend', 'Backend'
    tags TEXT[],                      -- e.g., ['javascript', 'web']
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Table: Program Roadmaps (Ordered Courses inside a Program)
CREATE TABLE program_courses (
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_index INT NOT NULL,          -- Important for sequential learning
    is_required BOOLEAN DEFAULT TRUE,  -- Whether student MUST pass this for program completion
    
    PRIMARY KEY (program_id, course_id),
    UNIQUE (program_id, order_index)
);

-- =============================================================================
-- 2. COURSE CONTENT (INTERNAL)
-- =============================================================================

-- Table: Modules (Chapters/Sections directly under a course)
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL,
    
    -- Description for the chapter
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Lessons (The actual learning units)
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    
    -- Content type
    type VARCHAR(20) NOT NULL,         -- 'VIDEO', 'READING', 'QUIZ', 'ASSIGNMENT'
    
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL,
    
    -- Content Data
    video_url TEXT,                    -- Main video (if type=VIDEO)
    content TEXT,                      -- Main markdown content (if type=READING)
    duration_mins INT,                 -- Estimated time to complete
    
    -- Metadata (Flexible JSON)
    metadata JSONB DEFAULT '{}',       -- e.g., video provider ID, quiz config
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Assignment Templates (Master repo of tasks)
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    
    -- Common config
    points_possible INT DEFAULT 100,
    allow_file_upload BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2.1 COURSE DELIVERY (VOD + DOCS + LIVE IN ONE COURSE)
-- =============================================================================

-- Table: Course Runs (a concrete cohort/class opening of a course)
-- Notes:
-- - A course can have multiple runs (different start/end dates, instructor team, schedules).
-- - Use `mode` to indicate whether this run includes live teaching.
CREATE TABLE course_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    code VARCHAR(120) UNIQUE NOT NULL,             -- e.g. 'react-basics-2026-spring'

    title VARCHAR(255),
    mode VARCHAR(20) NOT NULL DEFAULT 'BLENDED',   -- 'VOD' | 'LIVE' | 'BLENDED'
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',   -- 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',   -- IANA tz, e.g. 'Asia/Ho_Chi_Minh'

    metadata JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (mode IN ('VOD', 'LIVE', 'BLENDED')),
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'))
);

-- Table: Course Run Instructors (teachers for a run)
CREATE TABLE course_run_instructors (
    course_run_id UUID NOT NULL REFERENCES course_runs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL DEFAULT 'INSTRUCTOR', -- 'INSTRUCTOR' | 'TA' | 'HOST'
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (course_run_id, user_id),
    CHECK (role IN ('INSTRUCTOR', 'TA', 'HOST'))
);

-- Table: Enrollments (user joins a specific run)
CREATE TABLE course_run_enrollments (
    course_run_id UUID NOT NULL REFERENCES course_runs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED', -- 'ENROLLED' | 'COMPLETED' | 'DROPPED'
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}',
    PRIMARY KEY (course_run_id, user_id),
    CHECK (status IN ('ENROLLED', 'COMPLETED', 'DROPPED'))
);

-- Table: Live Sessions (a live unit inside a course run; can be linked into the course flow)
-- Notes:
-- - `lesson_id` is optional: if you want live sessions to appear inside module/lesson ordering, create a lesson with type='LIVE'.
CREATE TABLE live_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_run_id UUID NOT NULL REFERENCES course_runs(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

    metadata JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (status IN ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'))
);

-- Table: Live Session Slots (fixed teaching hours; recurring weekly pattern)
-- Notes:
-- - Store weekly time slots; actual occurrences can be derived or materialized later if needed.
CREATE TABLE live_session_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    live_session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,

    weekday SMALLINT NOT NULL,                      -- 1..7 (Mon..Sun)
    start_time TIME NOT NULL,                       -- local time in course_runs.timezone
    end_time TIME NOT NULL,

    starts_on DATE,                                 -- effective date range (optional)
    ends_on DATE,

    location_type VARCHAR(20) NOT NULL DEFAULT 'ONLINE', -- 'ONLINE' | 'OFFLINE' | 'HYBRID'
    meeting_url TEXT,

    metadata JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (weekday BETWEEN 1 AND 7),
    CHECK (end_time > start_time),
    CHECK (location_type IN ('ONLINE', 'OFFLINE', 'HYBRID'))
);

-- =============================================================================
-- 2.2 NOTIFICATIONS (IN-APP / PUSH READY)
-- =============================================================================

-- Table: Notification Templates (optional; for reusable messages)
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(120) UNIQUE NOT NULL,             -- e.g. 'course.new_lesson'
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    default_channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP', -- 'IN_APP' | 'PUSH'
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (default_channel IN ('IN_APP', 'PUSH'))
);

-- Table: Notifications (user inbox)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,

    channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP', -- 'IN_APP' | 'PUSH'
    type VARCHAR(120) NOT NULL,                    -- app-defined category, e.g. 'SYSTEM', 'LEARNING', 'SOCIAL'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',

    status VARCHAR(20) NOT NULL DEFAULT 'QUEUED',  -- 'QUEUED' | 'SENT' | 'FAILED'
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (channel IN ('IN_APP', 'PUSH')),
    CHECK (status IN ('QUEUED', 'SENT', 'FAILED'))
);

-- =============================================================================
-- 2.3 GAMIFICATION (LEVEL-BASED, NO POINTS)
-- =============================================================================

-- Table: Levels (XP-based progression)
CREATE TABLE levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(60) UNIQUE NOT NULL,              -- e.g. 'level_1'
    name VARCHAR(120) NOT NULL,                    -- e.g. 'Beginner'
    rank INT NOT NULL,                             -- increasing order
    description TEXT,
    xp_required INT NOT NULL DEFAULT 0 CHECK (xp_required >= 0), -- XP threshold to reach this level
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rank)
);

-- Table: User Level (current level snapshot + XP)
CREATE TABLE user_levels (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE RESTRICT,
    xp_total INT NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Gamification Events (generic ledger for XP / points / future currencies)
-- Notes:
-- - Use `currency` to distinguish XP vs other reward types (if added later).
-- - `idempotency_key` is REQUIRED to avoid double-processing the same logical event.
CREATE TABLE gamification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    event_type VARCHAR(80) NOT NULL,               -- e.g. 'lesson.completed', 'daily_checkin'
    amount INT NOT NULL CHECK (amount > 0),
    currency VARCHAR(20) NOT NULL DEFAULT 'XP',    -- 'XP' (default), can extend later
    source VARCHAR(40),                            -- 'SYSTEM' | 'ADMIN' | 'IMPORT' | etc.

    idempotency_key VARCHAR(120) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, idempotency_key),
    CHECK (currency IN ('XP'))
);

-- =============================================================================
-- 2.4 ACHIEVEMENTS (THÀNH TỰU)
-- =============================================================================

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(80) UNIQUE NOT NULL,              -- e.g. 'first_course_completed'
    name VARCHAR(150) NOT NULL,
    description TEXT,
    icon_url TEXT,
    criteria JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE RESTRICT,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}',
    PRIMARY KEY (user_id, achievement_id)
);

-- =============================================================================
-- 2.5 CERTIFICATES (CHỨNG CHỈ)
-- =============================================================================

-- Table: Certificate Templates (config for issuance)
CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(80) UNIQUE NOT NULL,              -- e.g. 'program_completion_v1'
    name VARCHAR(150) NOT NULL,
    description TEXT,
    template_url TEXT,                             -- link to HTML/PDF template or asset bundle

    scope_type VARCHAR(20) NOT NULL,               -- 'PROGRAM' | 'COURSE'
    scope_id UUID NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (scope_type IN ('PROGRAM', 'COURSE'))
);

-- Table: Issued Certificates (to users)
CREATE TABLE user_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES certificate_templates(id) ON DELETE RESTRICT,

    certificate_no VARCHAR(50) UNIQUE NOT NULL,    -- human-readable id
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    file_url TEXT,                                 -- generated PDF link (optional)
    metadata JSONB NOT NULL DEFAULT '{}',

    UNIQUE(user_id, template_id)
);

-- =============================================================================
-- 2.6 DAILY CHECK-IN & STREAK (ĐIỂM DANH HẰNG NGÀY)
-- =============================================================================

-- Table: Daily check-ins (immutable history)
CREATE TABLE daily_checkins (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,                    -- user's local date (decided by app/server)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}',
    PRIMARY KEY (user_id, checkin_date)
);

-- Table: Streak snapshot (fast reads; can be derived from daily_checkins)
CREATE TABLE user_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INT NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    last_checkin_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. PAYMENT (MOBILE IN-APP PURCHASE FOCUS: iOS/Android)
-- =============================================================================

-- =============================================================================
-- Table: Store Products (mapping LMS purchasables to app store SKUs)
-- Notes:
-- - `sku` should match App Store / Play Console product ID.
-- - `purchasable_type` describes what the user unlocks (e.g. program/course).
CREATE TABLE store_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(10) NOT NULL,                 -- 'IOS' | 'ANDROID'
    sku VARCHAR(255) NOT NULL,

    purchasable_type VARCHAR(30) NOT NULL,         -- 'PROGRAM' | 'COURSE'
    purchasable_id UUID NOT NULL,                  -- references programs/courses logically (FK not enforced due to polymorphism)

    title VARCHAR(255),
    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(platform, sku),
    CHECK (platform IN ('IOS', 'ANDROID')),
    CHECK (purchasable_type IN ('PROGRAM', 'COURSE'))
);

-- Table: Orders (one per checkout intent; supports idempotency)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    platform VARCHAR(10) NOT NULL,                 -- 'IOS' | 'ANDROID'
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED', -- 'CREATED' | 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED' | 'REFUNDED'

    currency CHAR(3) NOT NULL,                     -- ISO-4217 e.g. 'USD', 'VND'
    amount_total_cents INT NOT NULL CHECK (amount_total_cents >= 0),

    -- Mobile app idempotency key (per user per platform)
    -- e.g. generated on client for a checkout session to prevent duplicate orders
    idempotency_key VARCHAR(80),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    UNIQUE(user_id, platform, idempotency_key),
    CHECK (platform IN ('IOS', 'ANDROID')),
    CHECK (status IN ('CREATED', 'PENDING', 'PAID', 'CANCELLED', 'FAILED', 'REFUNDED'))
);

-- Table: Order Items (what is being purchased)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    store_product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),

    unit_amount_cents INT NOT NULL CHECK (unit_amount_cents >= 0),
    total_amount_cents INT NOT NULL CHECK (total_amount_cents >= 0),

    metadata JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: In-app Purchase Transactions (verification & reconciliation)
-- Notes:
-- - `transaction_id` is the platform transaction identifier (Apple transactionId, Google purchaseToken/orderId).
-- - Enforce uniqueness to guarantee idempotent processing.
-- - Raw receipts can be large; store as TEXT and/or in `metadata`.
CREATE TABLE iap_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    platform VARCHAR(10) NOT NULL,                 -- 'IOS' | 'ANDROID'
    status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED',-- 'RECEIVED' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'

    transaction_id VARCHAR(255) NOT NULL,
    original_transaction_id VARCHAR(255),          -- iOS subscription/restore support (optional for consumables)

    product_sku VARCHAR(255),                      -- redundant but useful for debugging

    receipt TEXT,                                 -- raw receipt / signed payload
    verified_at TIMESTAMPTZ,
    provider_response JSONB NOT NULL DEFAULT '{}', -- verification response payload

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(platform, transaction_id),
    CHECK (platform IN ('IOS', 'ANDROID')),
    CHECK (status IN ('RECEIVED', 'VERIFIED', 'REJECTED', 'REFUNDED'))
);

-- Table: Entitlements (what the user has unlocked)
-- Notes:
-- - `source` indicates how entitlement is granted (payment/admin/grant).
-- - This table is the single source of truth for access checks.
CREATE TABLE entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    entitlement_type VARCHAR(30) NOT NULL,         -- 'PROGRAM' | 'COURSE'
    entitlement_id UUID NOT NULL,

    source VARCHAR(20) NOT NULL DEFAULT 'PAYMENT', -- 'PAYMENT' | 'ADMIN' | 'SYSTEM'
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    metadata JSONB NOT NULL DEFAULT '{}',

    UNIQUE(user_id, entitlement_type, entitlement_id),
    CHECK (entitlement_type IN ('PROGRAM', 'COURSE')),
    CHECK (source IN ('PAYMENT', 'ADMIN', 'SYSTEM'))
);

-- Add Triggers for updated_at
CREATE TRIGGER update_programs_timestamp BEFORE UPDATE ON programs FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_courses_timestamp BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_modules_timestamp BEFORE UPDATE ON modules FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_lessons_timestamp BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_assignments_timestamp BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_course_runs_timestamp BEFORE UPDATE ON course_runs FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_live_sessions_timestamp BEFORE UPDATE ON live_sessions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_live_session_slots_timestamp BEFORE UPDATE ON live_session_slots FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_notification_templates_timestamp BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_notifications_timestamp BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_levels_timestamp BEFORE UPDATE ON levels FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_user_levels_timestamp BEFORE UPDATE ON user_levels FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_achievements_timestamp BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_certificate_templates_timestamp BEFORE UPDATE ON certificate_templates FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_user_streaks_timestamp BEFORE UPDATE ON user_streaks FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_store_products_timestamp BEFORE UPDATE ON store_products FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_iap_transactions_timestamp BEFORE UPDATE ON iap_transactions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- =============================================================================
-- 4. TRIGGERS & INDEXES
-- =============================================================================

-- Create Performance Indexes
CREATE INDEX idx_programs_code ON programs(code);
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_program_courses_order ON program_courses(program_id, order_index);
CREATE INDEX idx_modules_course_order ON modules(course_id, order_index);
CREATE INDEX idx_lessons_module_order ON lessons(module_id, order_index);
CREATE INDEX idx_courses_category ON courses(category);

-- Course delivery / live indexes
CREATE INDEX idx_course_runs_course_id ON course_runs(course_id);
CREATE INDEX idx_course_runs_status ON course_runs(status);
CREATE INDEX idx_course_run_instructors_user_id ON course_run_instructors(user_id);
CREATE INDEX idx_course_run_enrollments_user_id ON course_run_enrollments(user_id);
CREATE INDEX idx_live_sessions_course_run_id ON live_sessions(course_run_id);
CREATE INDEX idx_live_sessions_lesson_id ON live_sessions(lesson_id);
CREATE INDEX idx_live_session_slots_live_session_id ON live_session_slots(live_session_id);
CREATE INDEX idx_live_session_slots_weekday_time ON live_session_slots(weekday, start_time);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at);

-- Gamification indexes
CREATE INDEX idx_levels_rank ON levels(rank);
CREATE INDEX idx_levels_xp_required ON levels(xp_required);
CREATE INDEX idx_gamification_events_user_id ON gamification_events(user_id);
CREATE INDEX idx_gamification_events_created_at ON gamification_events(created_at);
CREATE INDEX idx_gamification_events_type ON gamification_events(event_type);

-- Achievements indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at);

-- Certificates indexes
CREATE INDEX idx_certificate_templates_scope ON certificate_templates(scope_type, scope_id);
CREATE INDEX idx_user_certificates_user_id ON user_certificates(user_id);
CREATE INDEX idx_user_certificates_issued_at ON user_certificates(issued_at);

-- Check-in / streak indexes
CREATE INDEX idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX idx_daily_checkins_date ON daily_checkins(checkin_date);

-- Payment indexes
CREATE INDEX idx_store_products_purchasable ON store_products(purchasable_type, purchasable_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_platform ON orders(platform);
CREATE INDEX idx_orders_idempotency ON orders(user_id, platform, idempotency_key);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_iap_transactions_order_id ON iap_transactions(order_id);
CREATE INDEX idx_iap_transactions_user_id ON iap_transactions(user_id);
CREATE INDEX idx_entitlements_user_id ON entitlements(user_id);
CREATE INDEX idx_entitlements_target ON entitlements(entitlement_type, entitlement_id);
