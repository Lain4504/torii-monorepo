PROJECT REPORT

Group <Group name>

Week <dd/mm/yyyy - dd/mm/yyyy>


I. Status Report

| # | Project Task | In-charge | Status | Notes (Work Item in Details) |
|---|:---|:---|:---|:---|
| 1 | Phase 1: Infrastructure, Identity & Foundation (Weeks 1-3) | Backend/Mobile | Completed | Setup Gateway, Redis, JWT, and Mobile Onboarding. |
| 2 | Phase 2: Core LMS, Storage & Commerce (Weeks 4-6) | Backend/Web | In Progress | Implementing Course/Lesson APIs and Admin Dashboard. |
| 3 | Phase 3: Engagement, Gamification & Blog (Weeks 7-9) | Fullstack Team | Pending | Rewards, Wallet, Study-sets, and Support systems. |
| 4 | Phase 4: Real-time Meet, AI Agents & JLPT Mock (Weeks 10-12) | AI / Backend | Pending | LiveKit, Recording, Sensei AI, and Mock Test engine. |
| 5 | | | | |


II. Project Issues

| # | Project Issue | Owner | Status | Notes (Solution, Suggestion, etc.) |
|---|:---|:---|:---|:---|
| 1 | R2 Storage Integration with Mobile | Backend Team | Pending | Handling presigned URLs for large video uploads. |
| 2 | LiveKit SDK Stability in Flutter | Mobile Team | Pending | Resolving version conflicts for real-time streaming. |
| 3 | | | Pending | |


III. Next Week Plan

| # | Project Work Item | In-charge | Deadline | Notes (Task Details, etc.) |
|---|:---|:---|:---|:---|
| 1 | Complete `academy` Service Core APIs | Backend Team | 21/04/2026 | Course Profile, Lesson, and Roadmap modules logic. |
| 2 | Mobile Course Player UI & Flow | Mobile Team | 21/04/2026 | Video streaming and progress tracking implementation. |
| 3 | Admin CRUD for Courses & Content | Web Team | 21/04/2026 | UI for course creation and asset management. |


IV. Other Project Masters/Suggestions

| # | Project Matter/Suggestions | Raised By | Date | Notes |
|---|:---|:---|:---|:---|
| 1 | Early E2E Testing for Auth Flow | Lead QA | 14/04/2026 | Syncing Web and Mobile identity sessions. |
| 2 | | | | |
| 3 | | | | |


---


### PHỤ LỤC: LỘ TRÌNH 12 TUẦN CHI TIẾT (FULL ROADMAP)


| Week / Phase | System / Service | Project Task & Modules | Notes (Technical Details) |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Backend (Server)** | Infrastructure & `identity` | Gateway, Identity (Redis, JWT), `academy` boilerplate. |
| **(Weeks 1-3)** | **Web (Admin/Learner)**| Platform Scaffold | Setup Admin & Learner apps (Next.js), Master Layouts. |
| | **Mobile (Flutter)** | Onboarding & `auth` | `torii-mobile/lib/features/auth` implementation. |
| | **Meet (Base)** | Room Architecture | Base `room` and `auth` modules in `meet` service. |
| **Phase 2** | **Backend (Server)** | `academy` Core LMS | `course-profile`, `lesson`, `roadmap`, `storage` (R2/S3). |
| **(Weeks 4-6)** | **Backend (Server)** | `academy` Commerce | `commerce` (Orders), `wallet`, `resource` handling. |
| | **Web Admin** | Course Management UI | Lecturers manage courses, upload lessons. |
| | **Mobile (Flutter)** | `course` & `academy` UI | Course discovery, dynamic Course Player backend. |
| **Phase 3** | **Backend (Server)** | Engagement & Support | `gamification` (Rewards), `blog` engine, `ticket`. |
| **(Weeks 7-9)** | **Backend (Server)** | `study-set` Logic | Quiz generation, Flashcards, Shared study sets. |
| | **Web (Admin/Learner)**| Community & Support UI | Blog management, Ticket resolution, Rewards UI. |
| | **Mobile (Flutter)** | `blog` & `profile` | Blog browsing, Wallet UI, Gamification dashboard. |
| **Phase 4** | **Backend (Server)** | Real-time & `meet` | `recording`, `speech-to-text`, `polls`, `insights`. |
| **(Weeks 10-12)**| **Backend (Server)** | `agents` & `jlpt-mock`| Voice Agent, JLPT scoring engine, Mock test logic. |
| | **Web (Admin/Learner)**| Classroom & AI UI | Live Classroom (LiveKit), AI integration, UI Analytics. |
| | **Mobile (Flutter)** | `meet` & `sensei` | Live Class client, `sensei` AI assistant voice UI. |
| | **Mobile (Flutter)** | `practice` (JLPT) | Full Mock Test simulation, scoring, history tracking. |
| | **Final Handover** | QA & Deployment | E2E Testing, Security Audits, Production Go-Live. |
