import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
// Triggering reload for schema update
import { FastMcpService } from '../../fastmcp/fastmcp.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import {
  AgentGrammarCheckResponseSchema,
  AgentTranslateResponseSchema,
  AgentFlashcardResponseSchema,
  AgentDrillResponseSchema,
  AgentConversationSimulationResponseSchema,
  AgentResourceRecommendationResponseSchema,
  AgentChatResponseSchema,
  Requester,
} from '@workspace/schemas';

import { PrismaService, AppConfigService } from '@server/shared';
import { AIUsageTrackingService } from '../analytics/ai-usage-tracking.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class SenseiService implements OnModuleInit {
  private readonly logger = new Logger(SenseiService.name);

  constructor(
    private readonly fastMcpService: FastMcpService,
    private readonly prisma: PrismaService,
    private readonly aiUsageTracking: AIUsageTrackingService,
    private readonly analyticsService: AnalyticsService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  private async deductCoins(userId: string, taskType: string, usage: any) {
    try {
      await firstValueFrom(
        this.natsClient.send(
          { cmd: 'billing.quota.recordTokenUsage' },
          {
            userId,
            taskType,
            usage: {
              promptTokenCount: usage.promptTokenCount,
              candidatesTokenCount: usage.candidatesTokenCount,
              totalTokenCount: usage.totalTokenCount,
              model: usage.model,
            },
          },
        ),
      );
      this.logger.log(
        `[billing] Synchronous deduction complete for user ${userId} (${taskType})`,
      );
    } catch (err: any) {
      this.logger.error(
        `[billing] Synchronous deduction failed for user ${userId}: ${err.message}`,
      );
      // Still proceed, don't block the user but log the error
    }
  }

  onModuleInit() {
    this.registerTools();
  }

  private registerTools() {
    // 1. Grammar Check
    this.fastMcpService.addTool(
      'sensei_check_grammar',
      'Check Japanese grammar and provide corrections',
      z.object({
        userId: z.string(),
        text: z.string(),
      }),
      async ({ userId, text }) => {
        const userContext = await this.fastMcpService.getUserContext(userId);
        const template = this.fastMcpService.loadPromptTemplate(
          'sensei/grammar-check.md',
        );
        const prompt = template({
          text,
          userContext,
          timestamp: new Date().toISOString(),
        });
        const { data, usage } = await this.fastMcpService.callGeminiWithSchema(
          prompt,
          AgentGrammarCheckResponseSchema,
          { maxRetries: 1 },
        );

        await this.aiUsageTracking.updateAITextChatUsage(
          `gen-${userId}`,
          userId,
          'grammar_check',
          usage.promptTokenCount,
          usage.candidatesTokenCount,
          usage.totalTokenCount,
        );

        await this.deductCoins(userId, 'grammar_check', usage);

        return data;
      },
    );

    // 2. Translate
    this.fastMcpService.addTool(
      'sensei_translate',
      'Translate text between languages with cultural context',
      z.object({
        userId: z.string(),
        text: z.string(),
        sourceLanguage: z.string(),
        targetLanguage: z.string(),
      }),
      async ({ userId, text, sourceLanguage, targetLanguage }) => {
        const userContext = await this.fastMcpService.getUserContext(userId);
        const template = this.fastMcpService.loadPromptTemplate(
          'sensei/translation.md',
        );
        const prompt = template({
          text,
          sourceLanguage,
          targetLanguage,
          userContext,
          timestamp: new Date().toISOString(),
        });
        const { data, usage } = await this.fastMcpService.callGeminiWithSchema(
          prompt,
          AgentTranslateResponseSchema,
          { maxRetries: 1 },
        );

        await this.aiUsageTracking.updateAITextChatUsage(
          `gen-${userId}`,
          userId,
          'translation',
          usage.promptTokenCount,
          usage.candidatesTokenCount,
          usage.totalTokenCount,
        );

        await this.deductCoins(userId, 'translation', usage);

        return data;
      },
    );

    // 3. Create Flashcard
    this.fastMcpService.addTool(
      'sensei_create_flashcard',
      'Create a vocabulary flashcard',
      z.object({
        userId: z.string(),
        topic: z.string(),
        level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).default('N4'),
      }),
      async ({ userId, topic, level }) => {
        const userContext = await this.fastMcpService.getUserContext(userId);
        const template = this.fastMcpService.loadPromptTemplate(
          'sensei/flashcard-creation.md',
        );
        const prompt = template({
          topic,
          level,
          userContext,
          timestamp: new Date().toISOString(),
        });
        const { data, usage } = await this.fastMcpService.callGeminiWithSchema(
          prompt,
          AgentFlashcardResponseSchema,
          { maxRetries: 1 },
        );

        await this.aiUsageTracking.updateAITextChatUsage(
          `gen-${userId}`,
          userId,
          'flashcard_creation',
          usage.promptTokenCount,
          usage.candidatesTokenCount,
          usage.totalTokenCount,
        );

        await this.deductCoins(userId, 'flashcard_creation', usage);

        return data;
      },
    );

    // 4. Practice Drill
    this.fastMcpService.addTool(
      'sensei_generate_drill',
      'Generate practice drills',
      z.object({
        userId: z.string(),
        type: z.enum([
          'grammar',
          'vocabulary',
          'kanji',
          'listening',
          'reading',
        ]),
        topic: z.string(),
        level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).default('N4'),
        count: z.number().default(5),
      }),
      async ({ userId, type, topic, level, count }) => {
        const userContext = await this.fastMcpService.getUserContext(userId);
        const template = this.fastMcpService.loadPromptTemplate(
          'sensei/practice-drill.md',
        );
        const prompt = template({
          type,
          topic,
          level,
          count,
          userContext,
          timestamp: new Date().toISOString(),
        });
        const { data, usage } = await this.fastMcpService.callGeminiWithSchema(
          prompt,
          AgentDrillResponseSchema,
          { maxRetries: 1 },
        );

        await this.aiUsageTracking.updateAITextChatUsage(
          `gen-${userId}`,
          userId,
          `drill_${type}`,
          usage.promptTokenCount,
          usage.candidatesTokenCount,
          usage.totalTokenCount,
        );

        await this.deductCoins(userId, `drill_${type}`, usage);

        return data;
      },
    );

    // 5. Simulate Conversation
    this.fastMcpService.addTool(
      'sensei_simulate_conversation',
      'Simulate a conversation scenario',
      z.object({
        userId: z.string(),
        scenario: z.enum([
          'restaurant',
          'shopping',
          'station',
          'office',
          'casual',
          'formal',
        ]),
        level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).default('N4'),
        turns: z.number().default(4),
      }),
      async ({ userId, scenario, level, turns }) => {
        const userContext = await this.fastMcpService.getUserContext(userId);
        const template = this.fastMcpService.loadPromptTemplate(
          'sensei/conversation-simulation.md',
        );
        const prompt = template({
          scenario,
          level,
          turns,
          userContext,
          timestamp: new Date().toISOString(),
        });
        const { data, usage } = await this.fastMcpService.callGeminiWithSchema(
          prompt,
          AgentConversationSimulationResponseSchema,
          { maxRetries: 1 },
        );

        await this.aiUsageTracking.updateAITextChatUsage(
          `gen-${userId}`,
          userId,
          `conversation_${scenario}`,
          usage.promptTokenCount,
          usage.candidatesTokenCount,
          usage.totalTokenCount,
        );

        await this.deductCoins(userId, `conversation_${scenario}`, usage);

        return data;
      },
    );

    // 6. Recommend Resources
    this.fastMcpService.addTool(
      'sensei_recommend_resources',
      'Recommend learning resources',
      z.object({
        userId: z.string(),
        topic: z.string(),
        resourceType: z
          .enum(['article', 'video', 'book', 'app', 'website', 'all'])
          .default('all'),
        level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
      }),
      async ({ userId, topic, resourceType, level }) => {
        const userContext = await this.fastMcpService.getUserContext(userId);

        // Hybrid Search: Fetch candidates from DB (Courses & Lessons)
        const courses = await this.prisma.courseProfile.findMany({
          where: {
            ...(level ? { level } : {}),
            OR: [
              { title: { contains: topic, mode: 'insensitive' } },
              { description: { contains: topic, mode: 'insensitive' } },
            ],
          },
          take: 5,
          select: { id: true, title: true, description: true, level: true },
        });

        const lessons = await this.prisma.lesson.findMany({
          where: {
            title: { contains: topic, mode: 'insensitive' },
            courseProfile: {
              ...(level ? { level } : {}),
            },
          },
          take: 5,
          select: {
            id: true,
            title: true,
            courseProfile: {
              select: { id: true, title: true },
            },
          },
        });

        const candidates = [
          ...courses.map((c) => ({
            title: c.title,
            type: 'Course',
            level: c.level,
            url: `/courses/${c.id}`,
            description: c.description || 'Comprehensive course',
          })),
          ...lessons.map((l) => ({
            title: l.title,
            type: 'Lesson',
            level: level || 'N/A',
            url: `/learning/${l.courseProfile.id}/lesson/${l.id}`,
            description: `Lesson in course: ${l.courseProfile.title}`,
          })),
        ];

        const template = this.fastMcpService.loadPromptTemplate(
          'sensei/resource-recommendation.md',
        );
        const prompt = template({
          topic,
          resourceType,
          level,
          userContext,
          candidates: JSON.stringify(candidates, null, 2),
          timestamp: new Date().toISOString(),
        });

        const { data, usage } = await this.fastMcpService.callGeminiWithSchema(
          prompt,
          AgentResourceRecommendationResponseSchema,
          { maxRetries: 1 },
        );

        await this.aiUsageTracking.updateAITextChatUsage(
          `gen-${userId}`,
          userId,
          'resource_recommendation',
          usage.promptTokenCount,
          usage.candidatesTokenCount,
          usage.totalTokenCount,
        );

        await this.deductCoins(userId, 'resource_recommendation', usage);

        return data;
      },
    );

    // 7. Chat
    this.fastMcpService.addTool(
      'sensei_chat',
      'General chat with Sensei',
      z.object({
        userId: z.string(),
        message: z.string(),
        history: z.array(z.any()).default([]),
      }),
      async ({ userId, message, history }) => {
        const userContext = await this.fastMcpService.getUserContext(userId);
        const template =
          this.fastMcpService.loadPromptTemplate('sensei/chat.md');
        const prompt = template({
          message,
          history,
          userContext,
          timestamp: new Date().toISOString(),
        });
        const { data, usage } = await this.fastMcpService.callGeminiWithSchema(
          prompt,
          AgentChatResponseSchema,
          { maxRetries: 1 },
        );

        await this.aiUsageTracking.updateAITextChatUsage(
          `chat-${userId}`,
          userId,
          'chat',
          usage.promptTokenCount,
          usage.candidatesTokenCount,
          usage.totalTokenCount,
        );

        await this.deductCoins(userId, 'chat', usage);

        return data;
      },
    );

    // 8. Roleplay
    this.fastMcpService.addTool(
      'sensei_roleplay',
      'Roleplay with Sensei on a specific topic',
      z.object({
        userId: z.string(),
        topic: z.string(),
        message: z.string(),
        history: z.array(z.any()).default([]),
        isFinal: z.boolean().optional().default(false),
      }),
      async ({ userId, topic, message, history, isFinal }) => {
        const userContext = await this.fastMcpService.getUserContext(userId);
        const template =
          this.fastMcpService.loadPromptTemplate('sensei/roleplay.md');
        // Calculate turns based on history length (each interaction is 2 turns: user + ai)
        // Actually history usually contains previous messages.
        const prompt = template({
          topic,
          message,
          history,
          isFinal,
          userContext,
          timestamp: new Date().toISOString(),
        });
        const { text: response, usage } =
          await this.fastMcpService.callGemini(prompt);

        // For roleplay, we use a consistent room ID to group the session
        const roomId = `rp-${userId}`;
        await this.aiUsageTracking.updateAITextChatUsage(
          roomId,
          userId,
          'roleplay',
          usage.promptTokenCount,
          usage.candidatesTokenCount,
          usage.totalTokenCount,
        );

        // session-based billing: only deduct when conversation is finished
        if (isFinal) {
          this.logger.log(
            `Final turn detected for Roleplay session ${roomId}. Generating artifacts and deducting coins...`,
          );

          // Retrieve total session usage from Redis
          const sessionUsage = await this.aiUsageTracking.getUsage(roomId);
          const totalPrompt = sessionUsage[`total_roleplay_prompt_tokens`] || 0;
          const totalCompletion =
            sessionUsage[`total_roleplay_completion_tokens`] || 0;
          const totalTokens = sessionUsage[`total_roleplay_tokens`] || 0;

          if (totalTokens > 0) {
            this.logger.log(
              `[billing] Session-based deduction for ${roomId}: ${totalTokens} tokens total.`,
            );
            await this.deductCoins(userId, 'roleplay', {
              promptTokenCount: totalPrompt,
              candidatesTokenCount: totalCompletion,
              totalTokenCount: totalTokens,
            });
          }

          // Delay slightly to ensure usage is recorded for artifacts
          setTimeout(() => {
            this.analyticsService
              .createAIUsageArtifacts(roomId, userId, 'text')
              .catch((err) => {
                this.logger.error(
                  `Failed to generate artifacts for ${roomId}: ${err.message}`,
                );
              });
          }, 1000);
        }

        const parsed = this.fastMcpService.cleanJsonResponse(response);
        return {
          ...parsed,
          tokenUsage: {
            promptTokens: usage.promptTokenCount,
            completionTokens: usage.candidatesTokenCount,
            totalTokens: usage.totalTokenCount,
          },
        };
      },
    );
  }

  // --- Public Methods (Delegate to Tools) ---

  async checkGrammar(requester: Requester, text: string): Promise<any> {
    return this.fastMcpService.callTool('sensei_check_grammar', {
      userId: requester.sub,
      text,
    });
  }

  async translate(
    requester: Requester,
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<any> {
    return this.fastMcpService.callTool('sensei_translate', {
      userId: requester.sub,
      text,
      sourceLanguage,
      targetLanguage,
    });
  }

  async createFlashcard(
    requester: Requester,
    topic: string,
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4',
  ): Promise<any> {
    return this.fastMcpService.callTool('sensei_create_flashcard', {
      userId: requester.sub,
      topic,
      level,
    });
  }

  async generatePracticeDrill(
    requester: Requester,
    type: 'grammar' | 'vocabulary' | 'kanji' | 'listening' | 'reading',
    topic: string,
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4',
    count: number = 5,
  ): Promise<any> {
    return this.fastMcpService.callTool('sensei_generate_drill', {
      userId: requester.sub,
      type,
      topic,
      level,
      count,
    });
  }

  async simulateConversation(
    requester: Requester,
    scenario:
      | 'restaurant'
      | 'shopping'
      | 'station'
      | 'office'
      | 'casual'
      | 'formal',
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4',
    turns: number = 4,
  ): Promise<any> {
    return this.fastMcpService.callTool('sensei_simulate_conversation', {
      userId: requester.sub,
      scenario,
      level,
      turns,
    });
  }

  async recommendResources(
    requester: Requester,
    topic: string,
    resourceType:
      | 'article'
      | 'video'
      | 'book'
      | 'app'
      | 'website'
      | 'all' = 'all',
    level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
  ): Promise<any> {
    return this.fastMcpService.callTool('sensei_recommend_resources', {
      userId: requester.sub,
      topic,
      resourceType,
      level,
    });
  }

  async chat(
    requester: Requester,
    message: string,
    history: any[] = [],
  ): Promise<any> {
    return this.fastMcpService.callTool('sensei_chat', {
      userId: requester.sub,
      message,
      history,
    });
  }

  async roleplay(
    requester: Requester,
    topic: string,
    message: string,
    history: any[] = [],
    isFinal: boolean = false,
  ): Promise<any> {
    return this.fastMcpService.callTool('sensei_roleplay', {
      userId: requester.sub,
      topic,
      message,
      history,
      isFinal,
    });
  }
}
