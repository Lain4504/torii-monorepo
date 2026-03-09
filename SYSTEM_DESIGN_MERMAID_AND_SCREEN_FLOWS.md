# Torii System Design & Screen Flows (Mermaid)

Tài liệu này tập trung vào:

1. **System design** tổng quan bằng Mermaid.
2. **Screen flow theo role** để thuyết trình nghiệp vụ UI/UX.

---

## 1) System Context Diagram

```mermaid
flowchart LR
    subgraph Clients["Clients"]
        WL["Web Learner\n(Next.js)"]
        WA["Web Admin\n(Vite + React)"]
        ME["Meet Web App\n(React + LiveKit UI)"]
    end

    GW["API Gateway\n(NestJS)"]

    subgraph Services["Backend Microservices (NestJS + NATS)"]
        ID["Identity Service\nAuth, 2FA, RBAC, Profile"]
        AC["Academy Service\nLMS, Assessment, Commerce,\nStudy Set, Notes, Tickets"]
        MT["Meet Service\nRoom, Polls, Breakout,\nRecording, Insights"]
        AG["Agents Service\nAI Sensei, Assessment AI,\nAnalytics AI"]
    end

    subgraph Infra["Infrastructure"]
        NATS["NATS JetStream"]
        PG["PostgreSQL"]
        RD["Redis"]
        LK["LiveKit"]
    end

    WL -->|HTTPS REST| GW
    WA -->|HTTPS REST| GW
    ME -->|HTTPS + WS| GW

    GW -->|NATS RPC| ID
    GW -->|NATS RPC| AC
    GW -->|NATS RPC| MT
    GW -->|NATS RPC| AG

    ID <--> NATS
    AC <--> NATS
    MT <--> NATS
    AG <--> NATS

    ID --> PG
    AC --> PG
    MT --> PG
    AC --> RD
    ID --> RD
    MT --> RD

    MT <--> LK
```

---

## 2) Container / Module View (Backend)

```mermaid
flowchart TB
    GW["Gateway Layer"]

    subgraph Identity["Identity Service"]
        ID1["Auth Module"]
        ID2["2FA Module"]
        ID3["Authorization Module"]
        ID4["Notification + Audit"]
    end

    subgraph Academy["Academy Service"]
        A1["Content\n(CourseProfile, Edition,\nChapter, Lesson)"]
        A2["Classroom\n(Class, LiveSchedule,\nEnrollment, Progress)"]
        A3["Assessment\n(Question, Pool,\nExam, Attempt)"]
        A4["Commerce\n(Offering, Order,\nCoupon)"]
        A5["Gamification\n(Rewards, Achievements)"]
        A6["Study\n(Study Note, Study Set, SRS)"]
        A7["Support\n(Ticket, Blog)"]
    end

    subgraph Meet["Meet Service"]
        M1["Room/Auth/Waiting"]
        M2["Polls/Breakout"]
        M3["Recording/Artifacts"]
        M4["Insights AI\n(STT/Translation/\nMeeting Summary)"]
    end

    subgraph Agents["Agents Service"]
        G1["Sensei\n(chat/translate/roleplay/drill)"]
        G2["Assessment AI"]
        G3["Analytics AI"]
    end

    GW --> Identity
    GW --> Academy
    GW --> Meet
    GW --> Agents
```

---

## 3) Core Runtime Flows

### 3.1 Learner -> Checkout -> Enrollment

```mermaid
sequenceDiagram
    autonumber
    participant U as Learner
    participant WL as Web Learner
    participant GW as API Gateway
    participant AC as Academy Service

    U->>WL: Chọn khóa học (offering)
    WL->>GW: GET /api/academy/course-offerings/public/:id
    GW->>AC: NATS request
    AC-->>GW: Offering detail
    GW-->>WL: Response

    U->>WL: Nhập coupon, xác nhận checkout
    WL->>GW: POST /api/academy/orders/preview
    GW->>AC: Preview pricing + coupon rules
    AC-->>GW: Preview result
    GW-->>WL: Tổng tiền cuối

    WL->>GW: POST /api/academy/orders/checkout
    GW->>AC: Create order + payment flow
    AC-->>GW: Payment result / order state
    GW-->>WL: Success

    Note over AC: Fulfillment tạo Enrollment\ncho class map trong offering
```

### 3.2 Learner -> Join Live Session -> Meet App

```mermaid
sequenceDiagram
    autonumber
    participant U as Learner
    participant WL as Web Learner
    participant GW as API Gateway
    participant AC as Academy Service
    participant MT as Meet Service
    participant ME as Meet App
    participant LK as LiveKit

    U->>WL: Bấm "Vào học" từ Schedule
    WL->>GW: POST /api/live-sessions/:id/join
    GW->>AC: Validate enrollment + session
    AC-->>GW: join token payload
    GW-->>WL: meet access token

    WL->>ME: Open new tab + access_token
    ME->>GW: verifyToken / auth-room token flow
    GW->>MT: room/auth request
    MT-->>GW: room info + permissions
    GW-->>ME: roomId + NATS/live config

    ME->>LK: Connect media session
    ME->>MT: polls/insights/waiting-room actions
```

---

## 4) Screen Flow by Role

## 4.1 Learner Screen Flow

```mermaid
flowchart TD
    L0["Login / Register"] --> L1["Dashboard"]
    L1 --> L2["Available Courses"]
    L2 --> L3["Course Detail"]
    L3 --> L4["Checkout"]
    L4 --> L5["Payment Success"]
    L5 --> L6["My Courses"]

    L6 --> L7["Learn Page\n(lesson + curriculum)"]
    L7 --> L8["Quiz / Exam / Assignment"]
    L8 --> L9["Progress + History"]
    L9 --> L10["Certificate"]

    L1 --> L11["Schedule"]
    L11 --> L12["Join Live Session"]
    L12 --> L13["Meet App"]

    L1 --> L14["AI Sensei\nChat/Translate/Roleplay"]
    L1 --> L15["Study Notes"]
    L1 --> L16["Study Sets + Review/Test/Match"]
    L1 --> L17["Rewards + Achievements + Wallet"]
```

## 4.2 Admin (LMS/Operation) Screen Flow

```mermaid
flowchart TD
    A0["Admin Login"] --> A1["Admin Dashboard"]
    A1 --> A2["Academy Dashboard"]

    A2 --> A3["Course Profiles"]
    A3 --> A4["Course Editions"]
    A4 --> A5["Chapters + Chapter Items"]
    A5 --> A6["Lessons / Templates"]

    A2 --> A7["Questions"]
    A7 --> A8["Question Pools"]
    A8 --> A9["Exams"]

    A2 --> A10["Classes"]
    A10 --> A11["Live Schedules"]
    A10 --> A12["Class Assessments"]
    A10 --> A13["Enrollments"]

    A2 --> A14["Course Offerings"]
    A14 --> A15["Orders"]
    A15 --> A16["Coupons"]

    A2 --> A17["Approvals"]
    A1 --> A18["Users + Permissions"]
    A1 --> A19["Rewards + Achievements"]
    A1 --> A20["Audit Logs + Tickets + Blogs"]
```

## 4.3 Lecturer Screen Flow

```mermaid
flowchart TD
    T0["Lecturer Login"] --> T1["Lecturer Dashboard"]
    T1 --> T2["My Classes"]
    T2 --> T3["Class Detail"]
    T3 --> T4["Schedule / Live Session"]
    T3 --> T5["Learner List"]
    T3 --> T6["Class Assessments"]
    T6 --> T7["Exam Attempts Review"]
    T6 --> T8["Assignment Grading"]
    T3 --> T9["Attendance / Class Review"]
```

## 4.4 Staff Support / Finance Screen Flow

```mermaid
flowchart TD
    S0["Staff Login"] --> S1["Operation Center"]
    S1 --> S2["Tickets"]
    S1 --> S3["Orders / Payment"]
    S1 --> S4["Coupons"]
    S1 --> S5["Rewards Catalog"]
    S1 --> S6["Blogs / Content Ops"]
    S1 --> S7["Reports"]
```

---

## 5) Role-to-Screen Matrix (Quick)

```mermaid
flowchart LR
    R1["Learner"] --> X1["Dashboard / My Courses / Learn / Schedule / AI Sensei / Rewards"]
    R2["Admin"] --> X2["Academy Full CRUD / Approvals / Users / Audit / Finance"]
    R3["Lecturer"] --> X3["My Classes / Grading / Live Teaching / Learner Progress"]
    R4["Staff"] --> X4["Tickets / Orders / Coupons / Operations"]
```

---

## 6) Suggested Presentation Order

1. Mở đầu bằng **System Context Diagram**.
2. Đi vào **Container View** để nói rõ trách nhiệm từng service.
3. Trình bày 2 flow runtime:  
   - Checkout -> Enrollment,  
   - Join Live -> Meet.
4. Kết thúc bằng **Screen Flow theo role** để chứng minh tính hoàn chỉnh từ backend tới UI.

