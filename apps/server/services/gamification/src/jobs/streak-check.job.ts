import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PROFILES_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IProfilesService } from '@server/gamification/interfaces/services';

@Injectable()
export class StreakCheckJob {
  private readonly logger = new Logger(StreakCheckJob.name);

  constructor(
    @Inject(PROFILES_SERVICE_TOKEN)
    private readonly profilesService: IProfilesService,
  ) {}

  /**
   * Run daily at 00:00 UTC to check and reset streaks
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'UTC',
  })
  async handleStreakCheck() {
    this.logger.log('🕐 Running daily streak check...');

    try {
      await this.profilesService.checkStreaksDaily();
      this.logger.log('✅ Daily streak check completed successfully');
    } catch (error) {
      this.logger.error('❌ Daily streak check failed', error.stack);
    }
  }
}
