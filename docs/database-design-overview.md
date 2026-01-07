# Database Design - Torii Nihongo Learning Platform

## Project Information

**Capstone Project Name:**
- English: WebRTC-based live classes and FastMCP-powered AI feedback solution for a Japanese Learning Center
- Vietnamese: Giải pháp lớp học trực tuyến WebRTC và AI phản hồi thời gian thực bằng FastMCP cho trung tâm Nhật Ngữ
- Abbreviation: SP26SE005

## Database Overview

Hệ thống sử dụng **PostgreSQL** làm database chính với **Prisma ORM** để quản lý schema và migrations.

### Technology Stack
- Database: PostgreSQL
- ORM: Prisma
- Primary Key: UUID (gen_random_uuid())
- Timestamps: TIMESTAMP với timezone

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    %% User Management
    User ||--o{ UserIdentity : "has"
    User ||--o| TwoFactorAuth : "has"
    User ||--o{ Session : "has"
    User ||--o{ AuditLog : "creates"
    
    %% Course Management
    Course ||--o{ Module : "contains"
    Module ||--o{ Lesson : "contains"
    Course ||--o{ CourseInstructor : "taught_by"
    User ||--o{ CourseInstructor : "lecturer"
    
    %% Enrollment & Progress
    User ||--o{ Enrollment : "enrolls"
    Course ||--o{ Enrollment : "enrolled_in"
    Enrollment ||--o{ LessonProgress : "tracks"
    Lesson ||--o{ LessonProgress : "progress"
    
    %% Live Classes (WebRTC)
    Course ||--o{ LiveClass : "has"
    User ||--o{ LiveClass : "lecturer"
    LiveClass ||--o{ LiveClassEnrollment : "enrolls"
    User ||--o{ LiveClassEnrollment : "student"
    LiveClass ||--o{ RoomInfo : "uses"
    LiveClass ||--o{ ClassMaterial : "has"
    
    %% Quizzes & Assessments
    Course ||--o{ Quiz : "has"
    Lesson ||--o{ Quiz : "has"
    Quiz ||--o{ QuizQuestion : "contains"
    QuestionBank ||--o{ QuizQuestion : "used_in"
    User ||--o{ QuizAttempt : "attempts"
    Quiz ||--o{ QuizAttempt : "attempted"
    QuizAttempt ||--o{ QuizAttemptDetail : "details"
    QuestionBank ||--o{ QuizAttemptDetail : "answered"
    
    %% Payments & Coupons
    User ||--o{ Payment : "makes"
    Enrollment ||--o| Payment : "paid_by"
    Coupon ||--o{ Payment : "applied"
    User ||--o| UserWallet : "has"
    UserWallet ||--o{ WalletTransaction : "transactions"
    
    %% Flashcards
    User ||--o{ FlashcardDeck : "owns"
    FlashcardDeck ||--o{ Flashcard : "contains"
    
    %% Blog & Community
    User ||--o{ BlogPost : "writes"
    BlogPost ||--o{ BlogComment : "has"
    User ||--o{ BlogComment : "comments"
    
    %% Notifications
    User ||--o{ Notification : "receives"
    
    %% Wishlist & Reviews
    User ||--o{ Wishlist : "wishes"
    Course ||--o{ Wishlist : "wished"
    User ||--o{ Review : "reviews"
    Course ||--o{ Review : "reviewed"
    
    %% Assignments
    LiveClass ||--o{ Assignment : "has"
    Course ||--o{ Assignment : "has"
    Assignment ||--o{ Submission : "submitted"
    User ||--o{ Submission : "submits"
    
    %% Gamification
    User ||--o{ UserAchievement : "earns"
    Achievement ||--o{ UserAchievement : "unlocked"
    User ||--o{ UserPoints : "has"
    
    %% File Management
    User ||--o{ FileAsset : "uploads"
    
    User {
        uuid id PK
        varchar email UK
        varchar display_name
        varchar password
        text avatar_url
        jsonb app_metadata
        jsonb user_metadata
        varchar role
        timestamp verified_at
        timestamp banned_until
        timestamp created_at
    }
    
    Course {
        uuid id PK
        varchar title
        varchar slug UK
        varchar type
        text description
        varchar jlpt_level
        decimal price
        decimal discount_price
        int total_students
        decimal average_rating
        varchar status
        timestamp created_at
    }
    
    Enrollment {
        uuid id PK
        uuid user_id FK
        uuid course_id FK
        timestamp enrollment_date
        varchar completion_status
        decimal completion_percentage
        uuid payment_id FK
        boolean is_gift
        uuid sender_id FK
    }
    
    LiveClass {
        uuid id PK
        uuid course_id FK
        uuid lecturer_id FK
        varchar title
        timestamp start_time
        int duration_minutes
        int max_students
        varchar status
        varchar room_id
    }
    
    Payment {
        uuid id PK
        uuid user_id FK
        decimal amount
        varchar payment_method
        varchar status
        uuid enrollment_id FK
        uuid coupon_id FK
        timestamp created_at
    }
    
    Quiz {
        uuid id PK
        varchar title
        varchar quiz_type
        varchar jlpt_level
        uuid course_id FK
        uuid lesson_id FK
        int time_limit_minutes
        decimal passing_score
        varchar status
    }
    
    QuestionBank {
        uuid id PK
        text question_text
        varchar question_type
        varchar jlpt_level
        jsonb options
        text correct_answer
        text explanation
    }
```

## Database Schema Groups

### 1. User Management & Authentication
- Users, Roles, Permissions
- Authentication (Sessions, OAuth, 2FA)
- Audit Logs

### 2. Course Management
- Courses, Modules, Lessons
- Course Instructors
- Course Metadata & AI Context

### 3. Enrollment & Learning Progress
- Enrollments
- Lesson Progress Tracking
- Course Completion

### 4. Live Classes (WebRTC)
- Live Class Schedules
- Live Class Enrollments
- Room Management (LiveKit)
- Class Materials
- Attendance Tracking

### 5. Assessments & Quizzes
- Question Bank
- Quizzes (Practice, JLPT Mock)
- Quiz Attempts & Results

### 6. Payments & Financial
- Payments & Transactions
- Coupons & Promotions
- User Wallets & Credits

### 7. Flashcards & Vocabulary
- Flashcard Decks
- Flashcards with SRS Algorithm

### 8. Assignments & Submissions
- Assignments
- Submissions & Grading

### 9. Gamification
- Achievements
- User Points & Badges
- Leaderboards

### 10. Community & Content
- Blog Posts
- Comments
- Notifications

### 11. File Management
- File Assets
- Room Files (LiveKit)

---

**Next:** See detailed schema in `database-design-schema.md`

