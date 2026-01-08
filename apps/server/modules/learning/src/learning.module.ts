import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, SharedModule } from '@server/shared';

// LMS Modules
import { CourseModule } from './modules/course/course.module';
import { ModuleModule } from './modules/module/module.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewModule } from './modules/review/review.module';
import { CourseInstructorModule } from './modules/course-instructor/course-instructor.module';
import { LessonMaterialModule } from './modules/lesson-material/lesson-material.module';

// Community Modules
import { BlogModule } from './modules/blog/blog.module';
import { BlogCommentModule } from './modules/blog-comment/blog-comment.module';
import { NotificationModule } from './modules/notification/notification.module';

// Assessment Modules
import { QuestionBankModule } from './modules/question-bank/question-bank.module';
import { ExamModule } from './modules/exam/exam.module';

// Flashcard Modules
import { FlashcardDeckModule } from './modules/flashcard-deck/flashcard-deck.module';
import { FlashcardModule } from './modules/flashcard/flashcard.module';

// Gamification Module
import { GamificationModule } from './modules/gamification/gamification.module';

// Controllers (new structure - following identity pattern)
import { CourseController } from './controllers/course.controller';
import { ModuleController } from './controllers/module.controller';
import { LessonController } from './controllers/lesson.controller';
import { CourseInstructorController } from './controllers/course-instructor.controller';
import { LessonMaterialController } from './controllers/lesson-material.controller';
import { StaffDashboardController } from './controllers/staff-dashboard.controller';

// Controllers (keeping existing ones from interfaces/http for now)
import { WishlistController } from './controllers/wishlist.controller';
import { ReviewController } from './controllers/review.controller';
import { BlogController } from './interfaces/http/blog.controller';
import { BlogCommentController } from './interfaces/http/blog-comment.controller';
import { NotificationController } from './interfaces/http/notification.controller';
import { QuestionBankController } from './interfaces/http/question-bank.controller';
import { FlashcardDeckController } from './interfaces/http/flashcard-deck.controller';
import { FlashcardController } from './interfaces/http/flashcard.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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

    // Community Domain
    BlogModule,
    BlogCommentModule,
    NotificationModule,

    // Assessment Domain
    QuestionBankModule,
    ExamModule,

    // Flashcard Domain
    FlashcardDeckModule,
    FlashcardModule,

    // Gamification Domain
    GamificationModule,
  ],
  controllers: [
    CourseController,
    ModuleController,
    LessonController,
    CourseInstructorController,
    LessonMaterialController,
    StaffDashboardController,
    WishlistController,
    ReviewController,
    BlogController,
    BlogCommentController,
    NotificationController,
    QuestionBankController,
    FlashcardDeckController,
    FlashcardController,
  ],
})
export class LearningModule { }
