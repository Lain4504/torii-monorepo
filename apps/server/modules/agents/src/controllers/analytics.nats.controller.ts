import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FastMcpService } from '../fastmcp/fastmcp.service';

/**
 * NATS Controller for Analytics Agent
 * Handles inter-service communication via NATS messaging
 */
@Controller()
export class AnalyticsNatsController {
  constructor(private readonly fastMcpService: FastMcpService) {}

  @MessagePattern('agents.analytics.track-progress')
  async trackProgress(
    @Payload()
    data: {
      userId: string;
      timeframe?: 'week' | 'month' | 'quarter' | 'year';
    },
  ) {
    return this.fastMcpService.trackProgress(
      data.userId,
      data.timeframe || 'month',
    );
  }

  @MessagePattern('agents.analytics.suggest-study-path')
  async suggestStudyPath(
    @Payload()
    data: {
      userId: string;
      targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      timeframe?: string;
    },
  ) {
    return this.fastMcpService.suggestStudyPath(
      data.userId,
      data.targetLevel || 'N5',
      data.timeframe,
    );
  }

  @MessagePattern('agents.analytics.identify-weaknesses')
  async identifyWeaknesses(
    @Payload()
    data: { userId: string },
  ) {
    return this.fastMcpService.identifyWeaknesses(data.userId);
  }

  @MessagePattern('agents.analytics.predict-readiness')
  async predictReadiness(
    @Payload()
    data: {
      userId: string;
      targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    },
  ) {
    const level = (data.level || data.targetLevel || 'N5') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    return this.fastMcpService.predictReadiness(data.userId, level);
  }

  @MessagePattern('agents.analytics.generate-report')
  async generateReport(
    @Payload()
    data: {
      userId: string;
      reportType?: 'progress' | 'assessment' | 'comprehensive';
      timeframe?: string;
    },
  ) {
    return this.fastMcpService.generateReport(
      data.userId,
      data.reportType || 'comprehensive',
      data.timeframe || 'month',
    );
  }
}
