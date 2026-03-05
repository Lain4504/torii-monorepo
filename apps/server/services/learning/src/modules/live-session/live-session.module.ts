import { Module, forwardRef } from '@nestjs/common';
import { LiveSessionHandler } from '@server/learning/modules/live-session/live-session.handler';
import { LiveSessionProfile } from '@server/learning/infrastructure/mappings/live-session.profile';
import { NatsClientModule } from '@server/shared';
import {
  LIVE_SESSION_REPOSITORY_TOKEN,
  COURSE_MASTER_REPOSITORY_TOKEN,
} from '@server/learning/interfaces/repositories';
import { LIVE_SESSION_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { LiveSessionRepository } from '@server/learning/modules/live-session/live-session.repository';
import { LiveSessionService } from '@server/learning/modules/live-session/live-session.service';
import { CourseMasterModule } from '@server/learning/modules/course-master/course-master.module';
import { CourseRunModule } from '@server/learning/modules/course-run/course-run.module';
import { AttendanceModule } from '@server/learning/modules/attendance/attendance.module';

@Module({
  imports: [
    NatsClientModule,
    forwardRef(() => CourseMasterModule),
    forwardRef(() => CourseRunModule),
    AttendanceModule,
  ],
  controllers: [LiveSessionHandler],
  providers: [
    {
      provide: LIVE_SESSION_REPOSITORY_TOKEN,
      useClass: LiveSessionRepository,
    },
    {
      provide: LIVE_SESSION_SERVICE_TOKEN,
      useClass: LiveSessionService,
    },
    LiveSessionProfile,
  ],
  exports: [LIVE_SESSION_REPOSITORY_TOKEN, LIVE_SESSION_SERVICE_TOKEN],
})
export class LiveSessionModule {}
