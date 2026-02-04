import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule, GlobalRpcExceptionFilter } from '@server/shared';

// LMS Modules
import { CourseModule } from './modules/course/course.module';
import { ModuleModule } from './modules/module/module.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewModule } from './modules/review/review.module';
import { CourseInstructorModule } from './modules/course-instructor/course-instructor.module';
import { LessonMaterialModule } from './modules/lesson-material/lesson-material.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { LearningProgressModule } from './modules/learning-progress/learning-progress.module';
import { LiveSessionModule } from './modules/live-session/live-session.module';
import { CouponModule } from './modules/coupon/coupon.module';

// Community Modules
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { QAModule } from './modules/qa/qa.module';

// Assessment Modules
import { QuestionModule } from './modules/question/question.module';
import { QuestionPoolModule } from './modules/question-pool/question-pool.module';
import { ExamModule } from './modules/exam/exam.module';

// Flashcard Modules
import { FlashcardDeckModule } from './modules/flashcard-deck/flashcard-deck.module';
import { FlashcardModule } from './modules/flashcard/flashcard.module';

// Gamification Module
import { GamificationModule } from './modules/gamification/gamification.module';

// Handlers
import { CourseHandler } from './interfaces/nats/course.handler';
import { ModuleHandler } from './interfaces/nats/module.handler';
import { LessonHandler } from './interfaces/nats/lesson.handler';
import { LessonMaterialHandler } from './interfaces/nats/lesson-material.handler';
import { CourseInstructorHandler } from './interfaces/nats/course-instructor.handler';
import { StaffDashboardHandler } from './interfaces/nats/staff-dashboard.handler';
import { ExamHandler } from './interfaces/nats/exam.handler';
import { EnrollmentHandler } from './interfaces/nats/enrollment.handler';
import { QuestionHandler } from './interfaces/nats/question.handler';
import { QuestionPoolHandler } from './interfaces/nats/question-pool.handler';
import { ReviewHandler } from './interfaces/nats/review.handler';
import { WishlistHandler } from './interfaces/nats/wishlist.handler';
import { PostHandler } from './interfaces/nats/post.handler';
import { CommentHandler } from './interfaces/nats/comment.handler';
import { QAHandler } from './interfaces/nats/qa.handler';
import { FlashcardDeckHandler } from './interfaces/nats/flashcard-deck.handler';
import { FlashcardHandler } from './interfaces/nats/flashcard.handler';
import { FlashcardReviewHandler } from './interfaces/nats/flashcard-review.handler';
import { LearningProgressHandler } from './interfaces/nats/learning-progress.handler';
import { LiveSessionHandler } from './interfaces/nats/live-session.handler';
import { CouponHandler } from './interfaces/nats/coupon.handler';
import { AnalyticsHandler } from './interfaces/nats/analytics.handler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    CouponModule,

    // Community Modules
    PostModule,
    CommentModule,
    QAModule,

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
    PostHandler,
    CommentHandler,
    QAHandler,
    FlashcardDeckHandler,
    FlashcardHandler,
    FlashcardReviewHandler,
    LearningProgressHandler,
    LiveSessionHandler,
    CouponHandler,
    AnalyticsHandler,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
  ],
})
export class LearningModule { }
