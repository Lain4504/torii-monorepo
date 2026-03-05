import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsRepository } from './achievements.repository';
import { AchievementsHandler } from './achievements.handler';
import { ACHIEVEMENTS_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import { ACHIEVEMENTS_REPOSITORY_TOKEN } from '@server/gamification/interfaces/repositories';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [PrismaModule, NatsClientModule, ProfilesModule],
  controllers: [AchievementsHandler],
  providers: [
    {
      provide: ACHIEVEMENTS_SERVICE_TOKEN,
      useClass: AchievementsService,
    },
    {
      provide: ACHIEVEMENTS_REPOSITORY_TOKEN,
      useClass: AchievementsRepository,
    },
  ],
  exports: [ACHIEVEMENTS_SERVICE_TOKEN],
})
export class AchievementsModule {}
