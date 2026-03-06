import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseProfileController } from './controllers/course-profile.controller';
import { CourseEditionController } from './controllers/course-edition.controller';
import { CourseOfferingController } from './controllers/course-offering.controller';
import { ChapterController } from './controllers/chapter.controller';
import { ChapterItemController } from './controllers/chapter-item.controller';
import { TicketController } from './controllers/ticket.controller';
import { ClassController } from './controllers/class.controller';
import { ClassScheduleController } from './controllers/class-schedule.controller';
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

import { QuizTemplateController } from './controllers/quiz-template.controller';
import { AssignmentTemplateController } from './controllers/assignment-template.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [
    CourseProfileController,
    CourseEditionController,
    CourseOfferingController,
    ChapterController,
    ChapterItemController,
    QuizTemplateController,
    AssignmentTemplateController,
    TicketController,
    ClassController,
    ClassScheduleController,
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
  ],
})
export class AcademyModule { }

