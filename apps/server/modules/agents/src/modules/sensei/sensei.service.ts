import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
// Triggering reload for schema update
import { FastMcpService } from '../../fastmcp/fastmcp.service';
import { ClientProxy } from '@nestjs/microservices';
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

import { PrismaService } from '@server/shared';

@Injectable()
export class SenseiService implements OnModuleInit {
    private readonly logger = new Logger(SenseiService.name);

    constructor(
        private readonly fastMcpService: FastMcpService,
        private readonly prisma: PrismaService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

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
                const template = this.fastMcpService.loadPromptTemplate('sensei/grammar-check.md');
                const prompt = template({ text, userContext, timestamp: new Date().toISOString() });
                return this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentGrammarCheckResponseSchema,
                    { maxRetries: 1 },
                );
            }
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
                const template = this.fastMcpService.loadPromptTemplate('sensei/translation.md');
                const prompt = template({ text, sourceLanguage, targetLanguage, userContext, timestamp: new Date().toISOString() });
                return this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentTranslateResponseSchema,
                    { maxRetries: 1 },
                );
            }
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
                const template = this.fastMcpService.loadPromptTemplate('sensei/flashcard-creation.md');
                const prompt = template({ topic, level, userContext, timestamp: new Date().toISOString() });
                return this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentFlashcardResponseSchema,
                    { maxRetries: 1 },
                );
            }
        );

        // 4. Practice Drill
        this.fastMcpService.addTool(
            'sensei_generate_drill',
            'Generate practice drills',
            z.object({
                userId: z.string(),
                type: z.enum(['grammar', 'vocabulary', 'kanji', 'listening', 'reading']),
                topic: z.string(),
                level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).default('N4'),
                count: z.number().default(5),
            }),
            async ({ userId, type, topic, level, count }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('sensei/practice-drill.md');
                const prompt = template({ type, topic, level, count, userContext, timestamp: new Date().toISOString() });
                return this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentDrillResponseSchema,
                    { maxRetries: 1 },
                );
            }
        );

        // 5. Simulate Conversation
        this.fastMcpService.addTool(
            'sensei_simulate_conversation',
            'Simulate a conversation scenario',
            z.object({
                userId: z.string(),
                scenario: z.enum(['restaurant', 'shopping', 'station', 'office', 'casual', 'formal']),
                level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).default('N4'),
                turns: z.number().default(4),
            }),
            async ({ userId, scenario, level, turns }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('sensei/conversation-simulation.md');
                const prompt = template({ scenario, level, turns, userContext, timestamp: new Date().toISOString() });
                return this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentConversationSimulationResponseSchema,
                    { maxRetries: 1 },
                );
            }
        );

        // 6. Recommend Resources
        this.fastMcpService.addTool(
            'sensei_recommend_resources',
            'Recommend learning resources',
            z.object({
                userId: z.string(),
                topic: z.string(),
                resourceType: z.enum(['article', 'video', 'book', 'app', 'website', 'all']).default('all'),
                level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional(),
            }),
            async ({ userId, topic, resourceType, level }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);

                // Hybrid Search: Fetch candidates from DB (Courses & Lessons)
                const courses = await this.prisma.course.findMany({
                    where: {
                        ...(level ? { jlptLevel: level } : {}),
                        OR: [
                            { title: { contains: topic, mode: 'insensitive' } },
                            { description: { contains: topic, mode: 'insensitive' } }
                        ],
                        status: 'published'
                    },
                    take: 5,
                    select: { id: true, title: true, description: true, jlptLevel: true }
                });

                const lessons = await this.prisma.lesson.findMany({
                    where: {
                        title: { contains: topic, mode: 'insensitive' },
                        status: 'published',
                        module: {
                            course: {
                                ...(level ? { jlptLevel: level } : {})
                            }
                        }
                    },
                    take: 5,
                    select: { id: true, title: true, module: { select: { course: { select: { id: true, title: true } } } } }
                });

                const candidates = [
                    ...courses.map(c => ({
                        title: c.title,
                        type: 'Course',
                        level: c.jlptLevel,
                        url: `/courses/${c.id}`,
                        description: c.description || 'Comprehensive course'
                    })),
                    ...lessons.map(l => ({
                        title: l.title,
                        type: 'Lesson',
                        level: level || 'N/A',
                        url: `/learning/${l.module.course.id}/lesson/${l.id}`,
                        description: `Lesson in course: ${l.module.course.title}`
                    }))
                ];

                const template = this.fastMcpService.loadPromptTemplate('sensei/resource-recommendation.md');
                const prompt = template({
                    topic,
                    resourceType,
                    level,
                    userContext,
                    candidates: JSON.stringify(candidates, null, 2),
                    timestamp: new Date().toISOString()
                });

                return this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentResourceRecommendationResponseSchema,
                    { maxRetries: 1 },
                );
            }
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
                const template = this.fastMcpService.loadPromptTemplate('sensei/chat.md');
                const prompt = template({ message, history, userContext, timestamp: new Date().toISOString() });
                return this.fastMcpService.callGeminiWithSchema(
                    prompt,
                    AgentChatResponseSchema,
                    { maxRetries: 1 },
                );
            }
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
                const template = this.fastMcpService.loadPromptTemplate('sensei/roleplay.md');
                // Calculate turns based on history length (each interaction is 2 turns: user + ai)
                // Actually history usually contains previous messages.
                const prompt = template({ topic, message, history, isFinal, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
            }
        );
    }

    // --- Public Methods (Delegate to Tools) ---

    async checkGrammar(requester: Requester, text: string): Promise<any> {
        return this.fastMcpService.callTool('sensei_check_grammar', { userId: requester.sub, text });
    }

    async translate(requester: Requester, text: string, sourceLanguage: string, targetLanguage: string): Promise<any> {
        return this.fastMcpService.callTool('sensei_translate', { userId: requester.sub, text, sourceLanguage, targetLanguage });
    }

    async createFlashcard(requester: Requester, topic: string, level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4'): Promise<any> {
        return this.fastMcpService.callTool('sensei_create_flashcard', { userId: requester.sub, topic, level });
    }

    async generatePracticeDrill(
        requester: Requester,
        type: 'grammar' | 'vocabulary' | 'kanji' | 'listening' | 'reading',
        topic: string,
        level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4',
        count: number = 5,
    ): Promise<any> {
        return this.fastMcpService.callTool('sensei_generate_drill', { userId: requester.sub, type, topic, level, count });
    }

    async simulateConversation(
        requester: Requester,
        scenario: 'restaurant' | 'shopping' | 'station' | 'office' | 'casual' | 'formal',
        level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4',
        turns: number = 4,
    ): Promise<any> {
        return this.fastMcpService.callTool('sensei_simulate_conversation', { userId: requester.sub, scenario, level, turns });
    }

    async recommendResources(
        requester: Requester,
        topic: string,
        resourceType: 'article' | 'video' | 'book' | 'app' | 'website' | 'all' = 'all',
        level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
    ): Promise<any> {
        return this.fastMcpService.callTool('sensei_recommend_resources', { userId: requester.sub, topic, resourceType, level });
    }

    async chat(requester: Requester, message: string, history: any[] = []): Promise<any> {
        return this.fastMcpService.callTool('sensei_chat', { userId: requester.sub, message, history });
    }

    async roleplay(requester: Requester, topic: string, message: string, history: any[] = [], isFinal: boolean = false): Promise<any> {
        return this.fastMcpService.callTool('sensei_roleplay', { userId: requester.sub, topic, message, history, isFinal });
    }
}
