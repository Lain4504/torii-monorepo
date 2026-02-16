import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule, GlobalRpcExceptionFilter } from '@server/shared';

// LMS Modules
import { CourseModule } from '@server/learning/modules/course/course.module';
import { ModuleModule } from '@server/learning/modules/module/module.module';
import { LessonModule } from '@server/learning/modules/lesson/lesson.module';
import { WishlistModule } from '@server/learning/modules/wishlist/wishlist.module';
import { ReviewModule } from '@server/learning/modules/review/review.module';
import { CourseInstructorModule } from '@server/learning/modules/course-instructor/course-instructor.module';
import { LessonMaterialModule } from '@server/learning/modules/lesson-material/lesson-material.module';
import { EnrollmentModule } from '@server/learning/modules/enrollment/enrollment.module';
import { LearningProgressModule } from '@server/learning/modules/learning-progress/learning-progress.module';
import { LiveSessionModule } from '@server/learning/modules/live-session/live-session.module';
import { TeachingScheduleModule } from '@server/learning/modules/teaching-schedule/teaching-schedule.module';
import { CouponModule } from '@server/learning/modules/coupon/coupon.module';
import { CertificateModule } from '@server/learning/modules/certificate/certificate.module';

// Community Modules
import { BlogModule } from '@server/learning/modules/blog/blog.module';
import { CommentModule } from '@server/learning/modules/comment/comment.module';
import { FeedModule } from '@server/learning/modules/feed/feed.module';

// Assessment Modules
import { QuestionModule } from '@server/learning/modules/question/question.module';
import { QuestionPoolModule } from '@server/learning/modules/question-pool/question-pool.module';
import { ExamModule } from '@server/learning/modules/exam/exam.module';

// Flashcard Modules
import { FlashcardDeckModule } from '@server/learning/modules/flashcard-deck/flashcard-deck.module';
import { FlashcardModule } from '@server/learning/modules/flashcard/flashcard.module';

// Gamification Module
import { GamificationModule } from '@server/learning/modules/gamification/gamification.module';

// Handlers
import { CourseHandler } from '@server/learning/interfaces/nats/course.handler';
import { ModuleHandler } from '@server/learning/interfaces/nats/module.handler';
import { LessonHandler } from '@server/learning/interfaces/nats/lesson.handler';
import { LessonMaterialHandler } from '@server/learning/interfaces/nats/lesson-material.handler';
import { CourseInstructorHandler } from '@server/learning/interfaces/nats/course-instructor.handler';
import { StaffDashboardHandler } from '@server/learning/interfaces/nats/staff-dashboard.handler';
import { ExamHandler } from '@server/learning/interfaces/nats/exam.handler';
import { EnrollmentHandler } from '@server/learning/interfaces/nats/enrollment.handler';
import { QuestionHandler } from '@server/learning/interfaces/nats/question.handler';
import { QuestionPoolHandler } from '@server/learning/interfaces/nats/question-pool.handler';
import { ReviewHandler } from '@server/learning/interfaces/nats/review.handler';
import { WishlistHandler } from '@server/learning/interfaces/nats/wishlist.handler';
import { BlogHandler } from '@server/learning/interfaces/nats/blog.handler';
import { CommentHandler } from '@server/learning/interfaces/nats/comment.handler';
import { FeedHandler } from '@server/learning/interfaces/nats/feed.handler';
import { FlashcardDeckHandler } from '@server/learning/interfaces/nats/flashcard-deck.handler';
import { FlashcardHandler } from '@server/learning/interfaces/nats/flashcard.handler';
import { FlashcardReviewHandler } from '@server/learning/interfaces/nats/flashcard-review.handler';
import { LearningProgressHandler } from '@server/learning/interfaces/nats/learning-progress.handler';
import { LiveSessionHandler } from '@server/learning/interfaces/nats/live-session.handler';
import { TeachingScheduleHandler } from '@server/learning/interfaces/nats/teaching-schedule.handler';
import { CouponHandler } from '@server/learning/interfaces/nats/coupon.handler';
import { AnalyticsHandler } from '@server/learning/interfaces/nats/analytics.handler';
import { AssignmentHandler } from '@server/learning/interfaces/nats/assignment.handler';
import { SubmissionHandler } from '@server/learning/interfaces/nats/submission.handler';
import { CertificateHandler } from '@server/learning/interfaces/nats/certificate.handler';

import { AssignmentModule } from '@server/learning/modules/assignment/assignment.module';
import { SubmissionModule } from '@server/learning/modules/submission/submission.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AutomapperModule.forRoot({ strategyInitializer: pojos() }),
    PrismaModule,
    SharedModule,

    // LMS Modules
    CourseModule,
    ModuleModule,
    LessonModule,
    WishlistModule,
    ReviewModule,
    CourseInstructorModule,
    LessonMaterialModule,
    EnrollmentModule,
    LearningProgressModule,
    LiveSessionModule,
    TeachingScheduleModule,
    CouponModule,
    AssignmentModule,
    SubmissionModule,
    CertificateModule,

    // Community Modules
    BlogModule,
    CommentModule,
    FeedModule,

    // Assessment Modules
    QuestionModule,
    QuestionPoolModule,
    ExamModule,

    // Flashcard Modules
    FlashcardDeckModule,
    FlashcardModule,

    // Gamification Module
    GamificationModule,
  ],
  controllers: [
    // NATS Handlers
    CourseHandler,
    ModuleHandler,
    LessonHandler,
    LessonMaterialHandler,
    CourseInstructorHandler,
    StaffDashboardHandler,
    ExamHandler,
    EnrollmentHandler,
    QuestionHandler,
    QuestionPoolHandler,
    ReviewHandler,
    WishlistHandler,
    BlogHandler,
    CommentHandler,
    FeedHandler,
    FlashcardDeckHandler,
    FlashcardHandler,
    FlashcardReviewHandler,
    LearningProgressHandler,
    LiveSessionHandler,
    TeachingScheduleHandler,
    CouponHandler,
    AnalyticsHandler,
    AssignmentHandler,
    SubmissionHandler,
    CertificateHandler,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
  ],
})
export class LearningModule { }

