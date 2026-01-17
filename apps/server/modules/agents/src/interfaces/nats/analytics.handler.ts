import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FastMcpService } from '../../fastmcp/fastmcp.service';

/**
 * NATS Handler for Analytics Agent
 * Handles inter-service communication via NATS messaging
 */
@Controller()
export class AnalyticsHandler {
  constructor(private readonly fastMcpService: FastMcpService) { }

  @MessagePattern({ cmd: 'agents.analytics.trackProgress' })
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

  @MessagePattern({ cmd: 'agents.analytics.suggestStudyPath' })
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

  @MessagePattern({ cmd: 'agents.analytics.identifyWeaknesses' })
  async identifyWeaknesses(
    @Payload()
    data: { userId: string },
  ) {
    return this.fastMcpService.identifyWeaknesses(data.userId);
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
    return this.fastMcpService.predictReadiness(data.userId, level);
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
    return this.fastMcpService.generateReport(
      data.userId,
      data.reportType || 'comprehensive',
      data.timeframe || 'month',
    );
  }
}
