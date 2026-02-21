import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FastMcpService } from '../../fastmcp/fastmcp.service';
import { z } from 'zod';
import { PrismaService } from '@server/shared';

import {
    AgentTestGenerationResponseSchema,
    AgentTestEvaluationResponseSchema,
    Requester
} from '@workspace/schemas';

@Injectable()
export class AssessmentService implements OnModuleInit {
    private readonly logger = new Logger(AssessmentService.name);

    constructor(
        private readonly fastMcpService: FastMcpService,
        private readonly prisma: PrismaService,
    ) { }

    onModuleInit() {
        this.registerTools();
    }

    private registerTools() {

        // 1. Generate JLPT Test
        this.fastMcpService.addTool(
            'assessment_generate_test',
            'Generate a JLPT practice test',
            z.object({
                userId: z.string(),
                level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
                section: z.enum(['vocabulary', 'grammar', 'reading', 'listening', 'full']),
                questionCount: z.number().default(10),
            }),
            async ({ userId, level, section, questionCount }) => {
                // Determine categories to query
                const categories = section === 'full'
                    ? ['vocabulary', 'grammar', 'reading', 'listening']
                    : [section];

                // Fetch from Question Bank first
                const dbQuestions = await this.prisma.question.findMany({
                    where: {
                        jlptLevel: level,
                        category: { in: categories },
                        status: 'active'
                    },
                    orderBy: { usageCount: 'asc' }, // Prioritize less used questions
                    take: questionCount
                });

                // If we have enough questions in DB, use them
                if (dbQuestions.length >= questionCount) {
                    this.logger.debug(`Generated test from DB for ${level} ${section}`);

                    // Increment usage count for these questions
                    await this.prisma.question.updateMany({
                        where: { id: { in: dbQuestions.map(q => q.id) } },
                        data: { usageCount: { increment: 1 } }
                    });

                    return {
                        testId: `db_${Date.now()}`,
                        level,
                        section,
                        questions: dbQuestions.map(q => ({
                            id: q.id,
                            type: q.questionType,
                            level: q.jlptLevel,
                            question: q.questionText,
                            options: q.options as string[],
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation
                        })),
                        estimatedTimeMinutes: Math.ceil(questionCount * 1.5)
                    };
                }

                // Fallback to AI if insufficient questions
                this.logger.debug(`Insufficient DB questions (${dbQuestions.length}/${questionCount}). Falling back to AI.`);
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('assessment/jlpt-test-generation.md');
                const prompt = template({ level, section, questionCount, userContext, timestamp: new Date().toISOString() });

                return this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentTestGenerationResponseSchema,
                    { maxRetries: 1 }
                );
            }
        );

        // 2. Evaluate Test
        this.fastMcpService.addTool(
            'assessment_evaluate_test',
            'Evaluate specific test answers',
            z.object({
                userId: z.string(),
                testId: z.string(),
                answers: z.array(z.object({
                    questionId: z.string(),
                    userAnswer: z.union([z.string(), z.number()]),
                    correctAnswer: z.union([z.string(), z.number()]),
                })),
            }),
            async ({ userId, testId, answers }) => {
                // Determine scores in code (Deterministic)
                const details = answers.map(ans => ({
                    questionId: ans.questionId,
                    isCorrect: String(ans.userAnswer) === String(ans.correctAnswer)
                }));
                const score = details.filter(d => d.isCorrect).length;
                const maxScore = answers.length;
                const percentage = Math.round((score / maxScore) * 100);

                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('assessment/test-evaluation.md');

                // Call AI for feedback and explanations only
                const prompt = template({
                    testId,
                    userAnswers: answers,
                    calculatedResult: { score, maxScore, percentage, details },
                    userContext,
                    timestamp: new Date().toISOString()
                });

                const aiParsed = await this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentTestEvaluationResponseSchema,
                    { maxRetries: 1 }
                );

                // Merge: Code scores + AI explanations
                return {
                    testId,
                    score,
                    maxScore,
                    percentage,
                    feedback: aiParsed.feedback || "",
                    details: details.map(d => {
                        const aiDetail = aiParsed.details?.find((ad: any) => ad.questionId === d.questionId);
                        return {
                            ...d,
                            explanation: aiDetail?.explanation || ""
                        };
                    })
                };
            }
        );

        // 5. Placement Test
        this.fastMcpService.addTool(
            'assessment_placement_test',
            'Generate a placement test',
            z.object({
                userId: z.string(),
                questionCount: z.number().default(15),
            }),
            async ({ userId, questionCount }) => {
                // Try to find questions in DB first, balanced across levels
                const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
                const questionsPerLevel = Math.ceil(questionCount / levels.length);

                const dbQuestions: any[] = [];
                for (const level of levels) {
                    const questions = await this.prisma.question.findMany({
                        where: { jlptLevel: level, status: 'active' },
                        orderBy: { usageCount: 'asc' },
                        take: questionsPerLevel
                    });
                    dbQuestions.push(...questions);
                }

                if (dbQuestions.length >= questionCount * 0.8) { // At least 80% from DB
                    this.logger.debug(`Generated placement test from DB`);

                    // Increment usage count
                    await this.prisma.question.updateMany({
                        where: { id: { in: dbQuestions.map(q => q.id) } },
                        data: { usageCount: { increment: 1 } }
                    });

                    return {
                        testId: `db_placement_${Date.now()}`,
                        questions: dbQuestions.map(q => ({
                            id: q.id,
                            level: q.jlptLevel,
                            type: q.questionType,
                            question: q.questionText,
                            options: q.options as string[],
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation
                        })),
                        estimatedTimeMinutes: Math.ceil(questionCount * 1.5)
                    };
                }

                // Fallback to AI
                this.logger.debug(`Insufficient DB placement questions. Falling back to AI.`);
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('assessment/placement-test.md');
                const prompt = template({ questionCount, userContext, timestamp: new Date().toISOString() });

                return this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentTestGenerationResponseSchema,
                    { maxRetries: 1 }
                );
            }
        );

        // 6. Evaluate Placement
        this.fastMcpService.addTool(
            'assessment_evaluate_placement',
            'Evaluate placement test results',
            z.object({
                userId: z.string(),
                testId: z.string(),
                userAnswers: z.array(z.object({
                    questionId: z.string(),
                    level: z.string(),
                    userAnswer: z.union([z.string(), z.number()]),
                    correctAnswer: z.union([z.string(), z.number()]),
                })),
            }),
            async ({ userId, testId, userAnswers }) => {
                // Deterministic scoring by level
                const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
                const scoreBreakdown: Record<string, string> = {};

                let totalCorrect = 0;
                let suggestedLevel = 'N5';

                levels.forEach(level => {
                    const levelQuestions = userAnswers.filter(q => q.level === level);
                    if (levelQuestions.length > 0) {
                        const correct = levelQuestions.filter(q => String(q.userAnswer) === String(q.correctAnswer)).length;
                        const pct = Math.round((correct / levelQuestions.length) * 100);
                        scoreBreakdown[level] = `${pct}%`;
                        totalCorrect += correct;

                        // Simple logic: if pass > 60%, potentially that level
                        if (pct >= 60) suggestedLevel = level;
                    }
                });

                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('assessment/placement-evaluation.md');

                const prompt = template({
                    testId,
                    userAnswers,
                    calculatedResult: { suggestedLevel, scoreBreakdown },
                    userContext,
                    timestamp: new Date().toISOString()
                });

                const aiParsed = await this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentTestEvaluationResponseSchema,
                    { maxRetries: 1 }
                );

                return {
                    userId,
                    assessedLevel: suggestedLevel,
                    targetLevel: aiParsed.targetLevel || levels[levels.indexOf(suggestedLevel) + 1] || 'N1',
                    scoreBreakdown,
                    studyPathRecommendation: aiParsed.studyPathRecommendation || {}
                };
            }
        );
    }

    // --- Public Methods (Delegate to Tools) ---

    async generateJlptTest(
        requester: Requester,
        level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
        section: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'full',
        questionCount: number = 10,
    ): Promise<any> {
        return this.fastMcpService.callTool('assessment_generate_test', { userId: requester.sub, level, section, questionCount });
    }

    async evaluateTest(
        requester: Requester,
        testId: string,
        answers: Array<{ questionId: string; userAnswer: string; correctAnswer: string }>,
    ): Promise<any> {
        return this.fastMcpService.callTool('assessment_evaluate_test', { userId: requester.sub, testId, answers });
    }

    async generatePlacementTest(requester: Requester, questionCount: number = 15): Promise<any> {
        return this.fastMcpService.callTool('assessment_placement_test', { userId: requester.sub, questionCount });
    }

    async evaluatePlacementTest(requester: Requester, testId: string, userAnswers: any): Promise<any> {
        return this.fastMcpService.callTool('assessment_evaluate_placement', { userId: requester.sub, testId, userAnswers });
    }
}
