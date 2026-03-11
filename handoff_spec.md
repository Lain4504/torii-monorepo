# Academy V2 Migration Progress & Handoff Spec

## 1. Overview
The Academy module has been migrated to **V2 Schema**. This is a "clean slate" migration with no backward compatibility. All legacy models (V1) have been removed from [schema.prisma](file:///home/lain4504/SEP490/torii-monorepo/apps/server/prisma/schema.prisma).

**Current Status:**
- Database Schema: **V2 (Prisma migrated)**
- Prisma Client: **Generated**
- SQL Seed Data: **Ready ([seed_academy_v2.sql](file:///home/lain4504/SEP490/torii-monorepo/apps/server/seed_academy_v2.sql))**
- Core Services: **Refactored (Class, Enrollment, Lesson, Syllabus)**
- Compilation: **~40 errors remaining** (mostly in secondary modules like Assessment, Commerce, and Agents).

---

## 2. Completed Work (V2 Implemented)

### Database Layer
- [x] **[schema.prisma](file:///home/lain4504/SEP490/torii-monorepo/apps/server/prisma/schema.prisma)**: Removed ~700 lines of legacy code. Implemented [Module](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/lesson/lesson.module.ts#5-11), [ClassAssignment](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/classroom/class/dto/class.dto.ts#88-106), `UserLessonProgress`.
- [x] **Rewritten Models**: [Lesson](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/lesson/lesson.module.ts#5-11), [Assignment](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/classroom/class/class.handler.ts#94-98), [Class](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/commerce/course-offering/course-offering.service.ts#395-465), [CourseOffering](file:///home/lain4504/SEP490/torii-monorepo/apps/web-admin/src/routes/academy/management-mock.tsx#475-584), [Enrollment](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/classroom/enrollment/enrollment.service.ts#223-266).
- [x] **Enforced Logic**: Single Submission Policy for assignments, status-driven class lifecycles.

### Academy Services (Refactored)
- [x] [class.service.ts](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/classroom/class/class.service.ts): Rewritten for V2 statuses, assignments, and progress tracking.
- [x] [enrollment.service.ts](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/classroom/enrollment/enrollment.service.ts): Updated to use `offeringId` gate and `userLessonProgress`.
- [x] [lesson.service.ts](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/lesson/lesson.service.ts): Updated to `moduleId` hierarchy. Removed quiz/exam/assignment fields.
- [x] [syllabus.service.ts](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/course-profile/syllabus.service.ts): Implemented `Module -> Lesson` structure.
- [x] [classroom.module.ts](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/classroom/classroom.module.ts): Cleaned up imports, deleted [learning-progress](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/classroom/learning-progress) module.
- [x] [classroom-cron.service.ts](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/classroom/classroom-cron.service.ts): Simplified to handle only enrollment expirations.

### DTOs & Schemas
- [x] Updated [class.dto.ts](file:///home/lain4504/SEP490/torii-monorepo/packages/schemas/src/dtos/academy-class.dto.ts) and [enrollment.dto.ts](file:///home/lain4504/SEP490/torii-monorepo/packages/schemas/src/dtos/academy-enrollment.dto.ts).
- [x] Cleaned up [packages/schemas/src/index.ts](file:///home/lain4504/SEP490/torii-monorepo/packages/schemas/src/index.ts) (removed broken legacy exports).

### Gateway
- [x] Deleted 6 legacy controllers (exam, question, class-assessment, question-pool, learning-progress).
- [x] Updated [academy.module.ts](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/gateway/src/modules/academy/academy.module.ts) to remove deleted controller registrations.

---

## 3. Backlog: Tasks for the Next Agent

The following areas still contain compilation errors (TS errors) or logic that matches the old schema.

### A. Commerce & Billing (Priority High)
- **[course-offering.service.ts](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/commerce/course-offering/course-offering.service.ts)**:
    - [ ] Rename `originalPrice` → `price`.
    - [ ] Handle `salePrice` nullable field.
    - [ ] Remove `validFrom`, `validTo`, and `metadata` (not in V2).
    - [ ] Update `OfferingStatus` checks (V2 includes `OPENING` for LIVE).
- **`order.service.ts` & `order.listener.ts`**:
    - [ ] Fix enrollment creation logic (should pass `offeringId` instead of `sourceOfferingId`).

### B. Secondary Academy Modules (Priority Medium)
- **`assessment/` module**:
    - [ ] **Assessment cleanup**: `question.service.ts` and `question-pool.service.ts` reference deleted models. **Recommendation: Delete these services** as V2 uses [Assignment](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/classroom/class/class.handler.ts#94-98) for all non-automated tasks for now.
- **`course-profile.service.ts`**:
    - [ ] Update queries that include `lessons` directly on [Syllabus](file:///home/lain4504/SEP490/torii-monorepo/apps/server/services/academy/src/modules/course-profile/syllabus.service.ts#12-160). Change to `include: { modules: { include: { lessons: true } } }`.
- **`live-schedule.service.ts`**:
    - [ ] Fix status references: `IN_PROGRESS` → `ONGOING`, `ENROLLING` → `OPENING`.
- **`class-review/` & `certificate/`**:
    - [ ] Update completion checks to use `UserLessonProgress` count instead of old `LearningProgress`.

### C. Cross-Service Impact (Priority Medium)
- **`services/agents/`**:
    - [ ] `SenseiService` and `AssessmentService` in the agents module reference deleted models like `Question` and `ExamAttempt`. These need to be updated to the new structure or stubbed.
- **`gamification/`**:
    - [ ] `achievement.service.ts` references legacy enrollment fields.

---

## 4. Reference Implementation Patterns

When fixing the remaining files, follow these V2 patterns:

### Fetching Progress
```typescript
// V2 Pattern
const totalLessons = await tx.lesson.count({
  where: { module: { syllabusId: ... } }
});
const completed = await tx.userLessonProgress.count({
  where: { userId, classId, isCompleted: true }
});
```

### Fetching Curriculum
```typescript
// V2 Pattern
const syllabus = await tx.syllabus.findUnique({
  include: {
    modules: {
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: { orderBy: { orderIndex: 'asc' } }
      }
    }
  }
});
```

### Enrollment Gate
```typescript
// V2 Pattern: Enrollment is tied to a CourseOffering
const enrollment = await tx.enrollment.create({
  data: {
    userId,
    offeringId, // Primary key for commerce
    classId,    // Optional for VOD, required for LIVE
    status: 'ACTIVE'
  }
});
```

---

## 5. Helpful Commands
- Run build for server: `pnpm build --filter server`
- Run type-check only: `npx tsc --noEmit` in `apps/server`.
- Run SQL seed: Access Postgres container and run `\i seed_academy_v2.sql`.

**Handoff Complete.** All core infrastructure for V2 is in place; focus on "fixing the red lines" in secondary modules.
