import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { AiTemplateService, AiExecutionResult } from '../shared/ai-template.service';
import { TestQuestionSchema, TestEvaluationSchema, ProgressBenchmarkSchema, TestGenerateInputSchema, TestEvaluateInputSchema, ProgressBenchmarkInputSchema } from '../shared/interfaces/template.interface';
import { PrismaService } from '@server/shared';

@Injectable()
export class AssessmentAgentService implements OnModuleInit {
  constructor(
    private readonly aiTemplateService: AiTemplateService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    // Use process.cwd() to get the project root, then navigate to the source assets
    const promptsDir = path.join(process.cwd(), 'modules', 'agents', 'src', 'assets', 'prompts', 'assessment');

    this.aiTemplateService.register({
      key: 'assessment.test-generate',
      template: fs.readFileSync(path.join(promptsDir, 'test-generate.md'), 'utf8'),
      inputSchema: TestGenerateInputSchema,
      outputFormat: 'json',
      outputSchema: z.object({
        questions: z.array(TestQuestionSchema),
      }),
    });

    this.aiTemplateService.register({
      key: 'assessment.evaluate',
      template: fs.readFileSync(path.join(promptsDir, 'evaluate.md'), 'utf8'),
      inputSchema: TestEvaluateInputSchema,
      outputFormat: 'json',
      outputSchema: TestEvaluationSchema,
    });

    this.aiTemplateService.register({
      key: 'assessment.progress-benchmark',
      template: fs.readFileSync(path.join(promptsDir, 'progress-benchmark.md'), 'utf8'),
      inputSchema: ProgressBenchmarkInputSchema,
      outputFormat: 'json',
      outputSchema: ProgressBenchmarkSchema,
    });

    this.aiTemplateService.register({
      key: 'assessment.schedule-test',
      template: fs.readFileSync(path.join(promptsDir, 'schedule-test.md'), 'utf8'),
      outputFormat: 'text',
    });
  }

  async generateJlptTest(
    level: string,
    type: string,
    questionCount: number,
    userId: string,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const result = await this.aiTemplateService.executeTemplate(
      'assessment.test-generate',
      {
        level,
        type,
        questionCount,
        ...userContext,
      },
    );

    if (this.isExecutionResult(result) && !result.success) {
      return {
        testId: `jlpt-${level}-${type}-${Date.now()}`,
        level,
        type,
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    const data = this.isExecutionResult(result) ? result.data : result;
    return {
      testId: `jlpt-${level}-${type}-${Date.now()}`,
      level,
      type,
      questions: data.questions?.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        question: q.question,
        options: q.options,
        // correctAnswer removed for security
      })) || [],
    };
  }

  async evaluateTest(
    testId: string,
    answers: Record<string, string>,
    userId: string,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const result = await this.aiTemplateService.executeTemplate(
      'assessment.evaluate',
      {
        testId,
        answers: JSON.stringify(answers),
        ...userContext,
      },
    );

    if (this.isExecutionResult(result) && !result.success) {
      return {
        testId,
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return this.isExecutionResult(result) ? result.data : result;
  }

  async getProgressBenchmark(userId: string, level: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'assessment.progress-benchmark',
      {
        userId,
        level,
      },
    );

    if (this.isExecutionResult(result) && !result.success) {
      return {
        userId,
        level,
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return this.isExecutionResult(result) ? result.data : result;
  }

  async scheduleTest(userId: string, level: string, date: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'assessment.schedule-test',
      {
        userId,
        level,
        date,
      },
    );

    if (this.isExecutionResult(result) && !result.success) {
      return {
        userId,
        level,
        date,
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return this.isExecutionResult(result) ? result.data : result;
  }

  private async getUserContext(userId: string): Promise<any> {
    // Fetch user's enrolled courses and their aiMetadata
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: { id: true, title: true, aiMetadata: true, jlptLevel: true },
        },
      },
    });

    const courseMetadata = enrollments.map(e => e.course.aiMetadata).filter(Boolean);
    const courseTitles = enrollments.map(e => e.course.title);
    const jlptLevels = [...new Set(enrollments.map(e => e.course.jlptLevel))];

    return {
      userId,
      enrolledCourses: courseTitles,
      jlptLevels,
      aiMetadata: courseMetadata, // Array of JSON objects
    };
  }

  private isExecutionResult(obj: any): obj is AiExecutionResult {
    return obj && typeof obj === 'object' && 'success' in obj;
  }
}
