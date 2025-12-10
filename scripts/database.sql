-- 1. BẢNG NGƯỜI DÙNG VÀ PHÂN QUYỀN

-- Bảng chính người dùng
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100) NOT NULL,
                       phone VARCHAR(20),
                       avatar_url TEXT,
                       role VARCHAR(20) NOT NULL CHECK (role IN ('learner', 'lecturer', 'staff', 'admin')),
                       status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
                       date_of_birth DATE,
                       gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
                       address TEXT,
                       bio TEXT,
                       jlpt_level VARCHAR(5) CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1', NULL)),
                       current_points INTEGER DEFAULT 0,
                       total_spent DECIMAL(10,2) DEFAULT 0.00,
                       email_verified BOOLEAN DEFAULT FALSE,
                       phone_verified BOOLEAN DEFAULT FALSE,
                       last_login_at TIMESTAMP,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       deleted_at TIMESTAMP
);

-- Bảng học viên (mở rộng từ users)
CREATE TABLE learners (
                          user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                          learning_style VARCHAR(50),
                          preferred_schedule VARCHAR(50),
                          target_jlpt_level VARCHAR(5) CHECK (target_jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
                          target_date DATE,
                          daily_goal_minutes INTEGER DEFAULT 30,
                          streak_days INTEGER DEFAULT 0,
                          last_study_date DATE,
                          total_study_time_minutes INTEGER DEFAULT 0,
                          achievements JSONB DEFAULT '[]'
);

-- Bảng giảng viên (mở rộng từ users)
CREATE TABLE lecturers (
                           user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                           employee_id VARCHAR(50) UNIQUE,
                           specialization TEXT[],
                           years_of_experience INTEGER,
                           hourly_rate DECIMAL(8,2),
                           rating DECIMAL(3,2) DEFAULT 0.00,
                           total_reviews INTEGER DEFAULT 0,
                           introduction_video_url TEXT,
                           credentials TEXT,
                           available_schedule JSONB,
                           is_available BOOLEAN DEFAULT TRUE
);

-- Bảng nhân viên (mở rộng từ users)
CREATE TABLE staff (
                       user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                       employee_id VARCHAR(50) UNIQUE,
                       department VARCHAR(50),
                       position VARCHAR(50),
                       permissions JSONB DEFAULT '[]'
);

-- Bảng refresh token
CREATE TABLE refresh_tokens (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                token VARCHAR(500) NOT NULL UNIQUE,
                                expires_at TIMESTAMP NOT NULL,
                                revoked BOOLEAN DEFAULT FALSE,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. BẢNG KHÓA HỌC VÀ HỌC TẬP

-- Bảng khóa học
CREATE TABLE courses (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         title VARCHAR(255) NOT NULL,
                         slug VARCHAR(255) UNIQUE NOT NULL,
                         description TEXT,
                         short_description VARCHAR(500),
                         jlpt_level VARCHAR(5) NOT NULL CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
                         thumbnail_url TEXT,
                         preview_video_url TEXT,
                         price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                         discount_price DECIMAL(10,2),
                         duration_weeks INTEGER,
                         total_lessons INTEGER DEFAULT 0,
                         total_quizzes INTEGER DEFAULT 0,
                         total_students INTEGER DEFAULT 0,
                         average_rating DECIMAL(3,2) DEFAULT 0.00,
                         total_reviews INTEGER DEFAULT 0,
                         status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
                         featured BOOLEAN DEFAULT FALSE,
                         is_free BOOLEAN DEFAULT FALSE,
                         tags VARCHAR(50)[] DEFAULT '{}',
                         learning_outcomes JSONB DEFAULT '[]',
                         requirements JSONB DEFAULT '[]',
                         created_by UUID REFERENCES users(id),
                         approved_by UUID REFERENCES users(id),
                         approved_at TIMESTAMP,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng module khóa học
CREATE TABLE course_modules (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                                title VARCHAR(255) NOT NULL,
                                description TEXT,
                                order_index INTEGER NOT NULL,
                                duration_minutes INTEGER DEFAULT 0,
                                is_unlocked BOOLEAN DEFAULT TRUE,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                UNIQUE(course_id, order_index)
);

-- Bảng bài học
CREATE TABLE lessons (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
                         title VARCHAR(255) NOT NULL,
                         content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'article', 'quiz', 'assignment')),
                         video_url TEXT,
                         video_duration INTEGER, -- seconds
                         article_content TEXT,
                         order_index INTEGER NOT NULL,
                         is_preview BOOLEAN DEFAULT FALSE,
                         is_unlocked BOOLEAN DEFAULT TRUE,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         UNIQUE(module_id, order_index)
);

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
                             payment_id UUID, -- Tham chiếu đến bảng payments
                             coupon_applied_id UUID, -- Tham chiếu đến bảng coupons
                             final_price DECIMAL(10,2) NOT NULL,
                             UNIQUE(user_id, course_id)
);

-- Bảng tiến độ học tập
CREATE TABLE lesson_progress (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
                                 lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
                                 status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
                                 watched_duration INTEGER DEFAULT 0, -- seconds
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


-- 3. BẢNG LỚP HỌC TRỰC TUYẾN (WebRTC)

-- Bảng lớp học trực tuyến
CREATE TABLE live_classes (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
                              title VARCHAR(255) NOT NULL,
                              description TEXT,
                              lecturer_id UUID NOT NULL REFERENCES users(id),
                              start_time TIMESTAMP NOT NULL,
                              duration_minutes INTEGER NOT NULL,
                              max_students INTEGER,
                              current_students INTEGER DEFAULT 0,
                              meeting_id VARCHAR(100) UNIQUE,
                              meeting_password VARCHAR(50),
                              web_rtc_config JSONB,
                              status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
                              recording_url TEXT,
                              chat_enabled BOOLEAN DEFAULT TRUE,
                              whiteboard_enabled BOOLEAN DEFAULT TRUE,
                              screen_sharing_enabled BOOLEAN DEFAULT TRUE,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đăng ký lớp học trực tuyến
CREATE TABLE live_class_enrollments (
                                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
                                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                        enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'absent', 'late')),
                                        joined_at TIMESTAMP,
                                        left_at TIMESTAMP,
                                        total_duration INTEGER DEFAULT 0,
                                        participation_score INTEGER,
                                        UNIQUE(live_class_id, user_id)
);

-- Bảng tài liệu lớp học
CREATE TABLE class_materials (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
                                 title VARCHAR(255) NOT NULL,
                                 description TEXT,
                                 file_url TEXT NOT NULL,
                                 file_type VARCHAR(50),
                                 file_size INTEGER,
                                 uploaded_by UUID REFERENCES users(id),
                                 uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 download_count INTEGER DEFAULT 0
);

-- Bảng ghi chú lớp học
CREATE TABLE class_notes (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
                             user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                             content TEXT NOT NULL,
                             timestamp INTEGER, -- seconds from start of class
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG KIỂM TRA VÀ CÂU HỎI

-- Bảng ngân hàng câu hỏi
CREATE TABLE question_bank (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               question_text TEXT NOT NULL,
                               question_type VARCHAR(30) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'matching', 'essay')),
                               jlpt_level VARCHAR(5) CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
                               category VARCHAR(50),
                               subcategory VARCHAR(50),
                               difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
                               options JSONB, -- { "A": "text", "B": "text", ... }
                               correct_answer TEXT, -- Could be single value or array for multiple correct
                               explanation TEXT,
                               tags VARCHAR(50)[] DEFAULT '{}',
                               created_by UUID REFERENCES users(id),
                               status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'review', 'archived')),
                               usage_count INTEGER DEFAULT 0,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng bài kiểm tra
CREATE TABLE quizzes (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         title VARCHAR(255) NOT NULL,
                         description TEXT,
                         quiz_type VARCHAR(30) CHECK (quiz_type IN ('lesson', 'module', 'course', 'practice', 'jlpt_mock')),
                         jlpt_level VARCHAR(5) CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
                         course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
                         lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
                         time_limit_minutes INTEGER,
                         passing_score DECIMAL(5,2),
                         max_attempts INTEGER DEFAULT 1,
                         shuffle_questions BOOLEAN DEFAULT TRUE,
                         show_explanation BOOLEAN DEFAULT FALSE,
                         status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
                         created_by UUID REFERENCES users(id),
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng câu hỏi trong bài kiểm tra
CREATE TABLE quiz_questions (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
                                question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
                                order_index INTEGER NOT NULL,
                                points DECIMAL(5,2) DEFAULT 1.00,
                                UNIQUE(quiz_id, order_index)
);

-- Bảng kết quả làm bài
CREATE TABLE quiz_attempts (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
                               started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               completed_at TIMESTAMP,
                               score DECIMAL(5,2),
                               max_score DECIMAL(5,2),
                               percentage DECIMAL(5,2),
                               is_passed BOOLEAN,
                               time_taken_seconds INTEGER,
                               attempt_number INTEGER DEFAULT 1,
                               answers JSONB, -- Store user's answers
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chi tiết kết quả từng câu
CREATE TABLE quiz_attempt_details (
                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                      attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
                                      question_id UUID NOT NULL REFERENCES question_bank(id),
                                      user_answer TEXT,
                                      is_correct BOOLEAN,
                                      points_earned DECIMAL(5,2),
                                      time_spent_seconds INTEGER,
                                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG THANH TOÁN VÀ KHUYẾN MÃI

-- Bảng thanh toán
CREATE TABLE payments (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                          amount DECIMAL(10,2) NOT NULL,
                          currency VARCHAR(3) DEFAULT 'VND',
                          payment_method VARCHAR(50) NOT NULL,
                          payment_gateway VARCHAR(50),
                          transaction_id VARCHAR(100) UNIQUE,
                          gateway_transaction_id VARCHAR(100),
                          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
                          description TEXT,
                          metadata JSONB,
                          completed_at TIMESTAMP,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng hóa đơn
CREATE TABLE invoices (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          payment_id UUID UNIQUE REFERENCES payments(id),
                          invoice_number VARCHAR(50) UNIQUE NOT NULL,
                          user_id UUID NOT NULL REFERENCES users(id),
                          amount DECIMAL(10,2) NOT NULL,
                          tax_amount DECIMAL(10,2) DEFAULT 0.00,
                          total_amount DECIMAL(10,2) NOT NULL,
                          items JSONB NOT NULL, -- Array of items purchased
                          billing_info JSONB,
                          issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          due_date DATE,
                          paid_at TIMESTAMP,
                          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'))
);

-- Bảng mã giảm giá
CREATE TABLE coupons (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         code VARCHAR(50) UNIQUE NOT NULL,
                         name VARCHAR(100) NOT NULL,
                         description TEXT,
                         discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'shipping')),
                         discount_value DECIMAL(10,2) NOT NULL,
                         min_order_amount DECIMAL(10,2),
                         max_discount_amount DECIMAL(10,2),
                         valid_from DATE NOT NULL,
                         valid_until DATE NOT NULL,
                         usage_limit INTEGER,
                         usage_count INTEGER DEFAULT 0,
                         user_usage_limit INTEGER DEFAULT 1,
                         applicable_course_ids UUID[] DEFAULT '{}', -- Empty array means all courses
                         excluded_course_ids UUID[] DEFAULT '{}',
                         status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
                         created_by UUID REFERENCES users(id),
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sử dụng coupon
CREATE TABLE coupon_redemptions (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
                                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                    payment_id UUID REFERENCES payments(id),
                                    order_amount DECIMAL(10,2) NOT NULL,
                                    discount_amount DECIMAL(10,2) NOT NULL,
                                    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG FLASHCARD VÀ HỌC TỪ VỰNG

-- Bảng bộ flashcard
CREATE TABLE flashcard_decks (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                 name VARCHAR(255) NOT NULL,
                                 description TEXT,
                                 jlpt_level VARCHAR(5) CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
                                 is_public BOOLEAN DEFAULT FALSE,
                                 tags VARCHAR(50)[] DEFAULT '{}',
                                 card_count INTEGER DEFAULT 0,
                                 studied_count INTEGER DEFAULT 0,
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng flashcard
CREATE TABLE flashcards (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
                            front_text TEXT NOT NULL,
                            back_text TEXT NOT NULL,
                            example_sentence TEXT,
                            pronunciation TEXT,
                            image_url TEXT,
                            audio_url TEXT,
                            tags VARCHAR(50)[] DEFAULT '{}',
                            difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
                            next_review_date DATE,
                            interval_days INTEGER DEFAULT 1,
                            ease_factor DECIMAL(4,2) DEFAULT 2.50,
                            review_count INTEGER DEFAULT 0,
                            correct_count INTEGER DEFAULT 0,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lịch sử ôn tập
CREATE TABLE flashcard_reviews (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                   flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
                                   rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- 1: Again, 2: Hard, 3: Good, 4: Easy
                                   review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   next_review_date DATE,
                                   time_spent_seconds INTEGER
);

-- 7. BẢNG AI AGENT VÀ PHÂN TÍCH

-- Bảng tương tác AI
CREATE TABLE ai_interactions (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                 session_id VARCHAR(100),
                                 agent_type VARCHAR(30) CHECK (agent_type IN ('sensei', 'assessment', 'analytics', 'support')),
                                 input_text TEXT NOT NULL,
                                 output_text TEXT,
                                 input_type VARCHAR(20) CHECK (input_type IN ('text', 'audio', 'image')),
                                 output_type VARCHAR(20) CHECK (output_type IN ('text', 'audio', 'image', 'json')),
                                 metadata JSONB,
                                 processing_time_ms INTEGER,
                                 cost_units DECIMAL(10,4),
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phân tích học tập
CREATE TABLE learning_analytics (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                    date DATE NOT NULL,
                                    total_study_time_minutes INTEGER DEFAULT 0,
                                    lessons_completed INTEGER DEFAULT 0,
                                    quizzes_taken INTEGER DEFAULT 0,
                                    quiz_score_avg DECIMAL(5,2),
                                    flashcards_reviewed INTEGER DEFAULT 0,
                                    weak_areas JSONB, -- Array of weak areas detected
                                    recommendations JSONB, -- AI recommendations
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    UNIQUE(user_id, date)
);

-- Bảng gợi ý học tập
CREATE TABLE study_recommendations (
                                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                       recommendation_type VARCHAR(50) NOT NULL,
                                       priority INTEGER CHECK (priority BETWEEN 1 AND 5),
                                       title VARCHAR(255) NOT NULL,
                                       description TEXT NOT NULL,
                                       action_url TEXT,
                                       resource_ids UUID[], -- Related courses, lessons, quizzes
                                       is_completed BOOLEAN DEFAULT FALSE,
                                       completed_at TIMESTAMP,
                                       expires_at TIMESTAMP,
                                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 8. BẢNG BLOG VÀ NỘI DUNG

-- Bảng bài viết blog
CREATE TABLE blog_posts (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            title VARCHAR(255) NOT NULL,
                            slug VARCHAR(255) UNIQUE NOT NULL,
                            excerpt VARCHAR(500),
                            content TEXT NOT NULL,
                            cover_image_url TEXT,
                            author_id UUID NOT NULL REFERENCES users(id),
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

-- 9. BẢNG THÔNG BÁO VÀ GAMIFICATION

-- Bảng thông báo
CREATE TABLE notifications (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               title VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,
                               notification_type VARCHAR(50) CHECK (notification_type IN ('system', 'course', 'live_class', 'payment', 'achievement', 'reminder')),
                               data JSONB, -- Additional data for deep linking
                               is_read BOOLEAN DEFAULT FALSE,
                               read_at TIMESTAMP,
                               sent_via VARCHAR(20)[] DEFAULT '{}', -- ['email', 'push', 'in_app']
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng thành tựu
CREATE TABLE achievements (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              name VARCHAR(100) NOT NULL,
                              description TEXT,
                              icon_url TEXT,
                              achievement_type VARCHAR(50) CHECK (achievement_type IN ('course', 'streak', 'quiz', 'flashcard', 'participation', 'special')),
                              criteria JSONB NOT NULL, -- Criteria to unlock
                              points_reward INTEGER DEFAULT 0,
                              badge_image_url TEXT,
                              is_secret BOOLEAN DEFAULT FALSE
);

-- Bảng thành tựu người dùng
CREATE TABLE user_achievements (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                   achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
                                   unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   progress_current INTEGER DEFAULT 0,
                                   progress_target INTEGER,
                                   is_unlocked BOOLEAN DEFAULT FALSE,
                                   UNIQUE(user_id, achievement_id)
);

--10. BẢNG BÀI TẬP VÀ CHẤM ĐIỂM

-- Bảng bài tập
CREATE TABLE assignments (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             live_class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
                             course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
                             title VARCHAR(255) NOT NULL,
                             description TEXT,
                             instructions TEXT,
                             assignment_type VARCHAR(30) CHECK (assignment_type IN ('essay', 'quiz', 'project', 'presentation')),
                             attachments JSONB, -- Array of file URLs
                             max_score DECIMAL(5,2) NOT NULL,
                             passing_score DECIMAL(5,2),
                             due_date TIMESTAMP,
                             allow_late_submission BOOLEAN DEFAULT FALSE,
                             late_penalty_per_day DECIMAL(5,2),
                             status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'grading', 'completed')),
                             created_by UUID REFERENCES users(id),
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng nộp bài
CREATE TABLE submissions (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
                             user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                             submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             content TEXT,
                             attachments JSONB,
                             is_late BOOLEAN DEFAULT FALSE,
                             late_days INTEGER DEFAULT 0,
                             status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
                             score DECIMAL(5,2),
                             feedback TEXT,
                             graded_by UUID REFERENCES users(id),
                             graded_at TIMESTAMP,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             UNIQUE(assignment_id, user_id)
);


-- INDEXES QUAN TRỌNG

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_courses_jlpt_level ON courses(jlpt_level);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_created_by ON courses(created_by);

CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(completion_status);

CREATE INDEX idx_live_classes_lecturer_id ON live_classes(lecturer_id);
CREATE INDEX idx_live_classes_start_time ON live_classes(start_time);
CREATE INDEX idx_live_classes_status ON live_classes(status);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at);

CREATE INDEX idx_learning_analytics_user_id_date ON learning_analytics(user_id, date);

