# Review: ACADEMY_BACKEND_PLAN.md vs core-lms.md

Rà soát logic schema, state machine và flow nghiệp vụ giữa **ACADEMY_BACKEND_PLAN.md** và **core-lms.md** để đảm bảo Backend Plan bám đúng flow core LMS.

---

## 1. Tổng quan so khớp

| Hạng mục | core-lms.md | ACADEMY_BACKEND_PLAN | Ghi chú |
|----------|--------------|----------------------|--------|
| **Content** | CourseProfile → CourseEdition → Chapter → ChapterItem → Lesson/QuizTemplate/AssignmentTemplate | §2 mô tả đúng, state machine CourseEdition DRAFT→PUBLISHED→ARCHIVED | Khớp. Plan §2.3 dùng "READY" — core-lms chỉ có DRAFT/PUBLISHED; nên thống nhất. |
| **Delivery** | Class (DRAFT→ENROLLING→IN_PROGRESS→COMPLETED, CANCELLED), ClassSchedule, ClassAssessment, Enrollment, LearningProgress | §3 khớp state Class & Enrollment | Khớp. Cần bổ sung rule openEnrollment theo mode (LIVE/BLENDED cần startDate + ClassSchedule) từ core-lms §15.2. |
| **Commerce** | CourseOffering (DRAFT, PUBLISHED, HIDDEN), CourseOfferingClass, Order/OrderItem → Enrollment | §5 dùng ACTIVE/HIDDEN; flow Order→Enrollment khớp | ACTIVE trong Plan = PUBLISHED trong core-lms (§7.3). Cần ghi rõ. |
| **Enrollment từ Order** | §8.3: enroll chỉ khi Class.status ∈ {ENROLLING, IN_PROGRESS}, enrollmentOpenAt/CloseAt, maxStudents | §5.2 nói Class != CANCELLED; §10.4 invariant có status ∈ {ENROLLING, IN_PROGRESS} | §5.2 nên liệt kê đủ điều kiện enroll giống §8.3 (status, time window, maxStudents). |
| **Enrollment.sourceOfferingId** | §7.2: sourceOfferingId (FK CourseOffering); §2 ghi sourceProductId (cùng ý) | Plan dùng sourceOfferingId | Khớp. |
| **Assessment** | Exam, ExamSection, ExamQuestion, ExamAttempt (IN_PROGRESS, SUBMITTED, COMPLETED, ABANDONED) | ExamAttempt: PENDING, IN_PROGRESS, SUBMITTED, CANCELLED | Tên status khác (CANCELLED vs ABANDONED, có PENDING). Flow tương đương; nên ghi chú mapping nếu cần. |
| **Class mode (VOD/LIVE/BLENDED)** | §15: rule chi tiết DRAFT→ENROLLING (LIVE cần startDate + ClassSchedule; VOD không cần schedule) | §3.1 openEnrollment chỉ check Edition PUBLISHED | Plan nên tham chiếu/core-lms §15.2 khi validate openEnrollment. |

---

## 2. Điểm cần chỉnh trong Backend Plan

### 2.1. Enrollment từ Order — điều kiện đủ theo core-lms §8.3

**core-lms §8.3** nêu rõ: chỉ cho phép enroll nếu:

- `Class.status` ∈ {`ENROLLING`, `IN_PROGRESS`} (tùy policy).
- `enrollmentOpenAt <= now <= enrollmentCloseAt` (nếu có).
- `currentActiveEnrollments < maxStudents` (nếu có max).

**Plan hiện tại**: §5.2 chỉ nói "Class status != CANCELLED" và "chỉ tạo nếu chưa có ACTIVE (userId, classId)". §10.4 Commerce invariant có "status ∈ {ENROLLING, IN_PROGRESS}".

**Đề xuất**: Trong §5.2 (Order → Enrollment) bổ sung rõ: khi tạo Enrollment từ `order.paid`, **phải** kiểm tra:

- Class.status ∈ {ENROLLING, IN_PROGRESS} (không enroll vào Class DRAFT/CANCELLED/COMPLETED).
- Nếu Class có `enrollmentOpenAt`/`enrollmentCloseAt` thì `now` nằm trong khoảng này (trừ policy “enroll muộn”).
- Nếu Class có `maxStudents` thì số Enrollment ACTIVE hiện tại < maxStudents.

Nếu không thỏa (ví dụ class đã đủ slot): log lỗi / queue / bồi hoàn theo chính sách, không tạo Enrollment.

---

### 2.2. CourseOffering status — mapping với core-lms §7.3

**core-lms §7.3**: `CourseOffering.status` = `DRAFT` | `PUBLISHED` | `HIDDEN`.

**Plan §5.1**: Dùng `DRAFT` | `ACTIVE` | `HIDDEN` (hoặc ARCHIVED trong Prisma).

**Đề xuất**: Trong Plan ghi rõ: **ACTIVE (trong Plan) = PUBLISHED (trong core-lms)** — trạng thái “đang mở bán”. Chỉ khi status = ACTIVE/PUBLISHED mới cho tạo Order từ offering đó. Như vậy implementer biết mapping khi đọc core-lms.

---

### 2.3. Class openEnrollment — rule theo mode (core-lms §15.2)

**core-lms §15.2**:

- `DRAFT → ENROLLING`:
  - **LIVE/BLENDED**: bắt buộc `startDate` và ít nhất một `ClassSchedule`.
  - **VOD**: có thể thiếu schedule, nhưng nên có CourseEdition hợp lệ.
- §15.4: VOD-only class không cần ClassSchedule; enroll khi Class.status ∈ {ENROLLING, IN_PROGRESS}.

**Plan §3.1** `openEnrollment(classId)` hiện chỉ validate: status = DRAFT, CourseEdition.status = PUBLISHED.

**Đề xuất**: Bổ sung vào §3.1 (hoặc mục riêng “Validation theo Class.mode”):

- Khi chuyển Class từ DRAFT → ENROLLING:
  - Nếu `mode = LIVE` hoặc `BLENDED`: bắt buộc có `startDate` và ít nhất một bản ghi `ClassSchedule`.
  - Nếu `mode = VOD`: không bắt buộc ClassSchedule; chỉ cần CourseEdition hợp lệ (đã có).

Như vậy Backend Plan bám đúng rule core-lms §15.2.

---

### 2.4. Chapter.status — PUBLISHED vs READY

**core-lms §7.1**: Chapter có `status` enum `DRAFT`, `PUBLISHED` (không có READY).

**Plan §2.3**: “Tất cả Chapter.status phải là PUBLISHED hoặc READY” khi publish edition.

**Đề xuất**: Thống nhất với core-lms: chỉ dùng **PUBLISHED** (và DRAFT). Nếu Backend Plan muốn trạng thái “sẵn sàng nhưng chưa publish chapter”, có thể định nghĩa rõ “READY” trong Plan và đối chiếu với core-lms; nếu không cần thì bỏ READY, chỉ yêu cầu PUBLISHED.

---

### 2.5. ExamAttempt status — core-lms §12.3 vs Plan §4.3

**core-lms §12.3**: ExamAttempt `status`: `IN_PROGRESS`, `SUBMITTED`, `COMPLETED`, `ABANDONED`.

**Plan §4.3**: `PENDING`, `IN_PROGRESS`, `SUBMITTED`, `CANCELLED`.

**Nhận xét**: Flow tương đương (start → in progress → submit → completed/final). Khác tên (CANCELLED vs ABANDONED, thêm PENDING). Không bắt buộc sửa Plan; nên thêm một dòng trong §4.3: “Trạng thái có thể map với core-lms §12.3 (ví dụ CANCELLED = ABANDONED, SUBMITTED/COMPLETED tùy implementation).” Để implementer thống nhất enum với một nguồn (core-lms hoặc Plan).

---

## 3. Đã khớp, không cần sửa

- **Content**: CourseProfile, CourseEdition (state machine), Chapter, ChapterItem, Lesson, QuizTemplate, AssignmentTemplate — Plan §2 bám core-lms §1, §7.1.
- **Class state machine**: DRAFT → ENROLLING → IN_PROGRESS → COMPLETED và CANCELLED — khớp core-lms §8.2.
- **ClassAssessment**: DRAFT, PUBLISHED, CLOSED — khớp core-lms §7.2.
- **Enrollment states**: ACTIVE, COMPLETED, CANCELLED, EXPIRED — khớp core-lms §7.2.
- **Order → Enrollment**: Query CourseOfferingClass theo offeringId, tạo Enrollment cho từng classId, ghi sourceOfferingId; idempotency (tối đa 1 ACTIVE per (userId, classId)) — khớp core-lms §9.4 và bổ sung rõ hơn.
- **Commerce invariant (§10.4)**: Không set CourseOffering ACTIVE nếu không có CourseOfferingClass; không link Offering với Class CANCELLED; khi order.paid, class phải ENROLLING hoặc IN_PROGRESS — khớp tinh thần core-lms §8.3, §9.4.
- **Edge cases & invariants (§10)**: Content, Class & Enrollment, Assessment, Commerce — nhất quán với core-lms §10, §11.

---

## 4. Checklist đã áp dụng (sau khi sửa Plan)

- [x] **§5.2**: Bổ sung đủ điều kiện tạo Enrollment từ Order (Class.status, enrollmentOpenAt/CloseAt, maxStudents) theo core-lms §8.3.
- [x] **§5.1**: Ghi rõ ACTIVE = PUBLISHED (core-lms) — “đang mở bán”.
- [x] **§3.1**: Bổ sung rule openEnrollment theo mode (LIVE/BLENDED cần startDate + ClassSchedule) theo core-lms §15.2.
- [x] **§2.3**: Thống nhất Chapter.status với core-lms (chỉ PUBLISHED, bỏ READY).
- [x] **§4.3**: (Tùy chọn) Ghi chú mapping ExamAttempt status với core-lms §12.3.

Sau khi chỉnh các mục trên, **logic schema và flow nghiệp vụ trong ACADEMY_BACKEND_PLAN.md đã thống nhất với flow core-lms**.
