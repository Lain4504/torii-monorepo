# Academy Web-Admin UI Spec

Spec triển khai giao diện quản trị Academy cho **web-admin**, phục vụ **Staff-LMS** và **Lecturer**. Tài liệu bám sát [core-lms.md](../apps/server/core-lms.md), API Gateway và DTO trong `@workspace/schemas`.

---

## 1. Nguyên tắc chung

### 1.1. UI & Styling
- **Chỉ dùng component shadcn/ui** từ `@workspace/ui`: `Card`, `Table`, `Tabs`, `Sheet`, `Dialog`, `Field`, `FieldLabel`, `FieldDescription`, `FieldGroup`, `FieldSet`, `Input`, `Select`, `Textarea`, `Button`, `Badge`, `ScrollArea`.
- **Không thêm Tailwind tùy biến** ngoài chuẩn (spacing `space-y-6`, `p-6`). Không override style mặc định của component.
- **Sheet/Dialog**: kích thước xử lý tại nơi dùng; `SheetContent` dùng `className="w-full sm:max-w-[800px]"`. Nội dung chính bọc `ScrollArea`, footer ngoài ScrollArea nếu cần sticky.

### 1.2. Form & API
- **Field form phải khớp DTO backend** (gateway + academy service). Chỉ hiển thị field cần thao tác; field read-only hiển thị bằng text/label, không dùng input.
- **Tách form theo use-case**: form tạo Course Profile ≠ form tạo Course Edition; form tạo Class VOD ≠ form tạo Class LIVE. Không gộp hai flow khác nhau vào một form với điều kiện phức tạp.
- Dùng **react-hook-form + zod** với schema import từ `@workspace/schemas` (hoặc re-export) để validate đúng với API.

### 1.3. Logic & UX
- **Không hardcode** label, option, filter (subject, level, status…). Dùng constant/enum từ schema hoặc config; option select lấy từ API khi có (ví dụ danh sách Course Profile, Teacher).
- **Điều hướng rõ ràng**: breadcrumb, nút “Quay lại”, link từ list → detail → sub-resource (ví dụ Course Profile → Editions → Chapter → Chapter Items).
- **Hành động có xác nhận** khi xóa hoặc chuyển trạng thái quan trọng (publish, cancel class); dùng `AlertDialog` của shadcn.
- **Rule immutable cho Edition đã publish**: khi `CourseEdition.status === 'PUBLISHED'`, toàn bộ form chỉnh sửa syllabus phải ở chế độ read-only; CTA chính là **Clone Edition** để tạo bản `DRAFT` mới.
- **Rule governance cho Offering đã publish**: khi `CourseOffering.status === 'PUBLISHED'`, thay đổi `classIds` hoặc chính sách bán quan trọng phải đi qua re-approval (hoặc clone version mới theo policy backend).

---

## 2. Role & quyền truy cập

| Role       | Mô tả ngắn |
|-----------|-------------|
| **Staff-LMS** | Thiết kế chương trình (Profile, Edition, Chapter, Lesson, Quiz/Assignment template), tạo/sửa Class (VOD/LIVE), Schedule, Assessment, Enrollment, Question Pool, Question. |
| **Lecturer**  | Xem danh sách Class mình dạy (filter `primaryTeacherId`), vào Class detail; quản lý Assessment (deadline, grading), xem progress, submission, enrollment trong class đó. Không tạo/sửa Course Profile hay Edition. |

Permission (gateway): `academy.content.read` / `academy.content.write`, `academy.delivery.read` / `academy.delivery.write`, `academy.delivery.approve`, `academy.commerce.*`. UI ẩn menu/action khi không có quyền.

---

## 3. Luồng sử dụng (end-to-end)

### 3.1. Staff-LMS – Content (Syllabus)

1. **Course Profile** → List (filter subject, level) → Create/Edit/Archive.
2. **Course Edition** → Từ Profile detail: list edition → Create (hoặc Clone) → Edit (chỉ `DRAFT`/`PENDING_APPROVAL`) → Submit for approval / Publish / Set current.
3. **Chapter** → Từ Edition: list chapter (orderIndex) → Create/Edit/Delete (chỉ khi edition chưa publish) → Kéo thứ tự (optional).
4. **Chapter Item** → Từ Chapter: list items (lesson, quiz_template, assignment_template…) → Add/Edit/Delete (chỉ khi edition chưa publish).
5. **Lesson / QuizTemplate / AssignmentTemplate** → Gắn với **Course Profile** (courseProfileId). List theo profile → Create/Edit. Khi thêm Chapter Item, chọn referenceId từ list Lesson hoặc Template đã tạo của cùng profile.

### 3.2. Staff-LMS – Delivery (Class)

1. **Class** → List (filter mode, status, course) → Create: chọn Course Profile + Edition, **mode** (VOD | LIVE).
2. **Class Detail**:
   - **VOD**: tab Overview (thông tin Class + VodClass: enrollmentOpenAt, enrollmentCloseAt, maxStudents, defaultExpiresMonths).
   - **LIVE**: tab Overview (Class + LiveClass: term, batch, startDate, endDate, minStudents, maxStudents, primaryTeacherId, enrollmentOpenAt/CloseAt) + tab **Schedule** (LiveSchedule: weekday, startTime, endTime, location, excludedDates).
   - Tab **Assessment**: list ClassAssessment (quiz/assignment) → Add (chọn template) → Edit deadline, weight, override.
   - Tab **Learners**: list Enrollment → Add enrollment (userId), Update status, Remove.
   - Tab **Waitlist** (nếu có): list Waitlist, action offer slot.
   - Tab **Attendance** chỉ hiển thị khi `mode === 'LIVE'` (điểm danh theo LiveSchedule).
3. **Submission / Progress**: từ Class detail hoặc từ menu Enrollments: xem danh sách AssignmentSubmission, QuizAttempt (theo classId/classAssessmentId).

### 3.3. Staff-LMS – Question Pool

1. **Question Pool** → List (filter courseProfileId, level, category, status) → Create/Edit.
2. **Question Pool Detail** → Danh sách câu trong pool (PoolQuestion) → Add questions (chọn questionIds) → Remove question.
3. **Question** → List (filter type, level, category) → Create/Edit (content, questionType, options, correctAnswer, explanation…). Question có thể không thuộc pool (standalone) hoặc thuộc nhiều pool.

### 3.4. Lecturer

1. **Class** → List **chỉ các class mình dạy** (filter primaryTeacherId = current user).
2. **Class Detail** (cùng cấu trúc tab): Overview, Schedule (LIVE), Assessment, Learners, (Attendance nếu LIVE). Lecturer không thấy nút “Delete class” / “Edit class” tùy policy; có thể chỉnh deadline/weight Assessment, xem Submission và chấm điểm.
3. **Enrollment / Submission** → Xem trong Class detail; không tạo Offering hay chỉnh Course Profile.

---

## 4. Cấu trúc route & sidebar (gợi ý)

- `/academy` — Dashboard (số liệu tổng quan, pending approval nếu bật).
- `/academy/course-profiles` — List Course Profile.
- `/academy/course-profiles/:id` — Profile detail (tabs: Info, Editions).
- `/academy/course-profiles/:id/editions` — List edition (có thể gộp vào detail tab).
- `/academy/course-profiles/:id/editions/:editionId` — Edition detail: Chapters + Chapter Items (syllabus builder).
- `/academy/lessons` — List Lesson (filter courseProfileId).
- `/academy/quiz-templates` — List QuizTemplate (filter courseProfileId).
- `/academy/assignment-templates` — List AssignmentTemplate (filter courseProfileId).
- `/academy/classes` — List Class (filter mode, status, courseProfileId; Lecturer: filter theo teacher).
- `/academy/classes/:id` — Class detail (tabs: Overview, Schedule, Assessment, Learners, Waitlist, Attendance).
- `/academy/enrollments` — List Enrollment (filter classId, userId, status).
- `/academy/question-pools` — List Question Pool.
- `/academy/question-pools/:id` — Pool detail (questions trong pool).
- `/academy/questions` — List Question (filter type, level, category).
- `/academy/offerings` — List Course Offering (Staff/Admin).
- `/academy/offerings/:id` — Offering detail (map classIds).

Menu sidebar ẩn theo role: Lecturer không thấy “Course Profiles”, “Offerings”, “Question Pools”; chỉ thấy “Classes”, “Enrollments” (và có thể “Questions” nếu được phép).

---

## 5. Chi tiết từng nhóm trang

### 5.1. Course Profile

**List** (`/academy/course-profiles`)

- **Table**: columns `code`, `title`, `subject`, `level`, `defaultLanguage`, `updatedAt`. Actions: Edit, View (vào detail), Archive (nếu có).
- **Filter**: `q` (search), `subject`, `level` — dùng `Input` + `Select` (option từ constant hoặc API).
- **Action**: Button “Tạo Course Profile” → mở Sheet/Dialog **CourseProfileCreateForm**.

**Create/Edit form (Course Profile)**

- DTO: `AcademyCourseProfileCreateDTO` / `AcademyCourseProfileUpdateDTO` (schemas).
- Fields hiển thị:
  - Create: `code` (Input, required), `title` (Input, required), `shortTitle` (Input), `description` (Textarea), `subject` (Input hoặc Select), `level` (Input hoặc Select), `defaultLanguage` (Input), `thumbnailUrl` (Input url).
  - Edit: giống nhưng không sửa `code` (chỉ hiển thị).
- Layout: `FieldGroup` > `FieldSet` > từng `Field` + `FieldLabel` + `Input`/`Textarea`. `SheetFooter` có Submit, Cancel.

**Detail** (`/academy/course-profiles/:id`)

- **Tabs**: “Thông tin” (read-only + Edit button → form), “Editions” (table edition với link đến `/academy/course-profiles/:id/editions/:editionId`).
- Nút “Tạo Edition” → form **CourseEditionCreateForm** (courseProfileId = id).

---

### 5.2. Course Edition

**Create form (Edition)**

- DTO: `AcademyCourseEditionCreateDTO`: `courseProfileId`, `editionTag`, `status` (optional), `changelog`, `syllabusSnapshot` (optional), `metadata` (optional).
- Form tách riêng; không gộp với form Profile. `courseProfileId` có thể truyền từ route (hidden hoặc readonly).

**Edition detail** (`/academy/course-profiles/:profileId/editions/:editionId`)

- Hiển thị thông tin edition (editionTag, status, isCurrent, changelog). Actions: Edit, Set current, Submit for approval, Approve/Reject (nếu có quyền).
- Nếu `status = PUBLISHED`: ẩn/disable action Edit chapter/item; hiển thị badge “Read-only (Published)” và nút **Clone Edition**.
- **Chapters**: Table chapters (title, orderIndex, estimatedMinutes, status). Nút “Thêm chapter” → **ChapterCreateForm** (courseEditionId = editionId). Mỗi row có “Items” → link đến section Chapter Items.
- **Chapter Items** (trong chapter hoặc sub-route): Table items (title, kind, referenceId, orderIndex). Nút “Thêm item” → chọn `kind` (LESSON, QUIZ_TEMPLATE, ASSIGNMENT_TEMPLATE, …) → chọn referenceId từ list Lesson/Template **cùng courseProfileId**. DTO: `AcademyChapterItemCreateDTO`.

**Chapter form**

- Create: `courseEditionId`, `title`, `description`, `orderIndex`, `estimatedMinutes`, `status`.
- Edit: `AcademyChapterUpdateDTO` (title, description, orderIndex, estimatedMinutes, status).

**Chapter Item form**

- Create: `chapterId`, `title`, `kind`, `referenceId`, `orderIndex`, `metadata` (optional). `referenceId` là Select/Combobox load Lesson hoặc QuizTemplate hoặc AssignmentTemplate theo `kind` và courseProfileId của edition.

---

### 5.3. Lesson / QuizTemplate / AssignmentTemplate

Ba loại đều thuộc **Course Profile** (courseProfileId). List riêng từng loại; filter theo `courseProfileId`.

**Lesson**

- List: Table `title`, `contentType`, `courseProfileId` (hoặc title profile), `updatedAt`. Filter: `courseProfileId`, `q`.
- Create DTO: `courseProfileId`, `title`, `contentType`, `contentUrl`, `contentBody`, `attachments`, `description`, `metadata`.
- Form tách Create và Edit; Edit dùng `AcademyLessonUpdateDTO`.

**QuizTemplate**

- Create DTO: `courseProfileId`, `title`, `description`, `questionPoolId` (optional), `defaultTimeLimitMinutes`, `defaultMaxAttempts`, `defaultPassingScorePercent`, `settings`.
- Form: Course Profile chọn từ Select (hoặc từ context); Question Pool chọn từ list pool (optional).

**AssignmentTemplate**

- Create DTO: `courseProfileId`, `title`, `description`, `defaultType` (TEXT | FILE | BOTH), `defaultMaxScore`, `defaultRubric`, `defaultSubmissionSettings`.
- Form: `defaultType` dùng Select với 3 option.

---

### 5.4. Class & Class Detail

**List Class** (`/academy/classes`)

- Table: `code`, `name`, `mode` (Badge VOD/LIVE), `status`, `courseProfile` (title), `courseEdition` (editionTag), với LIVE: `startDate`, `endDate`, `primaryTeacher`. Filter: `courseProfileId`, `courseEditionId`, `mode`, `status`, `q`. Lecturer: thêm filter ẩn `primaryTeacherId = me`.
- Actions: View (detail), Edit, Duplicate, Publish/Start/Complete/Cancel (theo state machine). “Tạo lớp” → chọn mode trước → mở form tương ứng.

**Form tạo Class – tách VOD và LIVE**

- **Form Create Class (chung)**:
  - Field chung: `courseProfileId` (Select), `courseEditionId` (Select phụ thuộc profile), `code`, `name`, `mode` (Select VOD | LIVE).
  - Sau khi chọn mode:
    - **VOD**: thêm `enrollmentOpenAt`, `enrollmentCloseAt`, `maxStudents`, `defaultExpiresMonths` (optional). Không có Schedule.
    - **LIVE**: thêm `term`, `batch`, `startDate`, `endDate`, `minStudents`, `maxStudents`, `minStudentsEnforcement`, `primaryTeacherId`, `enrollmentOpenAt`, `enrollmentCloseAt`. Sau khi tạo xong Class + LiveClass, chuyển sang tab Schedule để thêm LiveSchedule.
  - DTO: `AcademyClassCreateDTO` (đủ field VOD/LIVE trong một schema; UI chỉ hiển thị block tương ứng theo mode).

**Class Detail** (`/academy/classes/:id`)

- Load class by id; nếu có `vodClass` / `liveClass` thì hiển thị đúng block.
- **Tab Overview**:
  - Card thông tin Class (code, name, mode, status, courseProfile, courseEdition).
  - Card VOD: enrollmentOpenAt, enrollmentCloseAt, maxStudents, defaultExpiresMonths (chỉ khi mode VOD).
  - Card LIVE: term, batch, startDate, endDate, minStudents, maxStudents, primaryTeacher, enrollment (chỉ khi mode LIVE). Nút Edit → **ClassUpdateForm** (tách form VOD/LIVE tương tự).
- **Tab Schedule** (chỉ khi `mode === 'LIVE'`):
  - Table LiveSchedule: weekday, startTime, endTime, location, note. Actions: Add, Edit, Delete. Form: `AcademyLiveScheduleCreateDTO` (liveClassId, weekday, startTime, endTime, location, note, excludedDates, roomId). weekday: 0–6 (Select hoặc number input).
- **Tab Assessment**:
  - Table ClassAssessment: kind (Quiz/Assignment), template title, titleOverride, deadline, weight, status. Add → **ClassAssessmentCreateForm**: classId, kind, quizTemplateId hoặc assignmentTemplateId, titleOverride, deadline, weight, maxAttemptsOverride, timeLimitOverrideMinutes, maxScoreOverride, status. Edit → ClassAssessmentUpdateForm.
- **Tab Learners**:
  - Table Enrollment (user name/email, status, enrolledAt, expiresAt). Add → chọn userId (Combobox user), expiresAt (optional), status. Edit status / Remove. DTO: `AcademyEnrollmentCreateDTO`, `AcademyEnrollmentUpdateDTO`.
- **Tab Waitlist**: Table Waitlist (nếu API có); action offer.
- **Tab Attendance**: Chỉ khi LIVE; danh sách theo LiveSchedule, ghi nhận Present/Absent/Late (API ClassAttendance).
- **Submission / Quiz attempt**: Từ tab Assessment, mỗi ClassAssessment (quiz/assignment) có link “Xem bài nộp” / “Xem lượt làm bài” → list AssignmentSubmission hoặc QuizAttempt theo classAssessmentId/classId. Lecturer/Staff xem và chấm điểm tại đây; field hiển thị và cập nhật điểm bám DTO `AcademyAssignmentSubmissionUpdateDTO` (status, score, v.v.).

**Duplicate Class**

- Dùng `AcademyClassDuplicateDTO`: term, batch, startDate, endDate, code, name (optional). Form đơn giản với các field cần đổi cho bản copy.

---

### 5.5. Enrollment (standalone)

**List** (`/academy/enrollments`)

- Query: `classId`, `userId`, `status`, pagination. Table: class name, user, status, enrolledAt, expiresAt. Actions: View, Edit status, Remove (cancel).

---

### 5.6. Question Pool

**List** (`/academy/question-pools`)

- Filter: `courseProfileId`, `level`, `category`, `status`, `q`. Table: name, code, courseProfile (title), level, category, status. Actions: View detail, Edit, Delete (chỉ khi không có QuizTemplate đang dùng).

**Create/Edit Pool**

- DTO: `AcademyQuestionPoolCreateDTO` / Update: code, name, description, courseProfileId, level, category, status, metadata.

**Pool Detail** (`/academy/question-pools/:id`)

- Table danh sách câu trong pool (question content hoặc id, orderIndex). Add questions → chọn từ list Question (multi-select) body `questionIds[]`. Remove question khỏi pool. API: POST/DELETE pool questions theo QUESTION_POOL_SPEC.

---

### 5.7. Question

**List** (`/academy/questions`)

- Filter: `parentId`, `questionType`, `q`, `level`, `category`. Table: content (truncate), questionType, level, category. Actions: Edit, Delete, “Add to pool” (mở modal chọn pool).

**Create/Edit Question**

- DTO: `AcademyQuestionCreateDTO` / Update: parentId (optional, cho group), content, mediaUrl, questionType, options, correctAnswer, explanation, level, category, metadata. Form: content Textarea, questionType Select, options (JSON hoặc dynamic form tùy type), correctAnswer, explanation. Tách form Create và Edit.

---

### 5.8. Course Offering (Staff/Admin)

**List** (`/academy/offerings`)

- Filter: status, q. Table: code, title, price, currency, status, validFrom, validTo. Actions: View, Edit.

**Create/Edit Offering**

- DTO: `AcademyCourseOfferingCreateDTO` / Update: code, title, description, type, originalPrice, currency, status, validFrom, validTo, metadata, **classIds** (array). Form: section “Classes” dùng pick-list (available classes / selected classes) để set classIds. Submit gọi API create/update; có thể có API set classes riêng: `AcademyCourseOfferingSetClassesDTO`.
- Validation nghiệp vụ khi publish/approve:
  - Offering phải có ít nhất 1 class.
  - Class được chọn phải ở trạng thái hợp lệ để bán (ví dụ `ENROLLING`/`IN_PROGRESS`) và edition của class phải `PUBLISHED`.
- Với offering `PUBLISHED`:
  - UI hiển thị cảnh báo khi sửa classIds/price/validity.
  - Theo policy: disable trực tiếp hoặc yêu cầu “Submit lại phê duyệt”.

---

## 6. Map API (Gateway) – tham chiếu nhanh

| Resource | List | Get | Create | Update | Delete | Actions đặc biệt |
|----------|------|-----|--------|--------|--------|------------------|
| Course Profile | GET `/api/academy/course-profiles` query | GET `/:id` | POST | PUT `/:id` | - | - |
| Course Edition | GET `/api/academy/course-editions` by-course-profile/:id | GET `/:id` | POST | PUT `/:id` | DELETE `/:id` | set-current, submit-for-approval, approve, reject, clone |
| Chapter | GET `/api/academy/chapters` query courseEditionId | GET `/:id` | POST | PUT `/:id` | DELETE `/:id` | - |
| Chapter Item | GET `/api/academy/chapter-items` query chapterId | GET `/:id` | POST | PUT `/:id` | DELETE `/:id` | - |
| Lesson | GET `/api/academy/lessons` | GET `/:id` | POST | PUT `/:id` | DELETE `/:id` | - |
| QuizTemplate | GET `/api/academy/quiz-templates` | GET `/:id` | POST | PUT `/:id` | DELETE `/:id` | - |
| AssignmentTemplate | GET `/api/academy/assignment-templates` | GET `/:id` | POST | PUT `/:id` | DELETE `/:id` | - |
| Class | GET `/api/academy/classes` | GET `/:id`, GET `/:id/curriculum` | POST | PUT `/:id` | DELETE `/:id` | publish, start, complete, cancel, submit-for-approval, approve, reject, duplicate |
| LiveSchedule | (theo class) | - | POST (trong academy) | PUT | DELETE | - |
| ClassAssessment | GET `/api/academy/class-assessments` query classId | GET `/:id` | POST | PUT `/:id` | DELETE `/:id` | - |
| Enrollment | GET `/api/academy/enrollments` | GET `/:id` | POST | PUT `/:id` | DELETE `/:id` | - |
| Question Pool | GET (nếu có route) question-pools | GET `/:id` | POST | PATCH `/:id` | DELETE `/:id` | POST `/:id/questions` (body questionIds), DELETE questions |
| Question | GET (nếu có) questions | GET `/:id` | POST | PUT `/:id` | DELETE `/:id` | - |
| Course Offering | GET `/api/academy/offerings` | GET `/:id` | POST | PUT `/:id` | - | set-classes (nếu có) |
| Commerce Fulfillment | - | - | - | - | - | Order `PAID` phải tạo Enrollment với đầy đủ validation enrollment (không bypass rule) |

Base path gateway có thể là `/api/academy` hoặc `/api/v1/academy` tùy project. DTO và query param bám đúng schema trong `packages/schemas`.

---

## 7. Cấu trúc folder gợi ý (web-admin)

```
apps/web-admin/src/
  routes/academy/
    academy-dashboard-page.tsx
    course-profiles/
      course-profile-list-page.tsx
      course-profile-detail-page.tsx
    course-profiles/[id]/editions/
      edition-detail-page.tsx   (chapters + chapter items)
    lessons/
      lesson-list-page.tsx
    quiz-templates/
      quiz-template-list-page.tsx
    assignment-templates/
      assignment-template-list-page.tsx
    classes/
      class-list-page.tsx
      class-detail-page.tsx
    enrollments/
      enrollment-list-page.tsx
    question-pools/
      question-pool-list-page.tsx
      question-pool-detail-page.tsx
    questions/
      question-list-page.tsx
    offerings/
      offering-list-page.tsx
      offering-detail-page.tsx
  components/academy/
    course-profile-form.tsx      (create vs edit tách bằng prop mode)
    course-edition-form.tsx
    chapter-form.tsx
    chapter-item-form.tsx
    lesson-form.tsx
    quiz-template-form.tsx
    assignment-template-form.tsx
    class-form-vod.tsx           (form tạo/sửa class VOD)
    class-form-live.tsx          (form tạo/sửa class LIVE)
    class-assessment-form.tsx
    live-schedule-form.tsx
    enrollment-form.tsx
    question-pool-form.tsx
    question-form.tsx
    offering-form.tsx
  lib/api/services/
    academy-course-profiles.ts
    academy-course-editions.ts
    academy-chapters.ts
    academy-chapter-items.ts
    academy-lessons.ts
    academy-quiz-templates.ts
    academy-assignment-templates.ts
    academy-classes.ts
    academy-live-schedules.ts
    academy-class-assessments.ts
    academy-enrollments.ts
    academy-question-pools.ts
    academy-questions.ts
    academy-course-offerings.ts
```

Mỗi form nên nhận `defaultValues` và `onSubmit`; không gộp create+edit bằng nhiều branch if/else phức tạp — có thể dùng một component với `mode: 'create' | 'edit'` và schema khác nhau.

---

## 8. Checklist triển khai

- [ ] Dashboard: thống kê, link pending approval (CourseEdition, Class, Offering).
- [ ] Course Profile: list, create, edit, detail với tab Editions.
- [ ] Course Edition: create (từ profile), list theo profile, detail với Chapters + Chapter Items; actions set-current, submit, approve, reject.
- [ ] Rule immutable cho edition đã publish: khóa edit chapter/item + hiển thị CTA clone edition.
- [ ] Chapter: CRUD trong edition; Chapter Item CRUD với kind + referenceId (load Lesson/Template theo profile).
- [ ] Lesson / QuizTemplate / AssignmentTemplate: list theo courseProfileId, CRUD form riêng.
- [ ] Class: list (filter mode, status); form tạo tách VOD vs LIVE; duplicate.
- [ ] Class detail: tab Overview (VOD/LIVE block), Schedule (LIVE only), Assessment, Learners, Waitlist, Attendance (LIVE only).
- [ ] Enrollment: list, add/edit trong class hoặc standalone.
- [ ] Question Pool: list, CRUD, detail với add/remove questions.
- [ ] Question: list, CRUD; optional “add to pool”.
- [ ] Course Offering: list, CRUD, map classIds.
- [ ] Offering publish validation: classIds không rỗng, class hợp lệ để bán, edition của class phải `PUBLISHED`.
- [ ] Offering `PUBLISHED`: update classIds/price theo policy re-approval hoặc clone version.
- [ ] Permission: ẩn menu/action theo role Staff vs Lecturer.
- [ ] Không hardcode option; dùng constant/enum/API.
- [ ] Form validate bằng zod schema trùng với DTO backend.

File spec này là **single source of truth** cho UI Academy web-admin; khi implement cần đối chiếu với gateway controller và DTO trong `packages/schemas` để đảm bảo field và action khớp 100%.
