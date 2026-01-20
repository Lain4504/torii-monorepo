import { Module, forwardRef } from '@nestjs/common';
import { LIVE_SESSION_REPOSITORY_TOKEN, COURSE_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { LIVE_SESSION_SERVICE_TOKEN } from '../../interfaces/services';
import { LiveSessionRepository } from './live-session.repository';
import { LiveSessionService } from './live-session.service';
import { CourseModule } from '../course/course.module';

@Module({
    imports: [forwardRef(() => CourseModule)],
    providers: [
        {
            provide: LIVE_SESSION_REPOSITORY_TOKEN,
            useClass: LiveSessionRepository,
        },
        {
            provide: LIVE_SESSION_SERVICE_TOKEN,
            useClass: LiveSessionService,
        },
    ],
    exports: [LIVE_SESSION_REPOSITORY_TOKEN, LIVE_SESSION_SERVICE_TOKEN],
})
export class LiveSessionModule { }
