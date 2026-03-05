### 1. Layer CONTENT – Syllabus chuẩn, dùng chung

Đây là “chương trình học” không phụ thuộc live/VOD.

- **`CourseProfile`**  
  - Ý nghĩa: 1 “khóa học” trừu tượng (VD: “JLPT N5”, “IELTS 6.5+”, “Web Backend”).  
  - Field chính:
    - `id`
    - `code` (unique, ví dụ: `JP_N5`)
    - `title`, `shortTitle`
    - `description`
    - `subject` (japanese / english / programming / …)
    - `level` (N5, Beginner, Intermediate, …)
    - `defaultLanguage`

- **`CourseEdition`** (version chương trình)  
  - Field:
    - `id`
    - `courseProfileId` → `CourseProfile`
    - `editionTag` (v1, v2, 2026, …)
    - `isCurrent`
    - `status` (draft / published / archived)
    - `syllabusSnapshot` (JSON, optional)
    - `changelog`
  - Quan hệ:
    - 1 `CourseProfile` có nhiều `CourseEdition`.
    - Mọi **Class** (run) sẽ trỏ tới **1 `CourseEdition`**.

- **`Chapter`** (thay cho module)  
  - Field:
    - `id`
    - `courseEditionId` → `CourseEdition`
    - `title`
    - `description`
    - `orderIndex`
    - `estimatedMinutes`
    - `status` (draft / published)
  - Mỗi edition có nhiều chapter, sắp xếp bằng `orderIndex`.

- **`ChapterItem`** (giống module item, nhưng tên mới + rõ nghĩa)  
  - Field:
    - `id`
    - `chapterId` → `Chapter`
    - `title`
    - `kind` (`lesson | quiz_template | assignment_template | reading | project | ...`)
    - `referenceId` (id của `Lesson` / `QuizTemplate` / `AssignmentTemplate`…)
    - `orderIndex`
  - Đây chính là “index của list bài học trong 1 chapter”.

- **`Lesson`**  
  - Field:
    - `id`
    - `courseProfileId`
    - `title`
    - `contentType` (video / html / markdown / external_link / …)
    - `contentUrl` hoặc `contentBody`
    - `attachments` (JSON)
    - `metadata` (JSON: level, tags, …)

- **`QuizTemplate`** (template đề kiểm tra)  
  - Field:
    - `id`
    - `courseProfileId`
    - `title`
    - `description`
    - `questionPoolId` (nếu dùng bank chung)
    - `defaultTimeLimit`
    - `defaultMaxAttempts`
    - `defaultPassingScore`
    - `settings` (shuffle, showExplanation, …)

- **`AssignmentTemplate`**  
  - Field:
    - `id`
    - `courseProfileId`
    - `title`
    - `description`
    - `defaultType` (text / file / both)
    - `defaultMaxScore`
    - `defaultRubric` (JSON)
    - `defaultSubmissionSettings` (JSON)

> **Tóm tắt CONTENT:**  
> `CourseProfile` → nhiều `CourseEdition` → nhiều `Chapter` → nhiều `ChapterItem` → trỏ tới `Lesson` / `QuizTemplate` / `AssignmentTemplate`.

---

### 2. Layer DELIVERY – Lớp học, đợt khai giảng

Đây là nơi thể hiện “3 đợt live mỗi năm”, “1 VOD luôn mở”, v.v.

- **`Class`** (tên gợi hình: một lớp/camera run)  
  - Field:
    - `id`
    - `courseProfileId` → `CourseProfile`
    - `courseEditionId` → `CourseEdition` (edition dùng cho lớp này)
    - `code` (ví dụ: `JP_N5_LIVE_SPRING_2026`)
    - `name` (ví dụ: “N5 Live Spring 2026”)
    - `mode` (`VOD | LIVE | BLENDED`)
    - `term` / `batch` (Spring 2026, Fall 2026, …)
    - `startDate`, `endDate`
    - `enrollmentOpenAt`, `enrollmentCloseAt`
    - `minStudents`, `maxStudents`
    - `status` (draft / enrolling / in_progress / completed / cancelled)
    - `teacherId` (hoặc nhiều teacher qua bảng phụ)
    - `settings` (JSON: timezone, meeting link default, …)

- **`ClassSchedule`** (cho LIVE/BLENDED)  
  - Field:
    - `id`
    - `classId` → `Class`
    - `weekday` / `startTime` / `endTime`
    - `location` (online link / offline room)
    - `note`

- **`ClassAssessment`** (instance per class nếu cần override)  
  - Field:
    - `id`
    - `classId` → `Class`
    - `kind` (`quiz | assignment`)
    - `templateId` → `QuizTemplate` hoặc `AssignmentTemplate`
    - `titleOverride` (optional)
    - `deadline` (nếu có)
    - `weight` (tỷ trọng điểm)
    - `maxAttemptsOverride` / `timeLimitOverride` / `maxScoreOverride`…
    - `status` (draft / published / closed)

- **`Enrollment`**  
  - Field:
    - `id`
    - `classId` → `Class`
    - `userId`
    - `enrolledAt`
    - `expiresAt`
    - `status` (active / completed / cancelled / expired)
    - `sourceProductId` (link về product/bundle đã mua)

- **`LearningProgress`** (per learner per lesson)  
  - Field:
    - `id`
    - `classId` → `Class`
    - `userId`
    - `lessonId` → `Lesson`
    - `status` (not_started / in_progress / completed)
    - `lastAccessedAt`
    - `progressPercent`

- **`QuizAttempt` / `AssignmentSubmission`**  
  - Gần giống hiện tại, nhưng:
    - luôn có `classId`
    - và nếu dùng instance: có `classAssessmentId`.

> **Tóm tắt DELIVERY:**  
> `Class` (1 lớp VOD/LIVE/BLENDED) → có `ClassSchedule` (nếu live), có `Enrollment`, có `ClassAssessment` (nếu muốn override bài cho lớp đó).

---

### 3. Layer COMMERCE – Gói sản phẩm để bán

Tách hẳn ra, không dính vào nội dung/delivery.

- **`CourseOffering`** (product/gói bán)  
  - Field:
    - `id`
    - `code` (ví dụ: `JP_N5_LIVE_SPRING_2026_BUNDLE`)
    - `title`
    - `description`
    - `price`
    - `currency`
    - `status` (draft / published / hidden)
    - `salesStartAt`, `salesEndAt`
    - `metadata` (JSON: marketing tags, banner, …)

- **`CourseOfferingClass`** (nhiều–nhiều giữa Offering và Class)  
  - Field:
    - `offeringId` → `CourseOffering`
    - `classId` → `Class`
  - Ví dụ:
    - Offering “N5 Live Spring + VOD”:
      - Link tới `Class`:
        - `JP_N5_LIVE_SPRING_2026`
        - `JP_N5_VOD_MAIN_2026`

- **`Order` / `OrderItem`**  
  - Khi học viên mua:
    - `OrderItem.offeringId`
    - Sau khi thanh toán ok → tạo `Enrollment` tương ứng cho **tất cả `Class` gắn với offering đó**.

> **Tóm tắt COMMERCE:**  
> `CourseOffering` (gói bán) → nhiều `Class` qua `CourseOfferingClass`.  
> Mua 1 offering = auto enroll vào 1 hoặc nhiều class.

---

### 4. Áp lại vào case tiếng Nhật (5 N + live 3 đợt/năm)

- **Content:**
  - 5 `CourseProfile`: `JP_N5` … `JP_N1`.
  - Mỗi cái có 1–x `CourseEdition`: `JP_N5_v1`, `JP_N5_v2`…
  - Trong `JP_N5_v1`:
    - nhiều `Chapter`, mỗi `Chapter` nhiều `ChapterItem` → lesson/quiz/assignment template.

- **Delivery:**
  - `Class`:
    - `JP_N5_VOD_MAIN_2026` (mode = VOD, start bất kỳ).
    - `JP_N5_LIVE_SPRING_2026`, `JP_N5_LIVE_SUMMER_2026`, `JP_N5_LIVE_FALL_2026` (mode = LIVE, cùng version).
- **Commerce:**
  - `CourseOffering` “N5 VOD” → link 1 class: `JP_N5_VOD_MAIN_2026`.
  - `CourseOffering` “N5 Live Spring + VOD” → link 2 class:
    - `JP_N5_LIVE_SPRING_2026`
    - `JP_N5_VOD_MAIN_2026`.

---

### 5. Điểm mấu chốt giúp schema này “dễ mở sang tiếng Anh / lập trình”

- **Tên gọi trung tính**: `CourseProfile`, `CourseEdition`, `Chapter`, `Class`, `CourseOffering` – không cột nào đặc thù tiếng Nhật.
- **3 layer rõ ràng**:
  - Content (Syllabus) – không dính lịch/khoa khai giảng.
  - Delivery (Class) – không dính giá/bundle.
  - Commerce (Offering) – chỉ nói chuyện tiền & gói.
- **Re-use Syllabus**:
  - Dù là tiếng Nhật, tiếng Anh hay lập trình, **mọi thứ dùng chung schema**; khác biệt chỉ là **data + subject**.

Nếu bạn muốn bước tiếp theo, tôi có thể:

- Map từng bảng hiện tại (`CourseMaster`, `CourseVersion`, `CourseRun`, `Module`, `ModuleItem`, `Quiz`, `Assignment`) sang schema mới này,
- Và gợi ý lộ trình migrate theo từng phase (chỉ đổi tên & thêm bảng trước, migrate logic sau).