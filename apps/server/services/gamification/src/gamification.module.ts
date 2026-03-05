import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule, NatsClientModule } from '@server/shared';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { LeaderboardsModule } from './modules/leaderboards/leaderboards.module';
import { RedemptionsModule } from './modules/redemptions/redemptions.module';
import { StreakCheckJob } from './jobs/streak-check.job';
import { PROFILES_SERVICE_TOKEN } from './interfaces/services';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SharedModule,
    NatsClientModule,
    ProfilesModule,
    ActivitiesModule,
    AchievementsModule,
    LeaderboardsModule,
    RedemptionsModule,
  ],
  providers: [StreakCheckJob],
})
export class GamificationModule {}
