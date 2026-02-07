import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AnalyticsService } from '../../modules/analytics/analytics.service';

/**
 * NATS Handler for Analytics Agent
 * Handles inter-service communication via NATS messaging
 */
@Controller()
export class AnalyticsHandler {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @MessagePattern({ cmd: 'agents.analytics.trackProgress' })
  async trackProgress(
    @Payload()
    data: {
      userId: string;
      timeframe?: 'week' | 'month' | 'quarter' | 'year';
    },
  ) {
    return this.analyticsService.trackProgress(
      data.userId,
      data.timeframe || 'month',
    );
  }

  @MessagePattern({ cmd: 'agents.analytics.suggestStudyPath' })
  async suggestStudyPath(
    @Payload()
    data: {
      userId: string;
      targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      timeframe?: string;
    },
  ) {
    return this.analyticsService.suggestStudyPath(
      data.userId,
      data.targetLevel || 'N5',
      data.timeframe,
    );
  }

  @MessagePattern({ cmd: 'agents.analytics.identifyWeaknesses' })
  async identifyWeaknesses(
    @Payload()
    data: { userId: string },
  ) {
    return this.analyticsService.identifyWeaknesses(data.userId);
  }

  @MessagePattern({ cmd: 'agents.analytics.predictReadiness' })
  async predictReadiness(
    @Payload()
    data: {
      userId: string;
      targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    },
  ) {
    const level = (data.level || data.targetLevel || 'N5') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    return this.analyticsService.predictReadiness(data.userId, level);
  }

  @MessagePattern({ cmd: 'agents.analytics.generateReport' })
  async generateReport(
    @Payload()
    data: {
      userId: string;
      reportType?: 'progress' | 'assessment' | 'comprehensive';
      timeframe?: string;
    },
  ) {
    return this.analyticsService.generateReport(
      data.userId,
      data.reportType || 'comprehensive',
      data.timeframe || 'month',
    );
  }
}
