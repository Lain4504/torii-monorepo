import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FastMcpService } from '../../fastmcp/fastmcp.service';
import { z } from 'zod';

@Injectable()
export class AssessmentService implements OnModuleInit {
    private readonly logger = new Logger(AssessmentService.name);

    constructor(private readonly fastMcpService: FastMcpService) { }

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
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('assessment/jlpt-test-generation.md');
                const prompt = template({ level, section, questionCount, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
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

                const aiResponse = await this.fastMcpService.callGemini(prompt);
                const aiParsed = this.fastMcpService.cleanJsonResponse(aiResponse);

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
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('assessment/placement-test.md');
                const prompt = template({ questionCount, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
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

                const aiResponse = await this.fastMcpService.callGemini(prompt);
                const aiParsed = this.fastMcpService.cleanJsonResponse(aiResponse);

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
        userId: string,
        level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
        section: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'full',
        questionCount: number = 10,
    ): Promise<any> {
        return this.fastMcpService.callTool('assessment_generate_test', { userId, level, section, questionCount });
    }

    async evaluateTest(
        userId: string,
        testId: string,
        answers: Array<{ questionId: string; userAnswer: string; correctAnswer: string }>,
    ): Promise<any> {
        return this.fastMcpService.callTool('assessment_evaluate_test', { userId, testId, answers });
    }

    async generatePlacementTest(userId: string, questionCount: number = 15): Promise<any> {
        return this.fastMcpService.callTool('assessment_placement_test', { userId, questionCount });
    }

    async evaluatePlacementTest(userId: string, testId: string, userAnswers: any): Promise<any> {
        return this.fastMcpService.callTool('assessment_evaluate_placement', { userId, testId, userAnswers });
    }
}
