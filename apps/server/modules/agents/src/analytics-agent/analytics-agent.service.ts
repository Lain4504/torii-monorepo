import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AiTemplateService, AiExecutionResult } from '../shared/ai-template.service';
import { ProgressAnalysisSchema, StudyPathSchema, WeaknessesAnalysisSchema, ReadinessPredictionSchema, ProgressReportSchema, ProgressTrackInputSchema, ReadinessPredictInputSchema, WeaknessesIdentifyInputSchema, ReportGenerateInputSchema } from '../shared/interfaces/template.interface';

@Injectable()
export class AnalyticsAgentService implements OnModuleInit {
  constructor(private readonly aiTemplateService: AiTemplateService) {}

  onModuleInit() {
    // Use process.cwd() to get the project root, then navigate to the source assets
    const promptsDir = path.join(process.cwd(), 'modules', 'agents', 'src', 'assets', 'prompts', 'analytics');

    this.aiTemplateService.register({
      key: 'analytics.progress-analyze',
      template: fs.readFileSync(path.join(promptsDir, 'progress-analyze.md'), 'utf8'),
      inputSchema: ProgressTrackInputSchema,
      outputFormat: 'json',
      outputSchema: ProgressAnalysisSchema,
    });

    this.aiTemplateService.register({
      key: 'analytics.study-path',
      template: fs.readFileSync(path.join(promptsDir, 'study-path.md'), 'utf8'),
      outputFormat: 'text', // This one might be text-based
    });

    this.aiTemplateService.register({
      key: 'analytics.weaknesses-identify',
      template: fs.readFileSync(path.join(promptsDir, 'weaknesses-identify.md'), 'utf8'),
      inputSchema: WeaknessesIdentifyInputSchema,
      outputFormat: 'json',
      outputSchema: WeaknessesAnalysisSchema,
    });

    this.aiTemplateService.register({
      key: 'analytics.readiness-predict',
      template: fs.readFileSync(path.join(promptsDir, 'readiness-predict.md'), 'utf8'),
      inputSchema: ReadinessPredictInputSchema,
      outputFormat: 'json',
      outputSchema: ReadinessPredictionSchema,
    });

    this.aiTemplateService.register({
      key: 'analytics.report-generate',
      template: fs.readFileSync(path.join(promptsDir, 'report-generate.md'), 'utf8'),
      inputSchema: ReportGenerateInputSchema,
      outputFormat: 'json',
      outputSchema: ProgressReportSchema,
    });
  }

  async trackProgress(
    userId: string,
    activity: string,
    score?: number,
  ): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'analytics.progress-analyze',
      {
        userId,
        activity,
        score,
      },
    );

    if (this.isExecutionResult(result) && !result.success) {
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

    const data = this.isExecutionResult(result) ? result.data : result;
    return {
      userId,
      activity,
      score,
      timestamp: new Date(),
      status: 'analyzed',
      ...data,
    };
  }

  async suggestStudyPath(userId: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'analytics.study-path',
      {
        userId,
      },
    );

    if (this.isExecutionResult(result) && !result.success) {
      return {
        userId,
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    const data = this.isExecutionResult(result) ? result.data : result;
    return {
      userId,
      ...data,
      generatedAt: new Date(),
    };
  }

  async identifyWeaknesses(userId: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'analytics.weaknesses-identify',
      {
        userId,
      },
    );

    if (this.isExecutionResult(result) && !result.success) {
      return {
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return this.isExecutionResult(result) ? result.data : result;
  }

  async predictReadiness(userId: string, level: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'analytics.readiness-predict',
      {
        userId,
        level,
      },
    );

    if (this.isExecutionResult(result) && !result.success) {
      return {
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return this.isExecutionResult(result) ? result.data : result;
  }

  async generateReport(userId: string, reportType: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'analytics.report-generate',
      {
        userId,
        reportType,
      },
    );

    if (this.isExecutionResult(result) && !result.success) {
      return {
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return this.isExecutionResult(result) ? result.data : result;
  }

  private isExecutionResult(obj: any): obj is AiExecutionResult {
    return obj && typeof obj === 'object' && 'success' in obj;
  }
}
