import { Controller, Post, Body, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { FastMcpService } from '../fastmcp/fastmcp.service';
import {
  TrackProgressDto,
  SuggestPathDto,
  IdentifyWeaknessesDto,
  PredictReadinessDto,
  GenerateReportDto,
} from '../dtos/analytics.dto';

/**
 * Analytics Controller
 * 
 * Architecture Flow:
 * Client → AnalyticsController → FastMcpService (Agent Brain) → Gemini API
 */
@Controller('agents')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    private readonly fastMcpService: FastMcpService,
  ) {}

  @Post('progress/track')
  async trackProgress(@Body() body: TrackProgressDto) {
    this.logger.log(
      `📈 Progress tracking for user: ${body.userId}, activity: ${body.activity}`,
    );
    
    const result = await this.fastMcpService.trackProgress(
      body.userId,
      'month' // timeframe
    );
    
    // TODO: Save progress data to database
    
    return result;
  }

  @Post('path/suggest')
  async suggestStudyPath(@Body() body: SuggestPathDto) {
    this.logger.log(`🗺️ Study path suggestion for user: ${body.userId}`);
    
    const studyPath = await this.fastMcpService.suggestStudyPath(
      body.userId,
      'N4', // TODO: Get from user profile
      '6 months' // timeframe
    );
    
    // TODO: Save suggested path to user preferences
    
    return studyPath;
  }

  @Post('analytics/weaknesses')
  async identifyWeaknesses(@Body() body: IdentifyWeaknessesDto) {
    this.logger.log(`🔍 Weakness identification for user: ${body.userId}`);
    
    const weaknesses = await this.fastMcpService.identifyWeaknesses(body.userId);
    
    // TODO: Save identified weaknesses for tracking
    
    return weaknesses;
  }

  @Post('analytics/readiness')
  @UsePipes(new ValidationPipe({ skipMissingProperties: true, whitelist: false }))
  async predictReadiness(@Body() body: any) {
    // Extract level from either 'level' field or 'targetTest' field (e.g., "JLPT N5")
    let level = body.level;
    if (!level && body.targetTest) {
      // Extract N5/N4/etc from "JLPT N5" format
      const match = body.targetTest.match(/N[1-5]/);
      level = match ? match[0] : 'N5';
    }
    level = level || 'N5';
    
    this.logger.log(
      `🎯 Readiness prediction for user: ${body.userId} at JLPT ${level}`,
    );
    
    const prediction = await this.fastMcpService.predictReadiness(
      body.userId,
      level as any
    );
    
    return prediction;
  }

  @Post('analytics/report')
  async generateReport(@Body() body: GenerateReportDto) {
    this.logger.log(
      `📄 Report generation for user: ${body.userId}, type: ${body.reportType}`,
    );
    
    const report = await this.fastMcpService.generateReport(
      body.userId,
      body.reportType as any,
      'month'
    );
    
    // TODO: Save report to database
    
    return report;
  }
}
