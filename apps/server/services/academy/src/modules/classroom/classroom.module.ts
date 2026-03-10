import { Module } from '@nestjs/common';
import { ClassModule } from './class/class.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { LearningProgressModule } from './learning-progress/learning-progress.module';
import { ClassroomCronService } from './classroom-cron.service';
import { CertificateModule } from './certificate/certificate.module';
import { ClassReviewModule } from './class-review/class-review.module';
import { LiveScheduleModule } from './live-schedule/live-schedule.module';
import { ClassAttendanceModule } from './class-attendance/class-attendance.module';

@Module({
  imports: [
    ClassModule,
    LiveScheduleModule,
    EnrollmentModule,
    LearningProgressModule,
    CertificateModule,
    ClassReviewModule,
    ClassAttendanceModule,
  ],
  providers: [ClassroomCronService],
})
export class ClassroomModule { }

