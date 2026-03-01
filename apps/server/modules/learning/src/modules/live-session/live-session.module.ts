import { Module, forwardRef } from '@nestjs/common';
import { LiveSessionProfile } from '@server/learning/infrastructure/mappings/live-session.profile';
import { NatsClientModule } from '@server/shared';
import { LIVE_SESSION_REPOSITORY_TOKEN, COURSE_MASTER_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { LIVE_SESSION_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { LiveSessionRepository } from '@server/learning/modules/live-session/live-session.repository';
import { LiveSessionService } from '@server/learning/modules/live-session/live-session.service';
import { CourseMasterModule } from '@server/learning/modules/course-master/course-master.module';

@Module({
    imports: [NatsClientModule, forwardRef(() => CourseMasterModule)],
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
export class LiveSessionModule { }

