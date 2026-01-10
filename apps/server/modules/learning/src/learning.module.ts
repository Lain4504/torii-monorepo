import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule } from '@server/shared';

// LMS Modules
import { CourseModule } from './modules/course/course.module';
import { ModuleModule } from './modules/module/module.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewModule } from './modules/review/review.module';
import { CourseInstructorModule } from './modules/course-instructor/course-instructor.module';
import { LessonMaterialModule } from './modules/lesson-material/lesson-material.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { PaymentModule } from './modules/payment/payment.module';

// Community Modules
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { NotificationModule } from './modules/notification/notification.module';

// Assessment Modules
import { QuestionModule } from './modules/question/question.module';
import { QuestionPoolModule } from './modules/question-pool/question-pool.module';
import { ExamModule } from './modules/exam/exam.module';

// Flashcard Modules
import { FlashcardDeckModule } from './modules/flashcard-deck/flashcard-deck.module';
import { FlashcardModule } from './modules/flashcard/flashcard.module';

// Gamification Module
import { GamificationModule } from './modules/gamification/gamification.module';

// Storage Module
import { StorageModule } from './modules/storage/storage.module';

// Controllers (new structure - following identity pattern)
import { CourseController } from './controllers/course.controller';
import { ModuleController } from './controllers/module.controller';
import { LessonController } from './controllers/lesson.controller';
import { CourseInstructorController } from './controllers/course-instructor.controller';
import { LessonMaterialController } from './controllers/lesson-material.controller';
import { StaffDashboardController } from './controllers/staff-dashboard.controller';
import { ExamController } from './controllers/exam.controller';
import { ExamAdminController } from './controllers/exam-admin.controller';
import { QuestionController } from './controllers/question.controller';
import { QuestionPoolController } from './controllers/question-pool.controller';
import { StorageController } from './controllers/storage.controller';

// Controllers (keeping existing ones from interfaces/http for now)
import { WishlistController } from './controllers/wishlist.controller';
import { ReviewController } from './controllers/review.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { PaymentController } from './controllers/payment.controller';
import { PostController } from './interfaces/http/post.controller';
import { CommentController } from './interfaces/http/comment.controller';
import { NotificationController } from './interfaces/http/notification.controller';
import { FlashcardDeckController } from './interfaces/http/flashcard-deck.controller';
import { FlashcardController } from './interfaces/http/flashcard.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AutomapperModule.forRoot({
      strategyInitializer: pojos(),
    }),
    SharedModule,
    PrismaModule,

    // LMS Domain
    CourseModule,
    ModuleModule,
    LessonModule,
    WishlistModule,
    ReviewModule,
    CourseInstructorModule,
    LessonMaterialModule,
    EnrollmentModule,
    PaymentModule,

    // Community Domain
    PostModule,
    CommentModule,
    NotificationModule,

    // Assessment Domain
    QuestionModule,
    QuestionPoolModule,
    ExamModule,

    // Flashcard Domain
    FlashcardDeckModule,
    FlashcardModule,

    // Gamification Domain
    GamificationModule,

    // Storage Domain
    StorageModule,
  ],
  controllers: [
    CourseController,
    ModuleController,
    LessonController,
    CourseInstructorController,
    LessonMaterialController,
    StaffDashboardController,
    ExamController,
    ExamAdminController,
    QuestionController,
    QuestionPoolController,
    StorageController,
    WishlistController,
    ReviewController,
    EnrollmentController,
    PaymentController,
    PostController,
    CommentController,
    NotificationController,
    FlashcardDeckController,
    FlashcardController,
  ],
})
export class LearningModule { }
