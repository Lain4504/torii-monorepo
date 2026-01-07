-- 1. BẢNG NGƯỜI DÙNG VÀ PHÂN QUYỀN

-- Bảng chính người dùng
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    password VARCHAR(255),
    avatar_url TEXT,
    app_metadata JSONB DEFAULT '{}',
    user_metadata JSONB DEFAULT '{}',
    role VARCHAR(50) DEFAULT 'learner',
    verified_at TIMESTAMP,
    banned_until TIMESTAMP,
    last_sign_in_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bảng Role Permissions (Mapping Role - Permission) - Base permissions for a role
-- Bảng Role Permissions (Mapping Role - Permission)
CREATE TABLE role_permissions (
    role_code VARCHAR(50) NOT NULL,
    permission_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_code, permission_code)
);



-- Bảng user_identities (OAuth)
CREATE TABLE user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    provider_data JSONB,
    last_sign_in_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_id)
);

-- Bảng two_factor_auth
CREATE TABLE two_factor_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT FALSE,
    method VARCHAR(20),
    totp_secret VARCHAR(255),
    totp_backup_codes VARCHAR(100)[],
    enabled_at TIMESTAMP,
    last_used_at TIMESTAMP,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sessions (Thay thế refresh_tokens)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(100),
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. BẢNG KHÓA HỌC VÀ HỌC TẬP

-- Bảng khóa học
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Phân loại: 'vod' (Video) hoặc 'live' (WebRTC)
    type VARCHAR(20) DEFAULT 'vod' CHECK (type IN ('vod', 'live')),

    description TEXT,
    short_description VARCHAR(500),
    jlpt_level VARCHAR(5),
    
    -- AI Context: Metadata cho AI Learning Agent
    -- Schema: { "topics": string[], "grammar": string[], "vocab_theme": string, "tone": "formal"|"casual" }
    ai_metadata JSONB DEFAULT '{}', 
    
    thumbnail_url TEXT,
    preview_video_url TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_price DECIMAL(10,2),
    
    -- Cấu hình Live Class (WebRTC) - Chỉ dùng khi type='live'
    -- Schema: { "schedule": string, "max_students": number, "platform": "livekit"|"zoom" }
    live_config JSONB,

    duration_weeks INTEGER,
    total_lessons INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT FALSE,
    tags VARCHAR(50)[] DEFAULT '{}',
    learning_outcomes JSONB DEFAULT '[]',
    requirements JSONB DEFAULT '[]',
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bảng module khóa học
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- AI Context: Metadata cho Module
    -- Schema: { "summary": string, "key_concepts": string[] }
    ai_metadata JSONB DEFAULT '{}',

    order_index INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bảng bài học
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(20) NOT NULL,
    video_url TEXT,
    video_duration INTEGER,
    article_content TEXT,

    -- AI Context: Metadata cho Lesson
    -- Schema: { "transcript_summary": string, "key_points": string[] }
    ai_metadata JSONB DEFAULT '{}',

    order_index INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    is_unlocked BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Bảng audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    description TEXT NOT NULL,
    metadata JSONB,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng file_assets
CREATE TABLE file_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url TEXT UNIQUE NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    is_public BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    owner_id UUID,
    module_origin VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng room_info
-- CREATE TABLE room_info (
--     id SERIAL PRIMARY KEY,
--     room_title VARCHAR(255) DEFAULT '',
--     room_id VARCHAR(64) NOT NULL,
--     sid VARCHAR(64) UNIQUE,
--     joined_participants INTEGER DEFAULT 0,
--     is_running INTEGER DEFAULT 0,
--     is_recording INTEGER DEFAULT 0,
--     recorder_id VARCHAR(36) DEFAULT '',
--     is_active_rtmp INTEGER DEFAULT 0,
--     rtmp_node_id VARCHAR(36) DEFAULT '',
--     webhook_url VARCHAR(255) DEFAULT '',
--     is_breakout_room INTEGER DEFAULT 0,
--     parent_room_id VARCHAR(64) DEFAULT '',
--     creation_time INTEGER DEFAULT 0,
--     created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     ended TIMESTAMP,
--     modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng room_files
-- CREATE TABLE room_files (
--     id SERIAL PRIMARY KEY,
--     file_id VARCHAR(191) UNIQUE NOT NULL,
--     room_id VARCHAR(191) NOT NULL,
--     user_id VARCHAR(191) NOT NULL,
--     file_path VARCHAR(191) NOT NULL,
--     file_type VARCHAR(191) NOT NULL,
--     mime_type VARCHAR(191) NOT NULL,
--     file_size DOUBLE PRECISION DEFAULT 0,
--     created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng room_analytics
-- CREATE TABLE room_analytics (
--     id SERIAL PRIMARY KEY,
--     room_table_id INTEGER NOT NULL REFERENCES room_info(id) ON UPDATE CASCADE,
--     room_id VARCHAR(64) NOT NULL,
--     file_id VARCHAR(255) NOT NULL,
--     file_name VARCHAR(255) NOT NULL,
--     file_size DOUBLE PRECISION NOT NULL,
--     room_creation_time INTEGER NOT NULL,
--     creation_time INTEGER NOT NULL
-- );
--
-- -- Bảng room_artifacts
-- CREATE TABLE room_artifacts (
--     id BIGSERIAL PRIMARY KEY,
--     artifact_id VARCHAR(64) UNIQUE NOT NULL,
--     room_table_id INTEGER NOT NULL REFERENCES room_info(id) ON UPDATE CASCADE,
--     room_id VARCHAR(255) NOT NULL,
--     type VARCHAR(100) NOT NULL,
--     metadata JSONB,
--     created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Bảng đăng ký khóa học
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_status VARCHAR(20) DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'dropped')),
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed_at TIMESTAMP,
    completed_at TIMESTAMP,
    payment_id UUID,
    coupon_applied_id UUID,
    final_price DECIMAL(10,2) NOT NULL,
    is_gift BOOLEAN DEFAULT FALSE,
    gift_message TEXT,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(user_id, course_id)
);

-- Bảng tiến độ học tập
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    watched_duration INTEGER DEFAULT 0,
    total_duration INTEGER NOT NULL,
    last_watched_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    UNIQUE(enrollment_id, lesson_id)
);

-- Bảng giảng viên phụ trách khóa học
CREATE TABLE course_instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lecturer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, lecturer_id)
);
-- Bảng đánh giá khóa học
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng danh sách yêu thích
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);


-- -- 3. BẢNG LỚP HỌC TRỰC TUYẾN (Not in Prisma - Use RoomInfo)
--
-- -- Bảng lớp học trực tuyến
-- CREATE TABLE live_classes (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     lecturer_id UUID NOT NULL REFERENCES users(id),
--     start_time TIMESTAMP NOT NULL,
--     duration_minutes INTEGER NOT NULL,
--     max_students INTEGER,
--     current_students INTEGER DEFAULT 0,
--     meeting_id VARCHAR(100) UNIQUE,
--     meeting_password VARCHAR(50),
--     web_rtc_config JSONB,
--     status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
--     recording_url TEXT,
--     chat_enabled BOOLEAN DEFAULT TRUE,
--     whiteboard_enabled BOOLEAN DEFAULT TRUE,
--     screen_sharing_enabled BOOLEAN DEFAULT TRUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng đăng ký lớp học trực tuyến
-- CREATE TABLE live_class_enrollments (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'absent', 'late')),
--     joined_at TIMESTAMP,
--     left_at TIMESTAMP,
--     total_duration INTEGER DEFAULT 0,
--     participation_score INTEGER,
--     UNIQUE(live_class_id, user_id)
-- );
--
-- -- Bảng tài liệu lớp học
-- CREATE TABLE class_materials (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     file_url TEXT NOT NULL,
--     file_type VARCHAR(50),
--     file_size INTEGER,
--     uploaded_by UUID REFERENCES users(id),
--     uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     download_count INTEGER DEFAULT 0
-- );
--
-- -- Bảng ghi chú lớp học
-- CREATE TABLE class_notes (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     content TEXT NOT NULL,
--     timestamp INTEGER, -- seconds from start of class
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- 4. BẢNG KIỂM TRA VÀ CÂU HỎI


-- Bảng ngân hàng câu hỏi
-- CREATE TABLE question_bank (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     question_text TEXT NOT NULL,
--     question_type VARCHAR(30) NOT NULL,
--     jlpt_level VARCHAR(5),
--     category VARCHAR(50),
--     subcategory VARCHAR(50),
--     difficulty VARCHAR(20),
--     options JSONB,
--     correct_answer TEXT,
--     explanation TEXT,
--     tags VARCHAR(50)[] DEFAULT '{}',
--     created_by UUID,
--     status VARCHAR(20) DEFAULT 'active',
--     usage_count INTEGER DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 4. QUIZ (Not in Prisma)
--
-- -- Bảng bài kiểm tra
-- CREATE TABLE quizzes (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     quiz_type VARCHAR(30) CHECK (quiz_type IN ('lesson', 'module', 'course', 'practice', 'jlpt_mock')),
--     jlpt_level VARCHAR(5) CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
--     course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
--     lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
--     time_limit_minutes INTEGER,
--     passing_score DECIMAL(5,2),
--     max_attempts INTEGER DEFAULT 1,
--     shuffle_questions BOOLEAN DEFAULT TRUE,
--     show_explanation BOOLEAN DEFAULT FALSE,
--     status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
--     created_by UUID REFERENCES users(id),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng câu hỏi trong bài kiểm tra
-- CREATE TABLE quiz_questions (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
--     question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
--     order_index INTEGER NOT NULL,
--     points DECIMAL(5,2) DEFAULT 1.00,
--     UNIQUE(quiz_id, order_index)
-- );
--
-- -- Bảng kết quả làm bài
-- CREATE TABLE quiz_attempts (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
--     started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     completed_at TIMESTAMP,
--     score DECIMAL(5,2),
--     max_score DECIMAL(5,2),
--     percentage DECIMAL(5,2),
--     is_passed BOOLEAN,
--     time_taken_seconds INTEGER,
--     attempt_number INTEGER DEFAULT 1,
--     answers JSONB, -- Store user's answers
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng chi tiết kết quả từng câu
-- CREATE TABLE quiz_attempt_details (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
--     question_id UUID NOT NULL REFERENCES question_bank(id),
--     user_answer TEXT,
--     is_correct BOOLEAN,
--     points_earned DECIMAL(5,2),
--     time_spent_seconds INTEGER,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- 5. BẢNG THANH TOÁN VÀ KHUYẾN MÃI (MINIMAL - 4 Tables)

-- Bảng thanh toán
-- CREATE TABLE payments (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--
--     -- Thông tin giao dịch
--     amount DECIMAL(10,2) NOT NULL,
--     currency VARCHAR(3) DEFAULT 'VND',
--     payment_method VARCHAR(50) NOT NULL,           -- 'credit_card', 'bank_transfer', 'momo', 'zalopay', 'vnpay'
--     payment_gateway VARCHAR(50),                   -- 'stripe', 'paypal', 'vnpay', 'momo'
--
--     -- Transaction tracking
--     transaction_id VARCHAR(100) UNIQUE,
--     gateway_transaction_id VARCHAR(100),
--
--     -- Status
--     status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
--
--     -- Payment purpose
--     payment_type VARCHAR(30) DEFAULT 'course_purchase' CHECK (payment_type IN ('course_purchase', 'subscription', 'top_up', 'gift')),
--
--     -- References
--     enrollment_id UUID REFERENCES enrollments(id),
--
--     description TEXT,
--
--     -- Metadata (JSONB) - Chứa tất cả thông tin bổ sung:
--     -- {
--     --   "coupon_code": "SUMMER2024",
--     --   "discount_amount": 100000,
--     --   "original_price": 500000,
--     --   "final_price": 400000,
--     --   "gateway_response": {...},
--     --   "ip_address": "1.2.3.4",
--     --   "device": "mobile",
--     --   "invoice": {
--     --     "invoice_number": "INV-2024-001",
--     --     "billing_name": "Nguyen Van A",
--     --     "billing_address": "...",
--     --     "tax_id": "..."
--     --   }
--     -- }
--     metadata JSONB DEFAULT '{}',
--
--     -- Timestamps
--     completed_at TIMESTAMP,
--     failed_at TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng mã giảm giá
-- CREATE TABLE coupons (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     code VARCHAR(50) UNIQUE NOT NULL,
--     name VARCHAR(100) NOT NULL,
--     description TEXT,
--
--     -- Discount config
--     discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
--     discount_value DECIMAL(10,2) NOT NULL,
--
--     -- Conditions
--     min_order_amount DECIMAL(10,2),
--     max_discount_amount DECIMAL(10,2),
--
--     -- Validity
--     valid_from TIMESTAMP NOT NULL,
--     valid_until TIMESTAMP NOT NULL,
--
--     -- Usage limits
--     usage_limit INTEGER,                           -- Total uses across all users
--     usage_count INTEGER DEFAULT 0,                 -- Current usage count
--     user_usage_limit INTEGER DEFAULT 1,            -- Per user limit
--
--     -- Applicability
--     applicable_course_ids UUID[] DEFAULT '{}',     -- Empty = all courses
--     excluded_course_ids UUID[] DEFAULT '{}',
--
--     -- Status
--     status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
--
--     -- Ownership
--     created_by UUID REFERENCES users(id),
--
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng ví người dùng (User Wallet) - For credits/points
-- -- NOTE: Credits expiry được track ở wallet_transactions.metadata
-- -- Cần cronjob để tự động trừ credits hết hạn
-- CREATE TABLE user_wallets (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--
--     balance DECIMAL(10,2) DEFAULT 0.00,
--     currency VARCHAR(3) DEFAULT 'VND',
--
--     -- Points/Credits system
--     points INTEGER DEFAULT 0,
--
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng lịch sử giao dịch ví
-- -- Chứa cả REFUND logic (không cần bảng refunds riêng)
-- CREATE TABLE wallet_transactions (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     wallet_id UUID NOT NULL REFERENCES user_wallets(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--
--     -- Transaction type:
--     -- 'credit': Nạp tiền vào ví
--     -- 'debit': Trừ tiền từ ví (mua khóa học bằng credits)
--     -- 'refund': Hoàn tiền từ payment (chỉ credits, không hoàn tiền mặt)
--     -- 'reward': Thưởng từ hệ thống
--     -- 'expired': Trừ credits hết hạn
--     transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'refund', 'reward', 'expired')),
--
--     amount DECIMAL(10,2) NOT NULL,
--     points INTEGER DEFAULT 0,
--
--     balance_before DECIMAL(10,2) NOT NULL,
--     balance_after DECIMAL(10,2) NOT NULL,
--
--     -- Reference
--     reference_type VARCHAR(50),                    -- 'payment', 'enrollment', 'reward'
--     reference_id UUID,                             -- ID of related payment/enrollment
--
--     description TEXT,
--
--     -- Metadata (JSONB) - Chứa thông tin refund nếu là refund transaction:
--     -- For refund transactions:
--     -- {
--     --   "refund_reason": "not_satisfied",
--     --   "refund_detail": "Khóa học không phù hợp",
--     --   "original_payment_id": "payment-123",
--     --   "original_amount": 500000,
--     --   "bonus_percentage": 10,
--     --   "requested_at": "2024-01-01T10:00:00Z",
--     --   "approved_by": "staff-456",
--     --   "approved_at": "2024-01-02T10:00:00Z",
--     --   "expires_at": "2025-01-01"  // Credits expiry date
--     -- }
--     metadata JSONB DEFAULT '{}',
--
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- 6. BẢNG FLASHCARD VÀ HỌC TỪ VỰNG

-- Bảng bộ flashcard
-- CREATE TABLE flashcard_decks (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     name VARCHAR(255) NOT NULL,
--     description TEXT,
--     jlpt_level VARCHAR(5),
--     is_public BOOLEAN DEFAULT FALSE,
--     tags VARCHAR(50)[] DEFAULT '{}',
--     card_count INTEGER DEFAULT 0,
--     studied_count INTEGER DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng flashcard
-- -- Bảng flashcard
-- CREATE TABLE flashcards (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
--     front_text TEXT NOT NULL,
--     back_text TEXT NOT NULL,
--     example_sentence TEXT,
--     pronunciation TEXT,
--     image_url TEXT,
--     audio_url TEXT,
--     tags VARCHAR(50)[] DEFAULT '{}',
--     difficulty VARCHAR(20) DEFAULT 'medium',
--     next_review_date DATE,
--     interval_days INTEGER DEFAULT 1,
--     ease_factor DECIMAL(4,2) DEFAULT 2.50,
--     review_count INTEGER DEFAULT 0,
--     correct_count INTEGER DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Bảng lịch sử ôn tập - Not in Prisma
-- CREATE TABLE flashcard_reviews (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
--     rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- 1: Again, 2: Hard, 3: Good, 4: Easy
--     review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     next_review_date DATE,
--     time_spent_seconds INTEGER
-- );

-- -- 7. AI & ANALYTICS (Not in Prisma - Use RoomAnalytics/AuditLog)
--
-- -- Bảng tương tác AI
-- CREATE TABLE ai_interactions (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--     session_id VARCHAR(100),
--     agent_type VARCHAR(30) CHECK (agent_type IN ('sensei', 'assessment', 'analytics', 'support')),
--     input_text TEXT NOT NULL,
--     output_text TEXT,
--     input_type VARCHAR(20) CHECK (input_type IN ('text', 'audio', 'image')),
--     output_type VARCHAR(20) CHECK (output_type IN ('text', 'audio', 'image', 'json')),
--     metadata JSONB,
--     processing_time_ms INTEGER,
--     cost_units DECIMAL(10,4),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng phân tích học tập
-- CREATE TABLE learning_analytics (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     date DATE NOT NULL,
--     total_study_time_minutes INTEGER DEFAULT 0,
--     lessons_completed INTEGER DEFAULT 0,
--     quizzes_taken INTEGER DEFAULT 0,
--     quiz_score_avg DECIMAL(5,2),
--     flashcards_reviewed INTEGER DEFAULT 0,
--     weak_areas JSONB, -- Array of weak areas detected
--     recommendations JSONB, -- AI recommendations
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(user_id, date)
-- );
--
-- -- Bảng gợi ý học tập
-- CREATE TABLE study_recommendations (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     recommendation_type VARCHAR(50) NOT NULL,
--     priority INTEGER CHECK (priority BETWEEN 1 AND 5),
--     title VARCHAR(255) NOT NULL,
--     description TEXT NOT NULL,
--     action_url TEXT,
--     resource_ids UUID[], -- Related courses, lessons, quizzes
--     is_completed BOOLEAN DEFAULT FALSE,
--     completed_at TIMESTAMP,
--     expires_at TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


-- 8. BẢNG BLOG VÀ NỘI DUNG

-- Bảng bài viết blog
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt VARCHAR(500),
    content TEXT NOT NULL,
    cover_image_url TEXT,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    tags VARCHAR(50)[] DEFAULT '{}',
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. BẢNG THÔNG BÁO

-- Bảng thông báo người dùng
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_via VARCHAR(20)[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng bình luận blog
CREATE TABLE blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'spam', 'deleted')),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -- 10. ACHIEVEMENTS (Not in Prisma)
--
-- -- Bảng tags
-- CREATE TABLE tags (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name VARCHAR(50) UNIQUE NOT NULL,
--     slug VARCHAR(50) UNIQUE NOT NULL,
--     type VARCHAR(20) DEFAULT 'general', -- general, course, blog
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng thành tựu
-- CREATE TABLE achievements (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name VARCHAR(100) NOT NULL,
--     description TEXT,
--     icon_url TEXT,
--     achievement_type VARCHAR(50) CHECK (achievement_type IN ('course', 'streak', 'quiz', 'flashcard', 'participation', 'special')),
--     criteria JSONB NOT NULL, -- Criteria to unlock
--     points_reward INTEGER DEFAULT 0,
--     badge_image_url TEXT,
--     is_secret BOOLEAN DEFAULT FALSE
-- );
--
-- -- Bảng thành tựu người dùng
-- CREATE TABLE user_achievements (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
--     unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     progress_current INTEGER DEFAULT 0,
--     progress_target INTEGER,
--     is_unlocked BOOLEAN DEFAULT FALSE,
--     UNIQUE(user_id, achievement_id)
-- );

--10. BẢNG BÀI TẬP VÀ CHẤM ĐIỂM

-- Bảng bài tập
-- -- Bảng bài tập (Not in Prisma)
-- CREATE TABLE assignments (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     live_class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
--     course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     instructions TEXT,
--     assignment_type VARCHAR(30) CHECK (assignment_type IN ('essay', 'quiz', 'project', 'presentation')),
--     attachments JSONB, -- Array of file URLs
--     max_score DECIMAL(5,2) NOT NULL,
--     passing_score DECIMAL(5,2),
--     due_date TIMESTAMP,
--     allow_late_submission BOOLEAN DEFAULT FALSE,
--     late_penalty_per_day DECIMAL(5,2),
--     status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'grading', 'completed')),
--     created_by UUID REFERENCES users(id),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
--
-- -- Bảng nộp bài (Not in Prisma)
-- CREATE TABLE submissions (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     content TEXT,
--     attachments JSONB,
--     is_late BOOLEAN DEFAULT FALSE,
--     late_days INTEGER DEFAULT 0,
--     status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
--     score DECIMAL(5,2),
--     feedback TEXT,
--     graded_by UUID REFERENCES users(id),
--     graded_at TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(assignment_id, user_id)
-- );


-- INDEXES QUAN TRỌNG
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_courses_jlpt_level ON courses(jlpt_level);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_created_by ON courses(created_by);

CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);

CREATE INDEX idx_room_info_room_id ON room_info(room_id, is_running);
CREATE INDEX idx_room_files_room_id ON room_files(room_id);
CREATE INDEX idx_room_analytics_room_id ON room_analytics(room_id);
CREATE INDEX idx_room_artifacts_room_id ON room_artifacts(room_id);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX idx_file_assets_owner_id ON file_assets(owner_id);
CREATE INDEX idx_file_assets_status ON file_assets(status);

CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);

CREATE INDEX idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent_id ON blog_comments(parent_comment_id);
CREATE INDEX idx_blog_comments_created_at ON blog_comments(created_at DESC);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Indexes for sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Indexes for enrollments
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(completion_status);

-- Indexes for lesson_progress
CREATE INDEX idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- Indexes for payments
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);
CREATE INDEX idx_payments_enrollment_id ON payments(enrollment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Indexes for coupons
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_valid_dates ON coupons(valid_from, valid_until);

-- Indexes for user_wallets
CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);

-- Indexes for wallet_transactions
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at);

