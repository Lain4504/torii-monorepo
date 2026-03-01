# 🔍 Course UI Flow Audit Report
**Ngày kiểm tra**: 2 Tháng 3, 2026  
**So sánh**: Business Flow Document vs. Hiện tại UI Implementation

---

## 📋 Tóm tắt Phát hiện

| # | Mức độ | Vấn đề | Tác động |
|---|--------|--------|---------|
| 1 | 🔴 **CRITICAL** | Live Sessions gán sai (Course Master thay vì Course Run) | Data model sai, logic không match |
| 2 | 🔴 **CRITICAL** | Enrollments gán sai (Course Master thay vì Course Run) | Học viên không liên kết đúng với lớp học |
| 3 | 🟡 **HIGH** | Route paths sai cấu trúc phân cấp | Dễ gây nhầm lẫn về source data |
| 4 | 🟡 **HIGH** | Thiếu Course Run detail page tabs | Không thể quản lý enrollments/live-sessions từ Course Run |
| 5 | 🟡 **MEDIUM** | Course RunsTable ở trong Course Detail là tốt, nhưng cần nâng cấp | Thiếu action buttons |

---

## 🏗️ So Sánh Data Model

### Business Flow Document (Đúng ✓)
```
Course Master (Khung chương trình)
├── Modules
├── Lessons
├── Quizzes
└── Course Runs (Các đợt khai giảng)
    ├── Enrollment[n] ← Học viên đăng ký lớp này
    └── Live Session[n] ← Buổi học live của lớp này
```

### Hiện Tại UI Implementation (Sai ✗)
```
Course Master (Khung chương trình)
├── Modules ✓
├── Lessons ✓
├── Quizzes ✓
├── **Enrollments ✗ (sai - nên ở Course Run)**
├── **Live Sessions ✗ (sai - nên ở Course Run)**
└── Course Runs
    ├── Enrollment ✗ (không hiển thị ở đây)
    └── Live Sessions ✗ (không hiển thị ở đây)
```

---

## 📍 Route Structure Analysis

### Hiện Tại (SAIIII)
```
/courses/:id/live-sessions      → CourseLiveSessionsPage   [SAIIII]
/courses/:id/enrollments        → CourseEnrollmentsPage    [SAIIII]
```

**Vấn đề**:
- `:id` là Course Master ID
- Live Sessions phải thuộc Course Run, không phải Course Master
- Nếu 1 Course Master có 3 Course Runs, thì:
  - Học viên của Run 1 đăng ký với giá X
  - Học viên của Run 2 đăng ký với giá Y (khác)
  - Nhưng hiện tại UI show chung tại `/courses/:id/enrollments`

### Đúng (Cần áp dụng)
```
/courses/:id                               → CourseDetailPage (Master detail)
/courses/runs/:runId                       → CourseRunDetailPage (Run detail)
/courses/runs/:runId/live-sessions         → CourseRunLiveSessionsPage [NEW]
/courses/runs/:runId/enrollments           → CourseRunEnrollmentsPage [NEW]
```

---

## 🚨 Chi tiết vấn đề từng trang

### 1️⃣ **course-live-sessions-page.tsx** ❌
**Hiện tại**: `/courses/:id/live-sessions` (Course Master)  
**Đúng là**: `/courses/runs/:runId/live-sessions` (Course Run)

**Tại sao sai:**
```typescript
// BAD - Current implementation
const { data: course, isLoading: isLoadingCourse } = useCourse(id || '');
const { data: sessions, isLoading: isLoadingSessions } = useLiveSessions(id || '');
// ^^^ cái này fetch live sessions của cả Course Master
// Nhưng Live Sessions chỉ tồn tại ở Course Run!

// Phải là:
const { data: run, isLoading: isLoadingRun } = useCourseRun(runId || '');
const { data: sessions, isLoading: isLoadingSessions } = 
  useLiveSessionsByRun(runId || ''); // ← API này cần tồn tại
```

**Impact**: 
- Nếu 1 Course Master có 3 Course Runs, tất cả live sessions gộp lại ở 1 trang
- Không thể lọc/quản lý riêng từng run
- Khi tạo Live Session, không rõ nó gắn vào Run nào

---

### 2️⃣ **course-enrollments-page.tsx** ❌
**Hiện tại**: `/courses/:id/enrollments` (Course Master)  
**Đúng là**: `/courses/runs/:runId/enrollments` (Course Run)

**Tại sao sai:**
```typescript
// BAD - Current
const { data: enrollments, isLoading: isLoadingEnrollments } = 
  useEnrollmentsByCourse(id || '');
// ^^^ Lấy tất cả học viên đăng ký Course Master này
// Nhưng Enrollment phải link đến Course Run cụ thể!
// Vì lý do: Giá khác, thời gian khác, giảng viên khác

// Phải là:
const { data: enrollments, isLoading: isLoadingEnrollments } = 
  useEnrollmentsByRun(runId || ''); // ← API này cần tồn tại
```

**Example issue cụ thể:**
```
Course Master: "Tiếng Nhật N3"
  ├─ Course Run 1 (2026-03-15 ~ 2026-05-15, Giá 500k)
  │  └─ Enrollments: [Nguyễn A, Trần B] ← Họ đã mua vé Run 1 với giá 500k
  │
  └─ Course Run 2 (2026-06-01 ~ 2026-08-01, Giá 600k, Giáo viên khác)
     └─ Enrollments: [Lê C, Phạm D] ← Họ đã mua vé Run 2 với giá 600k

Hiện tại UI show: [Nguyễn A, Trần B, Lê C, Phạm D] ở /courses/:id/enrollments
Đúng là: 
  - /courses/runs/run1/enrollments → [Nguyễn A, Trần B]
  - /courses/runs/run2/enrollments → [Lê C, Phạm D]
```

---

### 3️⃣ **course-run-detail-page.tsx** 🟡 INCOMPLETE
**Hiện tại**: Hiển thị thông tin basic của Run, nhưng **thiếu tabs** để quản lý:
- ❌ Enrollments
- ❌ Live Sessions
- ❌ Attendance tracking

**Cần thêm**:
```typescript
<Tabs>
  <TabsList>
    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
    <TabsTrigger value="live-sessions">Buổi học ({liveSessions.length})</TabsTrigger>
    <TabsTrigger value="enrollments">Học viên ({enrollments.length})</TabsTrigger>
    <TabsTrigger value="attendance">Điểm danh</TabsTrigger>
  </TabsList>
  
  <TabsContent value="live-sessions">
    <LiveSessionsTable runId={runId} />
  </TabsContent>
  
  <TabsContent value="enrollments">
    <EnrollmentsTable runId={runId} />
  </TabsContent>
</Tabs>
```

---

### 4️⃣ **course-detail-page.tsx** 🟢 MOSTLY CORRECT
**Hiện tại**: 
- ✅ Modules tab
- ✅ Lessons tab
- ✅ Quizzes tab
- ✅ Assignments tab
- ✅ Course Runs table (phía dưới)

**Đúng theo flow!** Vì:
- Course Master chứa **nội dung chuẩn** (modules, lessons, quizzes)
- Course Runs là **danh sách các đợt khai giảng** từ nội dung này
- Từ đây click vào Run → đi đến Course Run Detail Page

**Cải thiện nhỏ:**
```typescript
// Hiện tại user phải click vào Run rồi chuyển trang
// Nên thêm quick actions:
<CourseRunsTable 
  courseId={id!} 
  onViewEnrollments={(runId) => navigate(`/courses/runs/${runId}/enrollments`)}
  onViewLiveSessions={(runId) => navigate(`/courses/runs/${runId}/live-sessions`)}
/>
```

---

## 📝 Task List: Fix Required

### Phase 1: Refactor Routes (URGENT)
- [ ] Rename `/courses/:id/live-sessions` → `/courses/runs/:runId/live-sessions`
- [ ] Rename `/courses/:id/enrollments` → `/courses/runs/:runId/enrollments`
- [ ] Create new pages:
  - `course-run-live-sessions-page.tsx`
  - `course-run-enrollments-page.tsx`
  - `course-run-attendance-page.tsx` (bonus)

### Phase 2: Update Components
- [ ] Update course-live-sessions-page.tsx → get data by `runId` not `courseId`
- [ ] Update course-enrollments-page.tsx → get data by `runId` not `courseId`
- [ ] Update course-run-detail-page.tsx → add tabs for enrollments/live-sessions
- [ ] Update CourseRunsTable → add quick nav buttons

### Phase 3: API/Hooks
- [ ] Verify backend API supports `/course-runs/:runId/enrollments`
- [ ] Verify backend API supports `/course-runs/:runId/live-sessions`
- [ ] Create/Update hooks:
  - `useEnrollmentsByRun(runId)` ← NEW
  - `useLiveSessionsByRun(runId)` ← NEW (or verify it exists)

### Phase 4: Validation
- [ ] Test flow: Course Master → Select Run → View Enrollments (of that Run specifically)
- [ ] Test flow: Course Master → Select Run → View Live Sessions (of that Run specifically)
- [ ] Verify data isolation per Run (enrollments/live-sessions không bị mix)

---

## 🎯 Key Takeaways

### ❌ Current Issues
1. **Data Model Mismatch**: Enrollments & Live Sessions đang gắn vào Course Master thay vì Course Run
2. **Route Structure Error**: Routes không phản ánh parent-child relationship
3. **Missing functionality**: Không thể quản lý enrollments/live-sessions từ Course Run detail page

### ✅ To Do
1. **Refactor routes** để reflect Course Run as parent
2. **Move pages** từ `/courses/:id/*` → `/courses/runs/:runId/*`
3. **Update "course-run-detail-page"** để trở thành hub cho Run management (enrollments, live-sessions, attendance)
4. **Add API hooks** để fetch data by runId

### 📚 Foundation
Business flow document định nghĩa rõ: `Course Master` → `Course Run` → `Enrollment/LiveSession`  
UI hiện tại có `Course Master` → `Enrollment/LiveSession` (skip Course Run)  
**Cần fix to match document!**

---

## 🔧 Code Example: How It Should Work

```typescript
// ✅ CORRECT FLOW

// 1. Staff goes to Course Master detail
/courses/12345 → CourseDetailPage
// Shows: Modules, Lessons, Quizzes, + Course Runs table

// 2. Staff creates/selects a Course Run
/courses/runs/run-abc → CourseRunDetailPage
// Shows tabs:
  - Overview (basic info, lecturer, schedule, enrollment count)
  - Live Sessions → /courses/runs/run-abc/live-sessions
  - Enrollments → /courses/runs/run-abc/enrollments
  - Attendance → /courses/runs/run-abc/attendance

// 3. View enrollments specific to this Run
/courses/runs/run-abc/enrollments → CourseRunEnrollmentsPage
// Shows: [Nguyễn A, Trần B, ...] <- học viên của Run này ONLY

// 4. View live sessions specific to this Run
/courses/runs/run-abc/live-sessions → CourseRunLiveSessionsPage
// Shows: [Session 1, Session 2, ...] <- buổi học của Run này ONLY

// ❌ vs CURRENT (WRONG)

/courses/12345/enrollments → CourseEnrollmentsPage
// Shows ALL học viên đăng ký Course Master này (từ tất cả Runs)
// ^ Sai! Vì không rõ họ ở Run nào, giá nào, khi nào

/courses/12345/live-sessions → CourseLiveSessionsPage
// Shows ALL buổi học live của tất cả Runs
// ^ Sai! Nên quản lý riêng từng Run
```

---

## 📌 Verdict

**✗ Current UI does NOT follow Business Flow properly**

**Architecture Issue**: Enrollments & Live Sessions are Course Run properties, không phải Course Master properties.

**Priority**: 🔴 HIGH - Refactor required trước khi scale lên production.

**Estimated Effort**: 
- Routes refactor: 1-2 hours
- Component updates: 2-3 hours
- Testing: 1-2 hours
- **Total: 4-7 hours**
