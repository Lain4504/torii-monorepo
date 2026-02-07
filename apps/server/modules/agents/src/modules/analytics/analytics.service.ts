import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FastMcpService } from '../../fastmcp/fastmcp.service';
import { z } from 'zod';

@Injectable()
export class AnalyticsService implements OnModuleInit {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private readonly fastMcpService: FastMcpService) { }

    onModuleInit() {
        this.registerTools();
    }

    private registerTools() {
        // 1. Track Progress
        this.fastMcpService.addTool(
            'analytics_track_progress',
            'Track learning progress over time',
            z.object({
                userId: z.string(),
                timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
            }),
            async ({ userId, timeframe }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('analytics/progress-tracking.md');
                const prompt = template({ userId, timeframe, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
            }
        );

        // 2. Suggest Study Path
        this.fastMcpService.addTool(
            'analytics_suggest_study_path',
            'Suggest a personalized study path',
            z.object({
                userId: z.string(),
                targetLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
                timeframe: z.string().optional(),
            }),
            async ({ userId, targetLevel, timeframe }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('analytics/study-path-suggestion.md');
                const prompt = template({ userId, targetLevel, timeframe, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
            }
        );

        // 3. Identify Weaknesses
        this.fastMcpService.addTool(
            'analytics_identify_weaknesses',
            'Identify knowledge gaps and weaknesses',
            z.object({
                userId: z.string(),
            }),
            async ({ userId }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('analytics/weakness-identification.md');
                const prompt = template({ userId, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
            }
        );

        // 4. Predict Readiness
        this.fastMcpService.addTool(
            'analytics_predict_readiness',
            'Predict readiness for specific JLPT level',
            z.object({
                userId: z.string(),
                targetLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
            }),
            async ({ userId, targetLevel }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('analytics/readiness-prediction.md');
                const prompt = template({ userId, targetTest: targetLevel, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
            }
        );

        // 5. Generate Report
        this.fastMcpService.addTool(
            'analytics_generate_report',
            'Generate comprehensive analytics report',
            z.object({
                userId: z.string(),
                reportType: z.enum(['progress', 'assessment', 'comprehensive']).default('comprehensive'),
                timeframe: z.string().default('month'),
            }),
            async ({ userId, reportType, timeframe }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('analytics/report-generation.md');
                const prompt = template({ userId, reportType, period: timeframe, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
            }
        );
    }

    // --- Public Methods (Delegate to Tools) ---

    async trackProgress(userId: string, timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<any> {
        return this.fastMcpService.callTool('analytics_track_progress', { userId, timeframe });
    }

    async suggestStudyPath(
        userId: string,
        targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
        timeframe?: string,
    ): Promise<any> {
        return this.fastMcpService.callTool('analytics_suggest_study_path', { userId, targetLevel, timeframe });
    }

    async identifyWeaknesses(userId: string): Promise<any> {
        return this.fastMcpService.callTool('analytics_identify_weaknesses', { userId });
    }

    async predictReadiness(userId: string, targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'): Promise<any> {
        return this.fastMcpService.callTool('analytics_predict_readiness', { userId, targetLevel });
    }

    async generateReport(
        userId: string,
        reportType: 'progress' | 'assessment' | 'comprehensive' = 'comprehensive',
        timeframe: string = 'month',
    ): Promise<any> {
        return this.fastMcpService.callTool('analytics_generate_report', { userId, reportType, timeframe });
    }
}
