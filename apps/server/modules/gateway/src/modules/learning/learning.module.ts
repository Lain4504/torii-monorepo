import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseController } from './controllers/course.controller';

import { ModuleController } from './controllers/module.controller';
import { LessonController } from './controllers/lesson.controller';
import { LessonMaterialController } from './controllers/lesson-material.controller';
import { CourseInstructorController } from './controllers/course-instructor.controller';
import { StaffDashboardController } from './controllers/staff-dashboard.controller';
import { ExamController } from './controllers/exam.controller';
import { ExamAdminController } from './controllers/exam-admin.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { OrderController } from './controllers/order.controller';
import { PayOSController } from './controllers/payos.controller';
import { QuestionController } from './controllers/question.controller';
import { QuestionPoolController } from './controllers/question-pool.controller';
import { ReviewController } from './controllers/review.controller';
import { StorageController } from './controllers/storage.controller';
import { WishlistController } from './controllers/wishlist.controller';
import { PostController } from './controllers/post.controller';
import { CommentController } from './controllers/comment.controller';
import { FlashcardDeckController } from './controllers/flashcard-deck.controller';
import { FlashcardController } from './controllers/flashcard.controller';
import { FlashcardReviewController } from './controllers/flashcard-review.controller';

/**
 * Learning Module for Gateway
 * Handles all Learning service HTTP routes via NATS
 */
@Module({
    imports: [NatsClientModule],
    controllers: [
        CourseController,
        ModuleController,
        LessonController,
        LessonMaterialController,
        CourseInstructorController,
        StaffDashboardController,
        ExamController,
        ExamAdminController,
        EnrollmentController,
        OrderController,
        PayOSController,
        QuestionController,
        QuestionPoolController,
        ReviewController,
        StorageController,
        WishlistController,
        PostController,
        CommentController,
        FlashcardDeckController,
        FlashcardController,
        FlashcardReviewController,
    ],
})
export class LearningModule { }
