# Torii Monorepo — Function/Screen Report

> Nguồn kiểm tra: `apps/web-learner` (Next.js learner), `apps/web-admin` (Vite admin), `apps/meet` (LiveKit meet).
>
> Ghi chú mobile: repo không thấy app React Native/Expo; theo yêu cầu, **Mobile App (Learner)** được ghi nhận là **đầy đủ tính năng learner**.

## Bảng report

| # | Function/Screen | Feature | Level* | Function/Screen Details | Planned | Status |
|---:|---|---|---|---|---|---|
| 0 | Home Page | Common | Simple | Learner web: `/` redirect sang `/dashboard` | Iteration 1 (Tiên) | Pending |
| 1 | User Login | Common | Simple | Learner web: `/login` (có flow 2FA: `/verify-2fa`); Admin web: `/login` (2FA: `/auth/verify-2fa`) | Iteration 1 (Tiên) | Pending |
| 2 | User Register | Common | Simple | Learner web: `/register` (sau đăng ký/active có các trang: `/verify-request`, `/verify`, `/resend-verification`) | Iteration 1 (Tiên) | Pending |
| 3 | Reset Password | Common | Medium | Learner web: `/forgot-password`, `/reset-password`; Admin web: `/forgot-password`, `/reset-password` | Iteration 1 (Tiên) | Pending |
| 4 | User Authorization | Common | Complex | Admin web có `AuthGuard` + `RoutePermissionGuard` (RBAC) theo permission | Iteration 1 (Khang) | Pending |
| 5 | User Profile | Common | Simple | Learner: `/dashboard/profile`; Admin: `/profile` | Iteration 2 (Tiên) | Pending |
| 6 | Change Password | Common | Simple | Nằm trong Learner Settings (`/dashboard/settings`) / Admin Settings (`/settings`) | Iteration 2 (Tiên) | Pending |
| 7 | Blogs List | Public | Medium | Learner: `/dashboard/blogs`; Admin CRUD: `/blogs` | Iteration 2 (Khang) | Pending |
| 8 | Blog Details | Public | Simple | Learner: `/dashboard/blogs/[slug]`; Admin edit: `/blogs/:id/edit` | Iteration 2 (Khang) | Pending |
| 9 | Posts List | Marketing | Medium | **Không thấy module “Posts” riêng**; đang dùng “Blogs” | Iteration 2 (Khang) | Pending |
| 10 | Post Details | Marketing | Medium | **Không thấy module “Posts” riêng**; đang dùng “Blog Details” | Iteration 2 (Khang) | Pending |
| 11 | Sliders List | Marketing | Medium | **Không thấy CMS/feature Slider marketing** (chỉ có UI slider component) | Iteration 3 (Khang) | Pending |
| 12 | Slider Details | Marketing | Simple | **Không thấy** | Iteration 3 (Khang) | Pending |
| 13 | Users List | Admin | Medium | Admin web: `/users` (UsersManagement) | Iteration 1 (Khang) | Pending |
| 14 | User Details | Admin | Medium | Admin web: trong `/users` (chi tiết/ thao tác theo UI) | Iteration 1 (Khang) | Pending |
| 15 | Dashboard (Learner) | Learner | Medium | Learner: `/dashboard` | Iteration 1 (Hiếu) | Pending |
| 16 | My Courses | Learner | Medium | Learner: `/dashboard/my-courses` + `/dashboard/my-courses/[courseId]` | Iteration 1 (Hiếu) | Pending |
| 17 | Course Catalog (Available Courses) | Learner | Medium | Learner: `/dashboard/available-courses` + `/dashboard/available-courses/class/[deliveryScopeId]` | Iteration 1 (Hiếu) | Pending |
| 18 | Course Details (Learning) | Learner | Medium | Learner: `/courses/[courseId]` | Iteration 1 (Hiếu) | Pending |
| 19 | Learn Course (Lesson player) | Learner | Complex | Learner: `/courses/[courseId]/learn` | Iteration 2 (Hiếu) | Pending |
| 20 | Quizzes List | Learner | Medium | Learner: `/courses/[courseId]/quizzes` | Iteration 2 (Hiếu) | Pending |
| 21 | Quiz Details/Take | Learner | Medium | Learner: `/courses/[courseId]/quizzes/[quizId]` | Iteration 2 (Hiếu) | Pending |
| 22 | Course Certificate | Learner | Simple | Learner: `/courses/[courseId]/certificate`; list: `/dashboard/certificates`; verify public: `/verify/[code]` | Iteration 3 (Hiếu) | Pending |
| 23 | Assignments (Learner view) | Learner | Medium | Learner: `/dashboard/my-courses/[courseId]/assignments/[classAssignmentId]` | Iteration 3 (Hiếu) | Pending |
| 24 | Schedule (Calendar) | Learner | Complex | Learner: `/dashboard/schedule` (đọc “session instances” theo spec live sessions) | Iteration 2 (Luân) | Pending |
| 25 | Notifications | Common | Simple | Learner: `/dashboard/notifications`; Admin: `/notifications` (ops) | Iteration 2 (Tiên) | Pending |
| 26 | FAQ | Public | Simple | Learner: `/dashboard/faq` | Iteration 2 (Tiên) | Pending |
| 27 | Support/Tickets | Common | Medium | Learner: `/dashboard/support`; Admin: `/tickets` | Iteration 3 (Khang) | Pending |
| 28 | Reviews | Learner | Simple | Learner: `/dashboard/reviews` | Iteration 3 (Hiếu) | Pending |
| 29 | Leaderboard | Gamification | Medium | Learner: `/dashboard/leaderboard` | Iteration 3 (Phương) | Pending |
| 30 | Achievements | Gamification | Medium | Learner: `/dashboard/achievements`; Admin: `/achievements` | Iteration 3 (Phương) | Pending |
| 31 | Rewards | Gamification | Medium | Learner: `/dashboard/rewards`; Admin: `/rewards` | Iteration 3 (Phương) | Pending |
| 32 | Coupons (Learner view) | Commerce | Medium | Learner: `/dashboard/coupons`; Admin manage: `/coupons` | Iteration 2 (Khang) | Pending |
| 33 | Checkout | Commerce | Complex | Learner: `/checkout/[courseId]` | Iteration 2 (Khang) | Pending |
| 34 | Payment Result | Commerce | Simple | Learner: `/payment/success`, `/payment/cancel` | Iteration 2 (Khang) | Pending |
| 35 | Subscriptions (Learner) | Commerce | Medium | Learner: `/dashboard/payment/subscriptions` | Iteration 3 (Khang) | Pending |
| 36 | Payment (Learner) | Commerce | Medium | Learner: `/dashboard/payment` | Iteration 3 (Khang) | Pending |
| 37 | JLPT Dashboard/List | Learner | Medium | Learner: `/dashboard/jlpt-list-exam`, `/dashboard/jlpt/[level]` | Iteration 2 (Phương) | Pending |
| 38 | JLPT Attempt | Learner | Complex | Learner: `/dashboard/jlpt/attempt` + learning flow `/jlpt/attempt/section` | Iteration 2 (Phương) | Pending |
| 39 | JLPT Attempt History | Learner | Medium | Learner: `/dashboard/jlpt/attempt/history` + `/[attemptId]` | Iteration 2 (Phương) | Pending |
| 40 | Exams List/Detail | Learner | Medium | Learner: `/exams/[examId]` | Iteration 3 (Phương) | Pending |
| 41 | Take Exam | Learner | Complex | Learner: `/exams/[examId]/take` | Iteration 3 (Phương) | Pending |
| 42 | Exam Review | Learner | Medium | Learner: `/exams/[examId]/review/[sessionId]` | Iteration 3 (Phương) | Pending |
| 43 | Exam History | Learner | Medium | Learner: `/exams/[examId]/history` | Iteration 3 (Phương) | Pending |
| 44 | Study Sets List | Learner | Medium | Learner: `/dashboard/study-sets` | Iteration 2 (Hiếu) | Pending |
| 45 | Study Set Detail | Learner | Medium | Learner: `/dashboard/study-sets/[setId]` | Iteration 2 (Hiếu) | Pending |
| 46 | Study Set Review/Test/Match | Learner | Complex | Learner: `/dashboard/study-sets/[setId]/review`, `/dashboard/study-sets/[setId]/test`, `/dashboard/study-sets/[setId]/match` | Iteration 3 (Hiếu) | Pending |
| 47 | Share Study Set | Public | Simple | Learner: `/share/study-sets/[token]` | Iteration 3 (Hiếu) | Pending |
| 48 | AI Sensei Hub | AI | Medium | Learner: `/ai-sensei` | Iteration 4 (Luân) | Pending |
| 49 | AI Sensei Chat | AI | Medium | Learner: `/ai-sensei/chat` | Iteration 4 (Luân) | Pending |
| 50 | AI Sensei Translate | AI | Medium | Learner: `/ai-sensei/translate` | Iteration 4 (Luân) | Pending |
| 51 | AI Sensei Roleplay (Text/Voice/Interactive) | AI | Complex | Learner: `/ai-sensei/roleplay`, `/voice`, `/interactive` | Iteration 4 (Luân) | Pending |
| 52 | Onboarding | Common | Medium | Learner: `/onboarding` | Iteration 2 (Tiên) | Pending |
| 53 | Instructors Detail | Public | Simple | Learner: `/dashboard/instructors/[id]` | Iteration 3 (Hiếu) | Pending |
| 54 | Analytics (Learner) | Learner | Medium | Learner: `/dashboard/analytics` | Iteration 4 (Phương) | Pending |
| 55 | Settings (Learner) | Common | Medium | Learner: `/dashboard/settings` | Iteration 2 (Tiên) | Pending |
| 56 | Privacy Policy | Public | Simple | Learner: `/privacy-policy` | Iteration 2 (Tiên) | Pending |
| 57 | Admin Dashboard | Admin | Medium | Admin: `/` (index route) | Iteration 1 (Khang) | Pending |
| 58 | Admin Permissions/Roles | Admin | Complex | Admin: `/permissions` | Iteration 2 (Khang) | Pending |
| 59 | Admin Academy Course Profiles | Admin | Complex | Admin: `/academy/course-profiles` + detail | Iteration 2 (Phương) | Pending |
| 60 | Admin Academy Live Classes | Admin | Complex | Admin: `/academy/live-classes` + detail/schedule/assessments/students | Iteration 2 (Luân) | Pending |
| 61 | Admin Reschedule Requests | Admin | Complex | Admin: `/academy/live-classes/reschedule-requests` | Iteration 2 (Luân) | Pending |
| 62 | Admin Assignment Grading | Admin | Complex | Admin: submissions grading route | Iteration 3 (Phương) | Pending |
| 63 | Admin Cohorts | Admin | Complex | Admin: `/academy/cohorts` + detail | Iteration 2 (Khang) | Pending |
| 64 | Admin VOD Packages | Admin | Complex | Admin: `/academy/vod-packages` + detail + “my” | Iteration 2 (Khang) | Pending |
| 65 | Admin Approvals | Admin | Complex | Admin: `/academy/approvals` + preview cohort/vod/course-profile | Iteration 3 (Phương) | Pending |
| 66 | Admin JLPT Config/Templates/Questions/Mondai | Admin | Complex | Admin: `/academy/jlpt/*` | Iteration 3 (Phương) | Pending |
| 67 | Admin Study Set Catalogs | Admin | Medium | Admin: `/academy/study-set-catalogs` + detail | Iteration 3 (Phương) | Pending |
| 68 | Admin Assessment (Exams/Questions) | Admin | Complex | Admin: `/academy/assessment/exams*`, `/academy/assessment/questions` | Iteration 3 (Phương) | Pending |
| 69 | Admin AI Subscriptions | Admin | Medium | Admin: `/academy/ai-subscriptions` | Iteration 4 (Khang) | Pending |
| 70 | Admin Orders | Admin | Medium | Admin: `/orders` | Iteration 2 (Khang) | Pending |
| 71 | Admin Revenue Analytics | Admin | Medium | Admin: `/finance/revenue-analytics` | Iteration 4 (Khang) | Pending |
| 72 | Admin Audit Logs | Admin | Medium | Admin: `/audit-logs` | Iteration 4 (Khang) | Pending |
| 73 | Admin Settings | Admin | Simple | Admin: `/settings` | Iteration 2 (Tiên) | Pending |
| 74 | Meet App (Live classroom UI) | Meet | Complex | Web meet: phòng học LiveKit (client UI) + các module: Chat (NATS/data message), Polls (API `/api/polls`), Whiteboard (sync scene/pointer/page/file qua data channel), Waiting room (phê duyệt vào lớp), Translation/Transcription (live subtitles + history + speech settings), Breakout rooms (quản lý phòng nhóm), Virtual background | Iteration 2 (Luân) | Pending |
| 75 | Mobile App (Learner) | Mobile | Complex | Có project Flutter trong workspace: `torri-mobile` (GoRouter + Riverpod). Screens chính đã thấy: Auth (`/welcome`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`), Onboarding survey (`/onboarding-survey`), Home (`/`), Discovery/Course (`/discovery`, `/course-detail/:id`, `/checkout/:productId`, `/payment`, `/payment-result/:orderCode`, `/curriculum/:deliveryTargetId`, `/enrolled-live/:liveClassId`, `/lesson`), Blog (`/blog`, `/blog-detail/:slug`), My courses (`/my-courses`), Orders (`/orders`, `/order-detail/:id`), Live schedule (`/live-schedule`), Practice (`/practice`, `/study-sets`, `/study-sets/:id/*`, `/jlpt-mock/*`), Profile/Settings (`/profile`, `/profile/edit`, `/settings`, `/linked-accounts`, `/security-2fa`, `/notifications`, `/leaderboard`, `/achievements`, `/rewards-store`, `/my-coupons`, `/support`), Academy folders (`/academy/folders`, `/academy/folders/:id`), Meet (`/meet` + meeting room flow) | Iteration 4 (cả team) | Pending |
| 76 | My Folders | Learner | Medium | Learner: `/dashboard/my-folders` + `/dashboard/my-folders/[deliveryScopeId]` | Iteration 2 (Hiếu) | Pending |

## Level* (quy ước)

- **simple**: <= 7 fields, <= 3 transactions
- **medium**: <= 15 fields, <= 7 transactions
- **complex**: > 15 fields, > 7 transactions

