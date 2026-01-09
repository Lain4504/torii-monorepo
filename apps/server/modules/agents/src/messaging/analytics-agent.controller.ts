import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IAnalyticsAgentService } from '../interfaces/services';
import { ANALYTICS_AGENT_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Analytics Agent NATS Message Handler
 * Handles inter-service communication for AI analytics operations
 * 
 * @example
 * // From other service:
 * this.natsClient.send('agents.analytics.trackProgress', { userId, activity, score }).toPromise();
 */
@Controller()
export class AnalyticsAgentController {
  private readonly logger = new Logger(AnalyticsAgentController.name);

  constructor(
    @Inject(ANALYTICS_AGENT_SERVICE_TOKEN)
    private readonly analyticsService: IAnalyticsAgentService,
  ) {}

  /**
   * Track user progress
   * Pattern: agents.analytics.progress.track
   */
  @MessagePattern('agents.analytics.progress.track')
  async trackProgress(@Payload() data: { userId: string; activity: string; score?: number }) {
    try {
      this.logger.log('AI Progress track request received');
      const result = await this.analyticsService.trackProgress(data.userId, data.activity, data.score);
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.analytics.progress.track:', error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Suggest study path
   * Pattern: agents.analytics.path.suggest
   */
  @MessagePattern('agents.analytics.path.suggest')
  async suggestStudyPath(@Payload() data: { userId: string }) {
    try {
      this.logger.log('AI Path suggest request received');
      const result = await this.analyticsService.suggestStudyPath(data.userId);
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.analytics.path.suggest:', error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Identify weaknesses
   * Pattern: agents.analytics.weaknesses.identify
   */
  @MessagePattern('agents.analytics.weaknesses.identify')
  async identifyWeaknesses(@Payload() data: { userId: string }) {
    try {
      this.logger.log('AI Weaknesses identify request received');
      const result = await this.analyticsService.identifyWeaknesses(data.userId);
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.analytics.weaknesses.identify:', error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Predict readiness
   * Pattern: agents.analytics.readiness.predict
   */
  @MessagePattern('agents.analytics.readiness.predict')
  async predictReadiness(@Payload() data: { userId: string; level: string }) {
    try {
      this.logger.log('AI Readiness predict request received');
      const result = await this.analyticsService.predictReadiness(data.userId, data.level);
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.analytics.readiness.predict:', error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Generate report
   * Pattern: agents.analytics.report.generate
   */
  @MessagePattern('agents.analytics.report.generate')
  async generateReport(@Payload() data: { userId: string; reportType: string }) {
    try {
      this.logger.log('AI Report generate request received');
      const result = await this.analyticsService.generateReport(data.userId, data.reportType);
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.analytics.report.generate:', error);
      return {
        success: false,
        error: (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }
}
