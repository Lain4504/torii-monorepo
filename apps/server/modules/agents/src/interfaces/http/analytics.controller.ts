import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AnalyticsAgentService } from '../../analytics-agent/analytics-agent.service';
import { TrackProgressDto, SuggestPathDto, IdentifyWeaknessesDto, PredictReadinessDto, GenerateReportDto } from '../../dtos/analytics.dto';

@Controller('agents')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsAgentService) {}

  @Post('progress/track')
  async trackProgress(@Body() body: TrackProgressDto) {
    this.logger.log(`Progress tracking for user: ${body.userId}, activity: ${body.activity}`);
    return await this.analyticsService.trackProgress(body.userId, body.activity, body.score);
  }

  @Post('path/suggest')
  async suggestStudyPath(@Body() body: SuggestPathDto) {
    this.logger.log(`Study path suggestion for user: ${body.userId}`);
    return await this.analyticsService.suggestStudyPath(body.userId);
  }

  @Post('weaknesses/identify')
  async identifyWeaknesses(@Body() body: IdentifyWeaknessesDto) {
    this.logger.log(`Weakness identification for user: ${body.userId}`);
    return await this.analyticsService.identifyWeaknesses(body.userId);
  }

  @Post('readiness/predict')
  async predictReadiness(@Body() body: PredictReadinessDto) {
    this.logger.log(`Readiness prediction for user: ${body.userId} at JLPT ${body.level}`);
    return await this.analyticsService.predictReadiness(body.userId, body.level);
  }

  @Post('report/generate')
  async generateReport(@Body() body: GenerateReportDto) {
    this.logger.log(`Report generation for user: ${body.userId}, type: ${body.reportType}`);
    return await this.analyticsService.generateReport(body.userId, body.reportType);
  }
}
