import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FastMcpService } from '../../fastmcp/fastmcp.service';
import { z } from 'zod';
import { PrismaService } from '@server/shared';

import {
  AgentTestGenerationResponseSchema,
  AgentTestEvaluationResponseSchema,
  Requester,
} from '@workspace/schemas';

@Injectable()
export class AssessmentService implements OnModuleInit {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    private readonly fastMcpService: FastMcpService,
    private readonly prisma: PrismaService,
  ) {}

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
        section: z.enum([
          'vocabulary',
          'grammar',
          'reading',
          'listening',
          'full',
        ]),
        questionCount: z.number().default(10),
      }),
      async ({ userId, level, section, questionCount }) => {
        // Determine categories to query
        const categories =
          section === 'full'
            ? ['vocabulary', 'grammar', 'reading', 'listening']
            : [section];

        // Fetch from Question Bank first
        const dbQuestions = await this.prisma.question.findMany({
          where: {
            jlptLevel: level,
            category: { in: categories },
            status: 'active',
          },
          orderBy: { usageCount: 'asc' }, // Prioritize less used questions
          take: questionCount,
        });

        // If we have enough questions in DB, use them
        if (dbQuestions.length >= questionCount) {
          this.logger.debug(`Generated test from DB for ${level} ${section}`);

          // Increment usage count for these questions
          await this.prisma.question.updateMany({
            where: { id: { in: dbQuestions.map((q) => q.id) } },
            data: { usageCount: { increment: 1 } },
          });

          return {
            testId: `db_${Date.now()}`,
            level,
            section,
            questions: dbQuestions.map((q) => ({
              id: q.id,
              type: q.questionType,
              level: q.jlptLevel,
              question: q.questionText,
              options: (() => {
                const o = q.options;
                if (!o) return [];
                if (Array.isArray(o)) return o;
                if (typeof o === 'string') {
                  try {
                    const p = JSON.parse(o);
                    return Array.isArray(p) ? p : Object.values(p);
                  } catch {
                    return [];
                  }
                }
                if (typeof o === 'object') return Object.values(o);
                return [];
              })(),
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })),
            estimatedTimeMinutes: Math.ceil(questionCount * 1.5),
          };
        }

        // Fallback to AI if insufficient questions
        this.logger.debug(
          `Insufficient DB questions (${dbQuestions.length}/${questionCount}). Falling back to AI.`,
        );
        const userContext = await this.fastMcpService.getUserContext(userId);
        const template = this.fastMcpService.loadPromptTemplate(
          'assessment/jlpt-test-generation.md',
        );
        const prompt = template({
          level,
          section,
          questionCount,
          userContext,
          timestamp: new Date().toISOString(),
        });

        return this.fastMcpService.callGeminiWithSchema(
          prompt,
          AgentTestGenerationResponseSchema,
          { maxRetries: 1 },
        );
      },
    );

    // 2. Evaluate Test (Post-Quiz Analysis)
    this.fastMcpService.addTool(
      'assessment_analyze_results',
      'Analyze quiz/exam results and provide AI feedback and recommendations',
      z.object({
        userId: z.string(),
        attemptId: z.string(),
      }),
      async ({ userId, attemptId }) => {
        const attempt = await this.prisma.quizAttempt.findUnique({
          where: { id: attemptId },
          include: {
            quiz: true,
            details: {
              include: { question: true },
            },
          },
        });

        if (!attempt) throw new Error('Attempt not found');

        const userContext = await this.fastMcpService.getUserContext(userId);
        const template = this.fastMcpService.loadPromptTemplate(
          'assessment/test-evaluation.md',
        );

        const prompt = template({
          quizTitle: attempt.quiz.title,
          score: attempt.score,
          maxScore: attempt.maxScore,
          percentage: attempt.percentage,
          details: attempt.details.map((d) => ({
            question: d.question.questionText,
            userAnswer: d.userAnswer,
            correctAnswer: d.question.correctAnswer,
            isCorrect: d.isCorrect,
            category: d.question.category,
          })),
          userContext,
          timestamp: new Date().toISOString(),
        });

        const aiParsed = await this.fastMcpService.callGeminiWithSchema(
          prompt,
          AgentTestEvaluationResponseSchema,
          { maxRetries: 1 },
        );

        return {
          attemptId,
          score: attempt.score,
          maxScore: attempt.maxScore,
          percentage: attempt.percentage,
          feedback: aiParsed.data.feedback || '',
          details: aiParsed.data.details || [],
        };
      },
    );

    // 5. Placement Test (Thin Wrapper)
    this.fastMcpService.addTool(
      'assessment_placement_test',
      'Search for available placement tests',
      z.object({
        userId: z.string(),
        level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
      }),
      async ({ userId, level }) => {
        const where: any = { quizType: 'placement', status: 'published' };
        if (level) where.jlptLevel = level;

        const placementTests = await this.prisma.quiz.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        return {
          availableTests: placementTests.map((t) => ({
            id: t.id,
            title: t.title,
            jlptLevel: t.jlptLevel,
            questionCount: t.totalQuestions,
            estimatedTimeMinutes: t.totalTime || 30,
          })),
          instructions:
            'Take one of these quizzes via the Exam API to get placed.',
        };
      },
    );

    // 6. Evaluate Placement (AI Recommendations)
    this.fastMcpService.addTool(
      'assessment_recommend_courses',
      'Get AI course recommendations based on placement results',
      z.object({
        userId: z.string(),
        placementResultId: z.string(),
      }),
      async ({ userId, placementResultId }) => {
        const result = await this.prisma.placementResult.findUnique({
          where: { id: placementResultId },
          include: {
            quiz: true,
            attempt: {
              include: {
                details: { include: { question: true } },
              },
            },
          },
        });

        if (!result) throw new Error('Placement result not found');

        const userContext = await this.fastMcpService.getUserContext(userId);

        // Fetch available enrolling course runs to provide real recommendations
        const enrollingCourses = await this.prisma.courseRun.findMany({
          where: { status: 'ENROLLING' },
          include: { courseMaster: true },
          take: 10,
        });

        const template = this.fastMcpService.loadPromptTemplate(
          'assessment/placement-evaluation.md',
        );
        const prompt = template({
          assessedLevel: result.recommendedLevel,
          score: result.overallScore,
          availableCourses: enrollingCourses.map((c) => ({
            id: c.id,
            title: c.courseMaster.title,
            level: c.courseMaster.jlptLevel,
            startDate: c.startDate,
          })),
          userContext,
          timestamp: new Date().toISOString(),
        });

        const aiParsed = await this.fastMcpService.callGeminiWithSchema(
          prompt,
          z.object({
            analysis: z.string(),
            detailedStudyPlan: z.string(),
            recommendedCourseIds: z.array(z.string()),
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
          }),
          { maxRetries: 1 },
        );

        // Update the result with AI recommendations?
        // For now, return to user.
        return {
          assessedLevel: result.recommendedLevel,
          analysis: aiParsed.data.analysis || '',
          studyPlan: aiParsed.data.detailedStudyPlan || '',
          recommendedCourses: enrollingCourses.filter((c) =>
            aiParsed.data.recommendedCourseIds.includes(c.id),
          ),
          strengths: aiParsed.data.strengths || [],
          weaknesses: aiParsed.data.weaknesses || [],
        };
      },
    );
  }

  // --- Public Methods (Delegate to Tools) ---

  // --- Public Methods (Delegate to Tools) ---

  async generateJlptTest(
    requester: Requester,
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
    section: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'full',
    questionCount: number = 10,
  ): Promise<any> {
    return this.fastMcpService.callTool('assessment_generate_test', {
      userId: requester.sub,
      level,
      section,
      questionCount,
    });
  }

  async analyzeResults(requester: Requester, attemptId: string): Promise<any> {
    return this.fastMcpService.callTool('assessment_analyze_results', {
      userId: requester.sub,
      attemptId,
    });
  }

  async getPlacementTests(requester: Requester, level?: string): Promise<any> {
    return this.fastMcpService.callTool('assessment_placement_test', {
      userId: requester.sub,
      level,
    });
  }

  async recommendCourses(
    requester: Requester,
    placementResultId: string,
  ): Promise<any> {
    return this.fastMcpService.callTool('assessment_recommend_courses', {
      userId: requester.sub,
      placementResultId,
    });
  }
}
