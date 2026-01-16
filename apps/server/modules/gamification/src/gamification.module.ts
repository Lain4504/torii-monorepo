import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule, SharedModule, NatsClientModule } from '@server/shared';

// NATS Handlers
import { GamificationHandler } from './interfaces/nats/gamification.handler';
import { ActivityHandler } from './interfaces/nats/activity.handler';

// Services
import { StreakService } from './services/streak.service';
import { AchievementService } from './services/achievement.service';
import { ActivityService } from './services/activity.service';

// Jobs
import { StreakCheckJob } from './jobs/streak-check.job';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
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
        StreakCheckJob,
    ],
})
export class GamificationModule { }
