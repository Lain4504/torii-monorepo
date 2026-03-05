import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';

import { StaffDashboardController } from './controllers/staff-dashboard.controller';
import { ExamController } from './controllers/exam.controller';
import { ExamAdminController } from './controllers/exam-admin.controller';
import { QuestionController } from './controllers/question.controller';
import { QuestionPoolController } from './controllers/question-pool.controller';
import { CourseMasterReviewController } from './controllers/review.controller';
import { LiveSessionController } from './controllers/live-session.controller';
import { TeachingScheduleController } from './controllers/teaching-schedule.controller';
import { DiscussionController } from './controllers/discussion.controller';

import { WishlistController } from './controllers/wishlist.controller';
import { CommentController } from './controllers/comment.controller';
import { FeedController } from './controllers/feed.controller';
import { FlashcardDeckController } from './controllers/flashcard-deck.controller';
import { FlashcardController } from './controllers/flashcard.controller';
import { FlashcardReviewController } from './controllers/flashcard-review.controller';
import { CouponController } from './controllers/coupon.controller';
import { AssignmentController } from './controllers/assignment.controller';
import { SubmissionController } from './controllers/submission.controller';
import { CertificateController } from './controllers/certificate.controller';
import { NotebookController } from './controllers/notebook.controller';

/**
 * Learning Module for Gateway
 * Handles all Learning service HTTP routes via NATS
 */
@Module({
  imports: [NatsClientModule],
  controllers: [
    CourseMasterReviewController,
    TeachingScheduleController,
    StaffDashboardController,
    ExamController,
    ExamAdminController,
    QuestionController,
    QuestionPoolController,

    WishlistController,
    CommentController,

    FeedController,
    FlashcardDeckController,
    FlashcardController,
    FlashcardReviewController,
    LiveSessionController,
    DiscussionController,

    CouponController,
    AssignmentController,
    SubmissionController,
    CertificateController,
    NotebookController,
  ],
})
export class LearningModule { }
