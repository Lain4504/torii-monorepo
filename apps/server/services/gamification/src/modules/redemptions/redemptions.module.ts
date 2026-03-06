import { Module } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { RedemptionsRepository } from './redemptions.repository';
import { RedemptionsHandler } from './redemptions.handler';
import { REDEMPTIONS_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import { REDEMPTIONS_REPOSITORY_TOKEN } from '@server/gamification/interfaces/repositories';
import { PrismaModule } from '@server/shared';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [PrismaModule, ProfilesModule],
  controllers: [RedemptionsHandler],
  providers: [
    {
      provide: REDEMPTIONS_SERVICE_TOKEN,
      useClass: RedemptionsService,
    },
    {
      provide: REDEMPTIONS_REPOSITORY_TOKEN,
      useClass: RedemptionsRepository,
    },
  ],
  exports: [REDEMPTIONS_SERVICE_TOKEN],
})
export class RedemptionsModule {}
