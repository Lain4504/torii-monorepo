import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FastMcpService } from '../../fastmcp/fastmcp.service';
import { z } from 'zod';
import { AgentReadinessProfileResponseSchema, AgentStudyPathResponseSchema, Requester } from '@workspace/schemas';
import Redis from 'ioredis';
import { AppConfigService } from '@server/shared';

const SNAPSHOT_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const SNAPSHOT_KEY = (userId: string, targetLevel: string) =>
    `analytics:snapshot:${userId}:${targetLevel}`;

export interface AnalyticsSnapshotCache {
    progressData: any;
    studyPathData: any;
    profileData: any;
    generatedAt: string; // ISO string
    targetLevel: string;
}

@Injectable()
export class AnalyticsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AnalyticsService.name);
    private redis: Redis;

    constructor(
        private readonly fastMcpService: FastMcpService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
        private readonly appConfig: AppConfigService,
    ) { }

    async onModuleInit() {
        // Init Redis connection
        const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://localhost:6379';
        this.redis = new Redis(redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
        });

        try {
            await this.redis.connect();
            this.logger.log('✅ Redis connected for analytics cache');
        } catch (err) {
            this.logger.warn(`⚠️ Redis connection failed — analytics will run without cache: ${err.message}`);
        }

        this.registerTools();
    }

    async onModuleDestroy() {
        if (this.redis?.status === 'ready') {
            await this.redis.quit();
        }
    }

    // ── Redis helpers ────────────────────────────────────────────────────────

    private async getCached(userId: string, targetLevel: string): Promise<AnalyticsSnapshotCache | null> {
        try {
            const raw = await this.redis.get(SNAPSHOT_KEY(userId, targetLevel));
            if (!raw) return null;
            const parsed: AnalyticsSnapshotCache = JSON.parse(raw);
            return parsed;
        } catch {
            return null;
        }
    }

    private async setCache(userId: string, targetLevel: string, data: AnalyticsSnapshotCache): Promise<void> {
        try {
            await this.redis.set(
                SNAPSHOT_KEY(userId, targetLevel),
                JSON.stringify(data),
                'EX', SNAPSHOT_TTL_SECONDS
            );
        } catch (err) {
            this.logger.warn(`⚠️ Failed to write analytics cache: ${err.message}`);
        }
    }

    // ── Public cache methods ─────────────────────────────────────────────────

    /**
     * getSnapshot — đọc cache từ Redis. Trả về null nếu không có hoặc đã expire (auto-handled by Redis TTL).
     */
    async getSnapshot(requester: Requester, targetLevel: string = 'N5'): Promise<{
        snapshot: AnalyticsSnapshotCache | null;
        isStale: boolean;
    }> {
        const snapshot = await this.getCached(requester.sub, targetLevel);
        return {
            snapshot,
            isStale: !snapshot,
        };
    }

    /**
     * generateAndSaveSnapshot — gọi 3 AI APIs song song, lưu vào Redis với TTL 24h.
     * Chỉ nên gọi khi user explicitly yêu cầu phân tích AI.
     */
    async generateAndSaveSnapshot(requester: Requester, targetLevel: string = 'N5'): Promise<AnalyticsSnapshotCache> {
        this.logger.log(`🤖 Generating AI snapshot for user ${requester.sub} (${targetLevel})`);

        // Gọi song song 3 AI tools
        const [progressData, studyPathData, profileData] = await Promise.all([
            this.fastMcpService.callTool('analytics_track_progress', {
                userId: requester.sub,
                timeframe: 'month',
            }),
            this.fastMcpService.callTool('analytics_suggest_study_path', {
                userId: requester.sub,
                targetLevel,
            }),
            this.fastMcpService.callTool('analytics_get_readiness_profile', {
                userId: requester.sub,
                targetLevel,
            }),
        ]);

        const snapshot: AnalyticsSnapshotCache = {
            progressData,
            studyPathData,
            profileData,
            generatedAt: new Date().toISOString(),
            targetLevel,
        };

        await this.setCache(requester.sub, targetLevel, snapshot);
        this.logger.log(`✅ AI snapshot generated & cached for user ${requester.sub} (TTL: 24h)`);

        return snapshot;
    }

    // ── Tool registration & legacy methods ───────────────────────────────────

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

    // --- Legacy Public Methods (Delegate to Tools) ---

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
