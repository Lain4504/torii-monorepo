import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AiTemplateService, AiExecutionResult } from '../shared/ai-template.service';
import { FlashcardSchema, TranslateInputSchema, FlashcardInputSchema } from '../shared/interfaces/template.interface';
import { PrismaService } from '@server/shared';

@Injectable()
export class SenseiAgentService implements OnModuleInit {
  constructor(
    private readonly aiTemplateService: AiTemplateService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    // Use process.cwd() to get the project root, then navigate to the source assets
    const promptsDir = path.join(process.cwd(), 'modules', 'agents', 'src', 'assets', 'prompts', 'sensei');

    this.aiTemplateService.register({
      key: 'sensei.grammar-check',
      template: fs.readFileSync(path.join(promptsDir, 'grammar-check.md'), 'utf8'),
      outputFormat: 'text',
    });

    this.aiTemplateService.register({
      key: 'sensei.translate',
      template: fs.readFileSync(path.join(promptsDir, 'translate.md'), 'utf8'),
      inputSchema: TranslateInputSchema,
      outputFormat: 'text',
    });

    this.aiTemplateService.register({
      key: 'sensei.flashcard',
      template: fs.readFileSync(path.join(promptsDir, 'flashcard.md'), 'utf8'),
      inputSchema: FlashcardInputSchema,
      outputFormat: 'json',
      outputSchema: FlashcardSchema,
    });

    this.aiTemplateService.register({
      key: 'sensei.practice-drill',
      template: fs.readFileSync(path.join(promptsDir, 'practice-drill.md'), 'utf8'),
      outputFormat: 'text',
    });

    this.aiTemplateService.register({
      key: 'sensei.conversation-simulate',
      template: fs.readFileSync(path.join(promptsDir, 'conversation-simulate.md'), 'utf8'),
      outputFormat: 'text',
    });

    this.aiTemplateService.register({
      key: 'sensei.resource-recommend',
      template: fs.readFileSync(path.join(promptsDir, 'resource-recommend.md'), 'utf8'),
      outputFormat: 'text',
    });
  }

  async checkGrammar(text: string, userId: string): Promise<string> {
    const userContext = await this.getUserContext(userId);
    const result = await this.aiTemplateService.executeTemplate<string>(
      'sensei.grammar-check',
      { text, ...userContext },
    );
    if (this.isExecutionResult(result) && !result.success) {
      throw new Error(result.error || 'AI execution failed');
    }
    return this.isExecutionResult(result) ? (result.data as string) : (result as string);
  }

  async translate(text: string, from: string, to: string, userId: string): Promise<string> {
    const userContext = await this.getUserContext(userId);
    const result = await this.aiTemplateService.executeTemplate<string>('sensei.translate', {
      text,
      from,
      to,
      ...userContext,
    });
    if (this.isExecutionResult(result) && !result.success) {
      throw new Error(result.error || 'AI execution failed');
    }
    return this.isExecutionResult(result) ? (result.data as string) : (result as string);
  }

  async createFlashcard(
    word: string,
    meaning: string,
    example: string | undefined,
    userId: string,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const result = await this.aiTemplateService.executeTemplate(
      'sensei.flashcard',
      { word, meaning, example, ...userContext },
    );

    if (this.isExecutionResult(result) && !result.success) {
      // Handle parsing error
      return {
        word,
        meaning,
        example,
        created: new Date(),
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return {
      ...(this.isExecutionResult(result) ? result.data : result),
      created: new Date(),
    };
  }

  async generatePracticeDrill(
    drillType: string,
    level: string,
    topic: string | undefined,
    userId: string,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const result = await this.aiTemplateService.executeTemplate(
      'sensei.practice-drill',
      { drillType, level, topic, ...userContext },
    );
    if (this.isExecutionResult(result) && !result.success) {
      throw new Error(result.error || 'AI execution failed');
    }
    return this.isExecutionResult(result) ? result.data : result;
  }

  async simulateConversation(topic: string, level: string, userId: string): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const result = await this.aiTemplateService.executeTemplate(
      'sensei.conversation-simulate',
      { topic, level, ...userContext },
    );
    if (this.isExecutionResult(result) && !result.success) {
      throw new Error(result.error || 'AI execution failed');
    }
    return this.isExecutionResult(result) ? result.data : result;
  }

  async recommendResources(concept: string, level: string, userId: string): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const result = await this.aiTemplateService.executeTemplate(
      'sensei.resource-recommend',
      { concept, level, ...userContext },
    );
    if (this.isExecutionResult(result) && !result.success) {
      throw new Error(result.error || 'AI execution failed');
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
