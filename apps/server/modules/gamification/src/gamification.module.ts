import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule, SharedModule, NatsClientModule } from '@server/shared';

// NATS Handlers
import { GamificationHandler, ActivityHandler } from '@server/gamification/interfaces/nats';

// Services
import {
    StreakService,
    AchievementService,
    ActivityService,
    LeaderboardService,
} from '@server/gamification/services';

// Jobs
import { StreakCheckJob } from '@server/gamification/jobs/streak-check.job';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        SharedModule,
        PrismaModule,
        NatsClientModule,
    ],
    controllers: [
        GamificationHandler,
        ActivityHandler,
    ],
    providers: [
        StreakService,
        AchievementService,
        ActivityService,
        LeaderboardService,
        StreakCheckJob,
    ],
})
export class GamificationModule { }
