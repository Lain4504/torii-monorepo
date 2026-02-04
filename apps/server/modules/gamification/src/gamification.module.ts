import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule, SharedModule, NatsClientModule } from '@server/shared';

// NATS Handlers
import { GamificationHandler } from './interfaces/nats/gamification.handler';
import { ActivityHandler } from './interfaces/nats/activity.handler';

// Services
import { StreakService } from './services/streak.service';
import { AchievementService } from './services/achievement.service';
import { ActivityService } from './services/activity.service';
import { LeaderboardService } from './services/leaderboard.service';

// Jobs
import { StreakCheckJob } from './jobs/streak-check.job';

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
