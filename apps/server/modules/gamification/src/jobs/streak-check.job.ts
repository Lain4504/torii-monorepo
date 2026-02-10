import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StreakService } from '@server/gamification/services';

@Injectable()
export class StreakCheckJob {
    private readonly logger = new Logger(StreakCheckJob.name);

    constructor(private readonly streakService: StreakService) { }

    /**
     * Run daily at 00:00 UTC to check and reset streaks
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        timeZone: 'UTC',
    })
    async handleStreakCheck() {
        this.logger.log('🕐 Running daily streak check...');

        try {
            await this.streakService.checkStreaksDaily();
            this.logger.log('✅ Daily streak check completed successfully');
        } catch (error) {
            this.logger.error('❌ Daily streak check failed', error.stack);
            // Consider alerting ops team here
        }
    }
}
