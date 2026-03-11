import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseProfileController } from './controllers/course-profile.controller';
import { CourseOfferingController } from './controllers/course-offering.controller';
import { TicketController } from './controllers/ticket.controller';
import { ClassController } from './controllers/class.controller';
import { LiveScheduleController } from './controllers/live-schedule.controller';
import { ClassAssessmentController } from './controllers/class-assessment.controller';
import { QuestionController } from './controllers/question.controller';
import { ExamController } from './controllers/exam.controller';
import { ExamAttemptController } from './controllers/exam-attempt.controller';
import { AssignmentSubmissionController } from './controllers/assignment-submission.controller';
import { LessonController } from './controllers/lesson.controller';
import { BlogController } from './controllers/blog.controller';
import { LearningProgressController } from './controllers/learning-progress.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { OrderController } from './controllers/order.controller';
import { CouponController } from './controllers/coupon.controller';
import { WebhookController } from './controllers/webhook.controller';
import { ClassReviewController } from './controllers/class-review.controller';
import { StudyNoteController } from './controllers/study-note.controller';
import { StudySetController } from './controllers/study-set.controller';
import { PlacementController } from './controllers/placement.controller';
import {
  AcademyLiveSessionController,
  LiveSessionJoinController,
} from './controllers/live-session.controller';
import { LiveSessionRequestController } from './controllers/live-session-request.controller';
import { ClassAttendanceController } from './controllers/class-attendance.controller';
import { QuestionPoolController } from './controllers/question-pool.controller';


@Module({
  imports: [NatsClientModule],
  controllers: [
    CourseProfileController,
    CourseOfferingController,
    TicketController,
    QuestionPoolController,
    ClassController,
    LiveScheduleController,
    ClassAssessmentController,
    QuestionController,
    ExamController,
    ExamAttemptController,
    AssignmentSubmissionController,
    LessonController,
    BlogController,
    LearningProgressController,
    EnrollmentController,
    OrderController,
    CouponController,
    WebhookController,
    ClassReviewController,
    StudyNoteController,
    StudySetController,
    PlacementController,
    AcademyLiveSessionController,
    LiveSessionJoinController,
    LiveSessionRequestController,
    ClassAttendanceController,
  ],
})
export class AcademyModule { }

