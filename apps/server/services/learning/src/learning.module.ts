import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { SharedModule, GlobalRpcExceptionFilter } from '@server/shared';

// Feature modules
import { AssignmentModule } from '@server/learning/modules/assignment/assignment.module';
import { AttendanceModule } from '@server/learning/modules/attendance/attendance.module';
import { BlogModule } from '@server/learning/modules/blog/blog.module';
import { CertificateModule } from '@server/learning/modules/certificate/certificate.module';
import { CommentModule } from '@server/learning/modules/comment/comment.module';
import { CouponModule } from '@server/learning/modules/coupon/coupon.module';
import { CourseMasterModule } from '@server/learning/modules/course-master/course-master.module';
import { CourseRunModule } from '@server/learning/modules/course-run/course-run.module';
import { DiscussionModule } from '@server/learning/modules/discussion/discussion.module';
import { EnrollmentModule } from '@server/learning/modules/enrollment/enrollment.module';
import { ExamModule } from '@server/learning/modules/exam/exam.module';
import { FlashcardModule } from '@server/learning/modules/flashcard/flashcard.module';
import { FlashcardDeckModule } from '@server/learning/modules/flashcard-deck/flashcard-deck.module';
import { GamificationModule } from '@server/learning/modules/gamification/gamification.module';
import { LearningProgressModule } from '@server/learning/modules/learning-progress/learning-progress.module';
import { LessonModule } from '@server/learning/modules/lesson/lesson.module';
import { LessonMaterialModule } from '@server/learning/modules/lesson-material/lesson-material.module';
import { LiveSessionModule } from '@server/learning/modules/live-session/live-session.module';
import { ModuleModule } from '@server/learning/modules/module/module.module';
import { NotebookModule } from '@server/learning/modules/notebook/notebook.module';
import { QuestionModule } from '@server/learning/modules/question/question.module';
import { QuestionPoolModule } from '@server/learning/modules/question-pool/question-pool.module';
import { ReviewModule } from '@server/learning/modules/review/review.module';
import { SubmissionModule } from '@server/learning/modules/submission/submission.module';
import { TeachingScheduleModule } from '@server/learning/modules/teaching-schedule/teaching-schedule.module';
import { WishlistModule } from '@server/learning/modules/wishlist/wishlist.module';

/**
 * Learning Microservice Root Module
 * Aggregates all feature modules for the Learning Service
 * Follows the microservice architecture pattern with clear separation of concerns
 */
@Module({
  imports: [
    // Configuration
    AutomapperModule.forRoot({
      strategyInitializer: pojos(),
    }),
    ScheduleModule.forRoot(),

    // Shared modules
    SharedModule,

    // Feature modules
    AssignmentModule,
    AttendanceModule,
    BlogModule,
    CertificateModule,
    CommentModule,
    CouponModule,
    CourseMasterModule,
    CourseRunModule,
    DiscussionModule,
    EnrollmentModule,
    ExamModule,
    FlashcardModule,
    FlashcardDeckModule,
    GamificationModule,
    LearningProgressModule,
    LessonModule,
    LessonMaterialModule,
    LiveSessionModule,
    ModuleModule,
    NotebookModule,
    QuestionModule,
    QuestionPoolModule,
    ReviewModule,
    SubmissionModule,
    TeachingScheduleModule,
    WishlistModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
  ],
})
export class LearningModule {}
