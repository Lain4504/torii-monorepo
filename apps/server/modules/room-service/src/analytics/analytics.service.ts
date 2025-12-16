import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '@server/shared';
import { AnalyticsDataMsg } from '@server/proto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly natsService: NatsService) {}

  async sendAnalyticsData(data: AnalyticsDataMsg) {
    const subject = 'plugnmeet_analytics';
    try {
      await this.natsService.publish(subject, data as any);
    } catch (e) {
      this.logger.error(`Failed to publish analytics: ${e.message}`);
    }
  }
}
