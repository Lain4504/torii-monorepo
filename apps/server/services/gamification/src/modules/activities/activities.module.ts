import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';
import { ActivitiesHandler } from './activities.handler';
import { ActivityListener } from '../../listeners/activity.listener';
import { ACTIVITIES_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import { ACTIVITIES_REPOSITORY_TOKEN } from '@server/gamification/interfaces/repositories';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { ProfilesModule } from '../profiles/profiles.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [PrismaModule, NatsClientModule, ProfilesModule, AchievementsModule],
  controllers: [ActivitiesHandler, ActivityListener],
  providers: [
    {
      provide: ACTIVITIES_SERVICE_TOKEN,
      useClass: ActivitiesService,
    },
    {
      provide: ACTIVITIES_REPOSITORY_TOKEN,
      useClass: ActivitiesRepository,
    },
  ],
  exports: [ACTIVITIES_SERVICE_TOKEN],
})
export class ActivitiesModule {}
