import { Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_FILTER } from '@nestjs/core';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule, SharedModule, GlobalRpcExceptionFilter, NatsClientModule } from '@server/shared';

// Repositories
import { COURSE_MASTER_REPOSITORY_TOKEN } from './interfaces/repositories';
import { CourseMasterRepository } from './modules/course-master/course-master.repository';
import { COURSE_RUN_REPOSITORY_TOKEN } from './interfaces/repositories';
import { CourseRunRepository } from './modules/course-run/course-run.repository';
import { MODULE_REPOSITORY_TOKEN } from './interfaces/repositories';
import { ModuleRepository } from './modules/module/module.repository';
import { LESSON_REPOSITORY_TOKEN } from './interfaces/repositories';
import { LessonRepository } from './modules/lesson/lesson.repository';
import { LESSON_MATERIAL_REPOSITORY_TOKEN } from './interfaces/repositories';
import { LessonMaterialRepository } from './modules/lesson-material/lesson-material.repository';
import { REVIEW_REPOSITORY_TOKEN } from './interfaces/repositories';
import { ReviewRepository } from './modules/review/review.repository';
import { EXAM_REPOSITORY_TOKEN } from './interfaces/repositories/i-exam.repository';
import { ExamRepository } from './modules/exam/exam.repository';
import { QUESTION_POOL_REPOSITORY_TOKEN } from './interfaces/repositories/i-question-pool.repository';
import { QuestionPoolRepository } from './modules/question-pool/question-pool.repository';
import { QUESTION_REPOSITORY_TOKEN } from './interfaces/repositories/i-question.repository';
import { QuestionRepository } from './modules/question/question.repository';
import { ENROLLMENT_REPOSITORY_TOKEN } from './interfaces/repositories';
import { EnrollmentRepository } from './modules/enrollment/enrollment.repository';
import { LIVE_SESSION_REPOSITORY_TOKEN } from './interfaces/repositories';
import { LiveSessionRepository } from './modules/live-session/live-session.repository';
import { COUPON_REPOSITORY_TOKEN } from './interfaces/repositories';
import { CouponRepository } from './modules/coupon/coupon.repository';
import { CERTIFICATE_REPOSITORY_TOKEN } from './interfaces/repositories';
import { CertificateRepository } from './modules/certificate/certificate.repository';
import { ATTENDANCE_REPOSITORY_TOKEN } from './interfaces/repositories';
import { AttendanceRepository } from './modules/attendance/attendance.repository';

// Services
import { COURSE_MASTER_SERVICE_TOKEN } from './interfaces/services';
import { CourseMasterService } from './modules/course-master/course-master.service';
import { COURSE_RUN_SERVICE_TOKEN } from './interfaces/services';
import { CourseRunService } from './modules/course-run/course-run.service';
import { MODULE_SERVICE_TOKEN } from './interfaces/services';
import { ModuleService } from './modules/module/module.service';
import { LESSON_SERVICE_TOKEN } from './interfaces/services';
import { LessonService } from './modules/lesson/lesson.service';
import { LESSON_MATERIAL_SERVICE_TOKEN } from './interfaces/services';
import { LessonMaterialService } from './modules/lesson-material/lesson-material.service';
import { REVIEW_SERVICE_TOKEN } from './interfaces/services';
import { ReviewService } from './modules/review/review.service';
import { EXAM_SERVICE_TOKEN } from './interfaces/services';
import { ExamService } from './modules/exam/exam.service';
import { QUESTION_POOL_SERVICE_TOKEN } from './interfaces/services/i-question-pool.service';
import { QuestionPoolService } from './modules/question-pool/question-pool.service';
import { QUESTION_SERVICE_TOKEN } from './interfaces/services/i-question.service';
import { QuestionService } from './modules/question/question.service';
import { ENROLLMENT_SERVICE_TOKEN } from './interfaces/services';
import { EnrollmentService } from './modules/enrollment/enrollment.service';
import { LIVE_SESSION_SERVICE_TOKEN } from './interfaces/services';
import { LiveSessionService } from './modules/live-session/live-session.service';
import { COUPON_SERVICE_TOKEN } from './interfaces/services';
import { CouponService } from './modules/coupon/coupon.service';
import { CERTIFICATE_SERVICE_TOKEN } from './interfaces/services';
import { CertificateService } from './modules/certificate/certificate.service';
import { ATTENDANCE_SERVICE_TOKEN } from './interfaces/services';
import { AttendanceService } from './modules/attendance/attendance.service';

// Handlers
import { CourseRunHandler } from './handlers/course-run.handler';
import { LiveSessionHandler } from './handlers/live-session.handler';
import { AttendanceHandler } from './handlers/attendance.handler';
import { CourseHandler } from './handlers/course.handler';
import { LessonHandler } from './handlers/lesson.handler';
import { LessonMaterialHandler } from './handlers/lesson-material.handler';
import { EnrollmentHandler } from './handlers/enrollment.handler';
import { LearningProgressHandler } from './handlers/learning-progress.handler';
import { ReviewHandler } from './handlers/review.handler';
import { ExamHandler } from './handlers/exam.handler';
import { AssignmentHandler } from './handlers/assignment.handler';
import { CouponHandler } from './handlers/coupon.handler';
import { CertificateHandler } from './handlers/certificate.handler';
import { BlogHandler } from './handlers/blog.handler';
import { ModuleHandler } from './handlers/module.handler';
import { QuestionPoolHandler } from './handlers/question-pool.handler';
import { QuestionHandler } from './handlers/question.handler';
import { TeachingScheduleHandler } from './handlers/teaching-schedule.handler';
import { CartHandler } from './handlers/cart.handler';
import { WishlistHandler } from './handlers/wishlist.handler';
import { DiscussionHandler } from './handlers/discussion.handler';
import { AnalyticsHandler } from './handlers/analytics.handler';
import { CommentHandler } from './handlers/comment.handler';
import { FlashcardDeckHandler } from './handlers/flashcard-deck.handler';
import { FlashcardReviewHandler } from './handlers/flashcard-review.handler';
import { FlashcardHandler } from './handlers/flashcard.handler';
import { NotebookHandler } from './handlers/notebook.handler';
import { StaffDashboardHandler } from './handlers/staff-dashboard.handler';
import { SubmissionHandler } from './handlers/submission.handler';

// Schedulers
import { CouponScheduler } from './modules/coupon/coupon.scheduler';
import { BlogAnalyticsScheduler } from './modules/blog/blog-analytics.scheduler';
import { EnrollmentExpirationScheduler } from './modules/enrollment/enrollment-expiration.scheduler';
import { CourseRunScheduler } from './modules/course-run/schedulers/course-run.scheduler';

// LMS Modules
import { CourseMasterModule } from '@server/learning/modules/course-master/course-master.module';
import { ModuleModule } from '@server/learning/modules/module/module.module';
import { LessonModule } from '@server/learning/modules/lesson/lesson.module';
import { LessonMaterialModule } from '@server/learning/modules/lesson-material/lesson-material.module';
import { EnrollmentModule } from '@server/learning/modules/enrollment/enrollment.module';
import { LearningProgressModule } from '@server/learning/modules/learning-progress/learning-progress.module';
import { LiveSessionModule } from '@server/learning/modules/live-session/live-session.module';
import { CourseRunModule } from './modules/course-run/course-run.module';
import { AssignmentModule } from '@server/learning/modules/assignment/assignment.module';
import { SubmissionModule } from '@server/learning/modules/submission/submission.module';
import { TeachingScheduleModule } from '@server/learning/modules/teaching-schedule/teaching-schedule.module';
import { CouponModule } from '@server/learning/modules/coupon/coupon.module';
import { CertificateModule } from '@server/learning/modules/certificate/certificate.module';
import { AttendanceModule } from '@server/learning/modules/attendance/attendance.module';
import { WishlistModule } from '@server/learning/modules/wishlist/wishlist.module';
import { ReviewModule } from '@server/learning/modules/review/review.module';
import { BlogModule } from '@server/learning/modules/blog/blog.module';
import { CartModule } from '@server/learning/modules/cart/cart.module';
import { QuestionPoolModule } from './modules/question-pool/question-pool.module';
import { QuestionModule } from './modules/question/question.module';
import { ExamModule } from './modules/exam/exam.module';
import { DiscussionModule } from './modules/discussion/discussion.module';
import { FlashcardModule } from './modules/flashcard/flashcard.module';
import { FlashcardDeckModule } from './modules/flashcard-deck/flashcard-deck.module';
import { NotebookModule } from './modules/notebook/notebook.module';
import { CommentModule } from './modules/comment/comment.module';

@Module({
  imports: [
    AutomapperModule.forRoot({ strategyInitializer: pojos() }),
    PrismaModule,
    SharedModule,
    NatsClientModule,
    ScheduleModule.forRoot(),
    forwardRef(() => CourseMasterModule),
    forwardRef(() => ModuleModule),
    forwardRef(() => LessonModule),
    forwardRef(() => LessonMaterialModule),
    forwardRef(() => EnrollmentModule),
    forwardRef(() => LearningProgressModule),
    forwardRef(() => LiveSessionModule),
    forwardRef(() => CourseRunModule),
    forwardRef(() => AssignmentModule),
    forwardRef(() => SubmissionModule),
    TeachingScheduleModule,
    CouponModule,
    CertificateModule,
    AttendanceModule,
    WishlistModule,
    ReviewModule,
    BlogModule,
    CartModule,
    QuestionPoolModule,
    QuestionModule,
    forwardRef(() => ExamModule),
    forwardRef(() => DiscussionModule),
    forwardRef(() => FlashcardModule),
    forwardRef(() => FlashcardDeckModule),
    forwardRef(() => NotebookModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [
    AttendanceHandler,
    LiveSessionHandler,
    CourseRunHandler,
    CourseHandler,
    LessonHandler,
    LessonMaterialHandler,
    EnrollmentHandler,
    LearningProgressHandler,
    ReviewHandler,
    ExamHandler,
    AssignmentHandler,
    CouponHandler,
    CertificateHandler,
    BlogHandler,
    ModuleHandler,
    QuestionPoolHandler,
    QuestionHandler,
    TeachingScheduleHandler,
    CartHandler,
    WishlistHandler,
    DiscussionHandler,
    AnalyticsHandler,
    CommentHandler,
    FlashcardDeckHandler,
    FlashcardReviewHandler,
    FlashcardHandler,
    NotebookHandler,
    StaffDashboardHandler,
    SubmissionHandler,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
    { provide: COURSE_MASTER_REPOSITORY_TOKEN, useClass: CourseMasterRepository },
    { provide: COURSE_RUN_REPOSITORY_TOKEN, useClass: CourseRunRepository },
    { provide: MODULE_REPOSITORY_TOKEN, useClass: ModuleRepository },
    { provide: LESSON_REPOSITORY_TOKEN, useClass: LessonRepository },
    { provide: LESSON_MATERIAL_REPOSITORY_TOKEN, useClass: LessonMaterialRepository },
    { provide: REVIEW_REPOSITORY_TOKEN, useClass: ReviewRepository },
    { provide: ENROLLMENT_REPOSITORY_TOKEN, useClass: EnrollmentRepository },
    { provide: LIVE_SESSION_REPOSITORY_TOKEN, useClass: LiveSessionRepository },
    { provide: COUPON_REPOSITORY_TOKEN, useClass: CouponRepository },
    { provide: CERTIFICATE_REPOSITORY_TOKEN, useClass: CertificateRepository },
    { provide: ATTENDANCE_REPOSITORY_TOKEN, useClass: AttendanceRepository },
    { provide: COURSE_MASTER_SERVICE_TOKEN, useClass: CourseMasterService },
    { provide: COURSE_RUN_SERVICE_TOKEN, useClass: CourseRunService },
    { provide: MODULE_SERVICE_TOKEN, useClass: ModuleService },
    { provide: LESSON_SERVICE_TOKEN, useClass: LessonService },
    { provide: LESSON_MATERIAL_SERVICE_TOKEN, useClass: LessonMaterialService },
    { provide: REVIEW_SERVICE_TOKEN, useClass: ReviewService },
    { provide: ENROLLMENT_SERVICE_TOKEN, useClass: EnrollmentService },
    { provide: LIVE_SESSION_SERVICE_TOKEN, useClass: LiveSessionService },
    { provide: COUPON_SERVICE_TOKEN, useClass: CouponService },
    { provide: CERTIFICATE_SERVICE_TOKEN, useClass: CertificateService },
    { provide: ATTENDANCE_SERVICE_TOKEN, useClass: AttendanceService },
    { provide: QUESTION_POOL_REPOSITORY_TOKEN, useClass: QuestionPoolRepository },
    { provide: QUESTION_POOL_SERVICE_TOKEN, useClass: QuestionPoolService },
    { provide: QUESTION_REPOSITORY_TOKEN, useClass: QuestionRepository },
    { provide: QUESTION_SERVICE_TOKEN, useClass: QuestionService },
    CouponScheduler,
    BlogAnalyticsScheduler,
    EnrollmentExpirationScheduler,
    CourseRunScheduler,
  ],
  exports: [
    COURSE_RUN_SERVICE_TOKEN,
    LIVE_SESSION_SERVICE_TOKEN,
    ENROLLMENT_SERVICE_TOKEN,
    ATTENDANCE_SERVICE_TOKEN,
  ],
})
export class LearningModule { }
