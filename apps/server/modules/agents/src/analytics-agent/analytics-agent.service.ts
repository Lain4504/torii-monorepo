import { Injectable } from '@nestjs/common';
import { AiTemplateService } from '../shared/ai-template.service';

@Injectable()
export class AnalyticsAgentService {
  constructor(private readonly aiTemplateService: AiTemplateService) {}

  async trackProgress(userId: string, activity: string, score?: number): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate('analytics.progress-analyze', {
      progressData: JSON.stringify({ activity, score })
    });

    if (result.rawResponse) {
      return {
        userId,
        activity,
        score,
        timestamp: new Date(),
        status: 'analyzed',
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return {
      userId,
      activity,
      score,
      timestamp: new Date(),
      status: 'analyzed',
      ...result,
    };
  }

  async suggestStudyPath(userId: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate('analytics.study-path', {
      targetLevel: 'unknown', // This should be passed as parameter
      currentLevel: 'unknown', // This should be passed as parameter
      weakAreas: 'unknown', // This should be passed as parameter
      timePerWeek: 10 // Default value
    });

    if (result.rawResponse) {
      return {
        userId,
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return {
      userId,
      ...result,
      generatedAt: new Date(),
    };
  }

  async identifyWeaknesses(userId: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate('analytics.weaknesses-identify', {
      userId
    });

    if (result.rawResponse) {
      return {
        aiResponse: result.rawResponse,
        error: result.error
      };
    }

    return result;
  }

  async predictReadiness(userId: string, level: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate('analytics.readiness-predict', {
      userId,
      level
    });

    if (result.rawResponse) {
      return {
        aiResponse: result.rawResponse,
        error: result.error
      };
    }

    return result;
  }

  async generateReport(userId: string, reportType: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate('analytics.report-generate', {
      userId,
      reportType
    });

    if (result.rawResponse) {
      return {
        aiResponse: result.rawResponse,
        error: result.error
      };
    }

    return result;
  }
}
