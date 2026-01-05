import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AnalyticsAgentService } from '../../analytics-agent/analytics-agent.service';

@Controller()
export class AnalyticsAgentController {
  private readonly logger = new Logger(AnalyticsAgentController.name);

  constructor(private readonly analyticsService: AnalyticsAgentService) {}

  @MessagePattern({ cmd: 'ai.progress.track' })
  async trackProgress(data: { userId: string; activity: string; score?: number }) {
    try {
      this.logger.log('AI Progress track request received');
      const result = await this.analyticsService.trackProgress(data.userId, data.activity, data.score);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.progress.track:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.path.suggest' })
  async suggestStudyPath(data: { userId: string }) {
    try {
      this.logger.log('AI Path suggest request received');
      const result = await this.analyticsService.suggestStudyPath(data.userId);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.path.suggest:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.weaknesses.identify' })
  async identifyWeaknesses(data: { userId: string }) {
    try {
      this.logger.log('AI Weaknesses identify request received');
      const result = await this.analyticsService.identifyWeaknesses(data.userId);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.weaknesses.identify:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.readiness.predict' })
  async predictReadiness(data: { userId: string; level: string }) {
    try {
      this.logger.log('AI Readiness predict request received');
      const result = await this.analyticsService.predictReadiness(data.userId, data.level);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.readiness.predict:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.report.generate' })
  async generateReport(data: { userId: string; reportType: string }) {
    try {
      this.logger.log('AI Report generate request received');
      const result = await this.analyticsService.generateReport(data.userId, data.reportType);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.report.generate:', error);
      throw error;
    }
  }
}
