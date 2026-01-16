import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule, SharedModule, NatsClientModule } from '@server/shared';

// Controllers
import { GamificationController } from './controllers/gamification.controller';

// Services
import { StreakService } from './services/streak.service';
import { AchievementService } from './services/achievement.service';
import { ActivityService } from './services/activity.service';

// Listeners
import { ActivityListener } from './listeners/activity.listener';

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
        GamificationController,
        ActivityListener, // Event listeners are also controllers
    ],
    providers: [
        StreakService,
        AchievementService,
        ActivityService,
        StreakCheckJob,
    ],
})
export class GamificationModule { }
