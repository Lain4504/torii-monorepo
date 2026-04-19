# Torii Academy: Luồng nghiệp vụ & màn hình chính

Tài liệu phục vụ báo cáo / onboarding: **luồng nghiệp vụ** và **route màn hình** chính trong monorepo Torii (học viên `web-learner`, vận hành `web-admin`, phòng học `meet`, backend `apps/server`, AI/voice tùy triển khai).

---

## Ánh xạ nhanh: tính năng ↔ ứng dụng ↔ route

| Nhóm nghiệp vụ | Ứng dụng | Màn hình / route tiêu biểu |
|----------------|----------|----------------------------|
| Catalog & phê duyệt | `web-admin` | `/academy/course-profiles`, `/academy/cohorts`, `/academy/vod-packages`, `/academy/approvals` + các trang preview |
| Lớp LIVE & chấm bài | `web-admin` + `meet` | `/academy/live-classes`, `/academy/live-classes/:id/detail?tab=…`, `…/assignments/:assessmentId/submissions` |
| Mua → ghi danh → học | `web-learner` + Academy service | `/dashboard/available-courses`, `/checkout/:courseId`, `/payment/success`, `/courses/:courseId/learn` |
| VOD / quiz / chứng chỉ | `web-learner` | `/courses/.../quizzes`, `/courses/.../certificate`, `/dashboard/certificates` |
| JLPT mock | `web-admin` (nội dung) + `web-learner` (thi) | Admin: `/academy/jlpt/*`; Learner: `/dashboard/jlpt-list-exam`, `/jlpt/:level`, `/jlpt/attempt`, history |
| Study sets & gamification | Cả hai | Learner: `/dashboard/study-sets`, `…/match`, `…/test`, `…/review`, `/share/study-sets/:token`; Admin: `/academy/study-set-catalogs`; `/dashboard/rewards`, `/dashboard/leaderboard`, `/dashboard/achievements` |
| AI Sensei | `web-learner` + gateway/agents | `/ai-sensei/*`, `/dashboard/payment/subscriptions` |
| Vận hành | `web-admin` | `/users`, `/permissions`, `/orders`, `/finance/revenue-analytics`, `/coupons`, `/tickets`, `/blogs`, `/audit-logs`, `/notifications` |

Tham chiếu spec backend (commerce/enrollment): `apps/server/services/academy/live-class-commerce-spec.md`. RBAC: `apps/server/config/rbac-v2-mapping.md`, `rbac-v2-runbook.md`.

---

## Hướng dẫn màu sắc (Mermaid)

Các sơ đồ dùng bảng màu thống nhất:

- **Aqua**: điểm vào / người dùng (`start`)
- **Purple**: backend, service, đổi trạng thái (`process`)
- **Vàng**: kiểm tra / rẽ nhánh (`decision`)
- **Xanh lá**: hoàn thành / hiển thị công khai (`finish`)
- **Xanh nhạt viền**: **màn hình UI** với route (`screen`)

---

## 01 — Pipeline phê duyệt catalog (Course Profile → công khai)

*Staff tạo/chỉnh Hồ sơ khóa học; Admin phê duyệt trước khi lên catalog cho học viên.*

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart TD
    classDef start fill:#D1F2EB,stroke:#73C6B6,stroke-width:2px,color:#1A5276;
    classDef process fill:#E8DAEF,stroke:#AF7AC5,stroke-width:2px,color:#4A235A;
    classDef decision fill:#FCF3CF,stroke:#F4D03F,stroke-width:2px,color:#7D6608;
    classDef finish fill:#D5F5E3,stroke:#82E0AA,stroke-width:2px,color:#186A3B;
    classDef screen fill:#EBF5FB,stroke:#5DADE2,stroke-width:1px,color:#1B4F72;

    A["👤 Staff"]:::start --> S1["📄 Danh sách Hồ sơ khóa học<br/>/academy/course-profiles"]:::screen
    S1 --> S2["✏️ Chi tiết + module/bài học<br/>/academy/course-profiles/:id/detail"]:::screen
    S2 --> B["📝 Curriculum & cách thức triển khai"]:::process
    B --> C["⏳ PENDING_APPROVAL"]:::process
    C --> S3["🔎 Trung tâm phê duyệt<br/>/academy/approvals"]:::screen
    S3 --> D{"✅ Admin quyết định?"}:::decision
    D -->|"Từ chối"| S2
    D -->|"Duyệt"| E["🚀 PUBLISHED / catalog sẵn sàng"]:::finish
    E --> F["🛒 Learner: Khám phá khóa học<br/>/dashboard/available-courses"]:::screen
```

---

## 02 — Mua hàng (PayOS) → Ghi danh → Học → Hoàn thành

*Theo mô hình Order/Enrollment: học viên chọn cohort/gói LIVE/VOD → checkout PayOS → webhook → enrollment ACTIVE → học theo `enrollmentId`.*

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart TD
    classDef start fill:#D1F2EB,stroke:#73C6B6,stroke-width:2px,color:#1A5276;
    classDef process fill:#E8DAEF,stroke:#AF7AC5,stroke-width:2px,color:#4A235A;
    classDef decision fill:#FCF3CF,stroke:#F4D03F,stroke-width:2px,color:#7D6608;
    classDef finish fill:#D5F5E3,stroke:#82E0AA,stroke-width:2px,color:#186A3B;
    classDef screen fill:#EBF5FB,stroke:#5DADE2,stroke-width:1px,color:#1B4F72;

    A["👤 Learner"]:::start --> L1["🔎 Khám phá + chi tiết lớp/gói<br/>/dashboard/available-courses<br/>/dashboard/available-courses/class/:deliveryScopeId"]:::screen
    L1 --> L2["🛒 Checkout<br/>/checkout/:courseId"]:::screen
    L2 --> B["💳 PayOS: tạo link + thanh toán"]:::process
    B --> W["📡 Webhook xác thực"]:::process
    W --> C{"💰 Thanh toán OK?"}:::decision
    C -->|"Không"| L2
    C -->|"Có"| P["✅ /payment/success"]:::screen
    P --> D["🎒 Enrollment ACTIVE<br/>(liveClassId hoặc vodPackageId)"]:::process
    D --> L3["▶️ Học: player + tiến độ<br/>/courses/:courseId/learn?mode=LIVE|VOD"]:::screen
    L3 --> L4["📝 Quiz / bài kiểm tra<br/>/courses/.../quizzes"]:::screen
    L4 --> E{"📊 Đạt điều kiện hoàn thành?"}:::decision
    E -->|"Chưa"| L3
    E -->|"Rồi"| F["🎓 Chứng chỉ<br/>/courses/.../certificate<br/>/dashboard/certificates"]:::finish
```

---

## 03 — Lớp trực tiếp (LiveKit + NATS, app `meet`)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart LR
    classDef start fill:#D1F2EB,stroke:#73C6B6,stroke-width:2px,color:#1A5276;
    classDef process fill:#E8DAEF,stroke:#AF7AC5,stroke-width:2px,color:#4A235A;
    classDef decision fill:#FCF3CF,stroke:#F4D03F,stroke-width:2px,color:#7D6608;
    classDef finish fill:#D5F5E3,stroke:#82E0AA,stroke-width:2px,color:#186A3B;
    classDef screen fill:#EBF5FB,stroke:#5DADE2,stroke-width:1px,color:#1B4F72;

    subgraph Learner["Học viên (web-learner)"]
        A1["📅 Lịch / Khóa của tôi<br/>/dashboard/schedule<br/>/dashboard/my-courses"]:::screen
        A1 --> A2["🔑 Lấy token tham gia"]:::process
        A2 --> M["🎥 apps/meet — phòng LiveKit"]:::screen
    end

    subgraph Staff["Giảng viên / Admin (web-admin)"]
        B1["📋 Lớp trực tiếp<br/>/academy/live-classes"]:::screen
        B1 --> B2["🗂️ Chi tiết lớp (tab)<br/>?tab=info|syllabus|students|schedule|assignments|resources|discussion"]:::screen
        B2 --> B3["✅ Chấm bài<br/>.../assignments/:assessmentId/submissions"]:::screen
        B2 --> B4["📆 Duyệt dời lịch<br/>/academy/live-classes/reschedule-requests"]:::screen
    end

    M --> C["📡 Media ↔ LiveKit"]:::process
    C --> N["🛰️ NATS: poll / breakout / whiteboard / chat…"]:::process
    N --> E["🏁 Kết thúc buổi"]:::finish
```

---

## 04 — AI Sensei (Gateway, queue, LLM, TTS)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart TD
    classDef start fill:#D1F2EB,stroke:#73C6B6,stroke-width:2px,color:#1A5276;
    classDef process fill:#E8DAEF,stroke:#AF7AC5,stroke-width:2px,color:#4A235A;
    classDef decision fill:#FCF3CF,stroke:#F4D03F,stroke-width:2px,color:#7D6608;
    classDef finish fill:#D5F5E3,stroke:#82E0AA,stroke-width:2px,color:#186A3B;
    classDef screen fill:#EBF5FB,stroke:#5DADE2,stroke-width:1px,color:#1B4F72;

    U0["👤 Learner: màn AI Sensei"]:::start
    U0 --> U1["💬 /ai-sensei/chat"]:::screen
    U0 --> U2["🎭 /ai-sensei/roleplay/interactive"]:::screen
    U0 --> U3["🎙️ /ai-sensei/roleplay/voice"]:::screen
    U0 --> U4["🌐 /ai-sensei/translate"]:::screen
    U5["💳 Gói AI<br/>/dashboard/payment/subscriptions"]:::screen

    U1 --> G["🌐 API Gateway"]:::process
    U2 --> G
    U3 --> G
    U4 --> G
    G --> N["⚡ NATS queue / workers"]:::process
    N --> S["🧠 Sensei / agents service"]:::process
    S --> F["🤖 LLM (Gemini / MCP toolchain)"]:::process
    S --> T["🗣️ TTS"]:::process
    F --> R["📤 Trả lời"]:::finish
    T --> R
    R --> U1
    R --> U2
    R --> U3
    R --> U4
    U5 -.->|"mua / gia hạn"| G
```

---

## 05 — Study Sets & gamification

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart TD
    classDef start fill:#D1F2EB,stroke:#73C6B6,stroke-width:2px,color:#1A5276;
    classDef process fill:#E8DAEF,stroke:#AF7AC5,stroke-width:2px,color:#4A235A;
    classDef decision fill:#FCF3CF,stroke:#F4D03F,stroke-width:2px,color:#7D6608;
    classDef finish fill:#D5F5E3,stroke:#82E0AA,stroke-width:2px,color:#186A3B;
    classDef screen fill:#EBF5FB,stroke:#5DADE2,stroke-width:1px,color:#1B4F72;

    A["📚 Chọn bộ thẻ<br/>/dashboard/study-sets"]:::screen --> B["🔄 Luyện / thi<br/>…/:setId/match | /test"]:::screen
    B --> C["📖 Ôn tập SRS<br/>…/:setId/review"]:::screen
    C --> R0["🎁 Reward engine"]:::process
    subgraph Gamification["Gamification (learner)"]
        R0 --> D["⚡ XP"]:::process
        R0 --> E["🔥 Streak"]:::process
        R0 --> F["🏆 /dashboard/achievements"]:::screen
    end
    D --> G["🎫 Đổi quà / coupon<br/>/dashboard/rewards"]:::finish
    E --> G
    F --> G
    SH["🔗 Chia sẻ<br/>/share/study-sets/:token"]:::screen -.-> B
```

**Nội dung (Staff):** `/academy/study-set-catalogs` và `/academy/study-set-catalogs/:id`.

---

## 06 — Hành trình JLPT mock

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart TD
    classDef start fill:#D1F2EB,stroke:#73C6B6,stroke-width:2px,color:#1A5276;
    classDef process fill:#E8DAEF,stroke:#AF7AC5,stroke-width:2px,color:#4A235A;
    classDef decision fill:#FCF3CF,stroke:#F4D03F,stroke-width:2px,color:#7D6608;
    classDef finish fill:#D5F5E3,stroke:#82E0AA,stroke-width:2px,color:#186A3B;
    classDef screen fill:#EBF5FB,stroke:#5DADE2,stroke-width:1px,color:#1B4F72;

    subgraph AdminContent["Staff — web-admin"]
        Z1["Mẫu đề / câu hỏi / Mondai / config<br/>/academy/jlpt/*"]:::screen
    end

    A["🇯🇵 Hub JLPT<br/>/dashboard/jlpt-list-exam"]:::screen --> B["📄 Chọn level & đề<br/>/jlpt/:level"]:::screen
    B --> C["✍️ Làm theo section<br/>/jlpt/attempt/section"]:::screen
    C --> D{"🔔 Nộp bài?"}:::decision
    D -->|"Chưa"| C
    D -->|"Rồi"| E["📊 Lịch sử<br/>/jlpt/attempt/history"]:::screen
    E --> F["🔍 Chi tiết attempt<br/>/jlpt/attempt/history/:attemptId"]:::finish
    Z1 -.->|"nội dung"| B
```

Tham chiếu thêm: `docs/spec/JLPT_MOCK_EXAM_SPEC.md`.

---

## 07 — Vận hành & quản trị (`web-admin`)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart LR
    classDef start fill:#D1F2EB,stroke:#73C6B6,stroke-width:2px,color:#1A5276;
    classDef process fill:#E8DAEF,stroke:#AF7AC5,stroke-width:2px,color:#4A235A;
    classDef screen fill:#EBF5FB,stroke:#5DADE2,stroke-width:1px,color:#1B4F72;

    L["🔐 /login + RBAC"]:::start --> D["🏠 /"]:::screen
    D --> U["👥 /users"]:::screen
    D --> K["🔑 /permissions"]:::screen
    D --> O["💳 /orders"]:::screen
    D --> R["📈 /finance/revenue-analytics"]:::screen
    D --> C["🎟️ /coupons"]:::screen
    D --> T["🎫 /tickets"]:::screen
    D --> B["📰 /blogs"]:::screen
    D --> A["🛡️ /audit-logs"]:::screen
    D --> N["🔔 /notifications"]:::screen
    D --> AI["🤖 /academy/ai-subscriptions"]:::screen
    D --> GM["🎁 /rewards · /achievements"]:::screen
```

Cấu hình route & permission: `apps/web-admin/src/App.tsx`, menu: `apps/web-admin/src/config/navigation.tsx`.

---

## 08 — Bản đồ tổng: học viên từ dashboard đến các trụ cột

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'Inter, sans-serif'}}}%%
flowchart TB
    classDef start fill:#D1F2EB,stroke:#73C6B6,stroke-width:2px,color:#1A5276;
    classDef process fill:#E8DAEF,stroke:#AF7AC5,stroke-width:2px,color:#4A235A;
    classDef screen fill:#EBF5FB,stroke:#5DADE2,stroke-width:1px,color:#1B4F72;

    ENTRY["🚪 Landing / Auth<br/>/ (auth)/*"]:::start --> HUB["🏠 /dashboard"]:::screen

    HUB --> CAT["📚 Catalog & mua<br/>/dashboard/available-courses"]:::screen
    HUB --> LEARN["🎓 Khóa của tôi + học<br/>/dashboard/my-courses"]:::screen
    HUB --> LIVE["📡 Lịch LIVE<br/>/dashboard/schedule"]:::screen
    HUB --> JLPT["🇯🇵 JLPT<br/>/dashboard/jlpt-list-exam"]:::screen
    HUB --> SRS["🧠 Study sets<br/>/dashboard/study-sets"]:::screen
    HUB --> AI["🤖 AI Sensei<br/>/ai-sensei/*"]:::screen
    HUB --> SOC["🏆 Leaderboard / rewards<br/>/dashboard/leaderboard …"]:::screen

    CAT --> API["⚙️ Gateway + Academy"]:::process
    LEARN --> API
    JLPT --> API
    SRS --> API
    AI --> API
    LIVE --> MEET["🎥 apps/meet"]:::process
```

Menu sidebar học viên: `apps/web-learner/config/navigation.ts`.

---

## Gợi ý slide báo cáo

1. Một slide **bản đồ tổng (08)**.  
2. **Thương mại + enrollment (02)** và **phê duyệt catalog (01)**.  
3. **LIVE (03)** — nêu rõ `web-learner` + `meet` + tab quản lý `web-admin`.  
4. **AI (04)** + **SRS / gamification (05)**.  
5. **JLPT (06)** + **vận hành admin (07)**.

---

## Cập nhật tài liệu

Khi thêm route hoặc đổi permission, cập nhật đồng thời:

- `apps/web-admin/src/App.tsx`
- `apps/web-admin/src/config/navigation.tsx`
- `apps/web-learner/app/**/page.tsx` và `apps/web-learner/config/navigation.ts`
- Spec liên quan trong `apps/server/services/academy/` hoặc `docs/spec/`
