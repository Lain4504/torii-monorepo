import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PostAnalyticsService } from './post-analytics.service';

/**
 * Post Analytics Scheduler
 * Handles scheduled tasks for post analytics
 */
@Injectable()
export class PostAnalyticsScheduler {
  private readonly logger = new Logger(PostAnalyticsScheduler.name);

  constructor(private readonly postAnalyticsService: PostAnalyticsService) {}

  /**
   * Generate daily post interaction statistics
   * Runs every day at 00:00 (midnight) to send daily summary to staff
   * Cron expression: '0 0 * * *' (at 00:00 every day)
   * 
   * Logic:
   * - Check comments from previous day (00:00-23:59:59 Asia/Ho_Chi_Minh)
   * - Send notification if interactions exist, skip otherwise
   * - Only process published posts (with publishedAt)
   */
  @Cron('0 0 * * *', {
    name: 'daily-post-analytics',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDailyPostAnalytics() {
    this.logger.log('🕐 Daily post analytics cronjob triggered (00:00 daily summary)');
    try {
      await this.postAnalyticsService.generateDailyPostInteractionStats();
      this.logger.log('✅ Daily post analytics completed successfully');
    } catch (error: any) {
      this.logger.error(
        `❌ Error in daily post analytics cronjob: ${error?.message}`,
        error?.stack,
      );
      // Don't throw - cronjob errors should be logged but not crash the app
    }
  }
}
