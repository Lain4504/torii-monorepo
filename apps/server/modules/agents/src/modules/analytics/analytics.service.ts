import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FastMcpService } from '../../fastmcp/fastmcp.service';
import { z } from 'zod';
import { AgentReadinessProfileResponseSchema, AgentStudyPathResponseSchema, Requester } from '@workspace/schemas';

@Injectable()
export class AnalyticsService implements OnModuleInit {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        private readonly fastMcpService: FastMcpService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

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
                const syllabus = this.fastMcpService.loadResource('jlpt-syllabus.json');
                const levelSyllabus = syllabus ? syllabus[targetLevel] : null;

                const template = this.fastMcpService.loadPromptTemplate('analytics/study-path-suggestion.md');
                const prompt = template({
                    userId,
                    targetLevel,
                    timeframe,
                    userContext,
                    syllabus: levelSyllabus,
                    timestamp: new Date().toISOString()
                });

                return this.fastMcpService.callGeminiWithSchema(prompt, AgentStudyPathResponseSchema);
            }
        );

        // 3. Generate Report
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

        // 4. Readiness Profile (Unified)
        this.fastMcpService.addTool(
            'analytics_get_readiness_profile',
            'Get a comprehensive readiness profile and benchmark',
            z.object({
                userId: z.string(),
                targetLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
            }),
            async ({ userId, targetLevel }) => {
                // Fetch real metrics from core service via NATS
                const metrics = await firstValueFrom(
                    this.natsClient.send({ cmd: 'learning.readinessMetrics' }, { userId })
                ).catch(err => {
                    this.logger.warn(`Failed to fetch readiness metrics for user ${userId}: ${err.message}`);
                    return null;
                });

                const template = this.fastMcpService.loadPromptTemplate('analytics/readiness-profile.md');
                const userContext = await this.fastMcpService.getUserContext(userId);

                const prompt = template({
                    userId,
                    targetLevel,
                    metrics,
                    userContext,
                    timestamp: new Date().toISOString()
                });

                return this.fastMcpService.callGeminiWithSchema(prompt, AgentReadinessProfileResponseSchema);
            }
        );
    }

    // --- Public Methods (Delegate to Tools) ---

    async trackProgress(requester: Requester, timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<any> {
        return this.fastMcpService.callTool('analytics_track_progress', { userId: requester.sub, timeframe });
    }

    async suggestStudyPath(
        requester: Requester,
        targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
        timeframe?: string,
    ): Promise<any> {
        return this.fastMcpService.callTool('analytics_suggest_study_path', { userId: requester.sub, targetLevel, timeframe });
    }

    async generateReport(
        requester: Requester,
        reportType: 'progress' | 'assessment' | 'comprehensive' = 'comprehensive',
        timeframe: string = 'month',
    ): Promise<any> {
        return this.fastMcpService.callTool('analytics_generate_report', { userId: requester.sub, reportType, timeframe });
    }

    async getReadinessProfile(requester: Requester, targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'): Promise<any> {
        return this.fastMcpService.callTool('analytics_get_readiness_profile', { userId: requester.sub, targetLevel });
    }
}
