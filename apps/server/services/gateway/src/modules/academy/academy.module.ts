import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseProfileController } from './controllers/course-profile.controller';
import { CourseOfferingController } from './controllers/course-offering.controller';
import { TicketController } from './controllers/ticket.controller';
import { ClassController } from './controllers/class.controller';
import { LiveScheduleController } from './controllers/live-schedule.controller';
import { AssignmentSubmissionController } from './controllers/assignment-submission.controller';
import { LessonController } from './controllers/lesson.controller';
import { BlogController } from './controllers/blog.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { OrderController } from './controllers/order.controller';
import { CouponController } from './controllers/coupon.controller';
import { WebhookController } from './controllers/webhook.controller';
import { ClassReviewController } from './controllers/class-review.controller';
import { StudyNoteController } from './controllers/study-note.controller';
import { StudySetController } from './controllers/study-set.controller';
import {
  AcademyLiveSessionController,
  LiveSessionJoinController,
} from './controllers/live-session.controller';
import { LiveSessionRequestController } from './controllers/live-session-request.controller';
import { ClassAttendanceController } from './controllers/class-attendance.controller';
import { ModuleController } from './controllers/module.controller';
import { ClassAssignmentController } from './controllers/class-assignment.controller';
import { WalletController } from './controllers/wallet.controller';
import { CertificateController } from './controllers/certificate.controller';
import { RefundController } from './controllers/refund.controller';
import { JlptMockController } from './controllers/jlpt-mock.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [
    CourseProfileController,
    CourseOfferingController,
    TicketController,
    ClassController,
    LiveScheduleController,
    AssignmentSubmissionController,
    LessonController,
    BlogController,
    EnrollmentController,
    OrderController,
    CouponController,
    WebhookController,
    ClassReviewController,
    StudyNoteController,
    StudySetController,
    AcademyLiveSessionController,
    LiveSessionJoinController,
    LiveSessionRequestController,
    ClassAttendanceController,
    ModuleController,
    ClassAssignmentController,
    WalletController,
    CertificateController,
    RefundController,
    JlptMockController,
  ],
})
export class AcademyModule {}
