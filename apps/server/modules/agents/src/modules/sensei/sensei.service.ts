import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FastMcpService } from '../../fastmcp/fastmcp.service';
import { z } from 'zod';

@Injectable()
export class SenseiService implements OnModuleInit {
    private readonly logger = new Logger(SenseiService.name);

    constructor(private readonly fastMcpService: FastMcpService) { }

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
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
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
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
            }
        );

        // 3. Create Flashcard
        this.fastMcpService.addTool(
            'sensei_create_flashcard',
            'Create a vocabulary flashcard',
            z.object({
                userId: z.string(),
                topic: z.string(),
                difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
            }),
            async ({ userId, topic, difficulty }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('sensei/flashcard-creation.md');
                const prompt = template({ topic, difficulty, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
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
                difficulty: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).default('N4'),
                count: z.number().default(5),
            }),
            async ({ userId, type, topic, difficulty, count }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('sensei/practice-drill.md');
                const prompt = template({ type, topic, difficulty, count, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
            }
        );

        // 5. Simulate Conversation
        this.fastMcpService.addTool(
            'sensei_simulate_conversation',
            'Simulate a conversation scenario',
            z.object({
                userId: z.string(),
                scenario: z.enum(['restaurant', 'shopping', 'station', 'office', 'casual', 'formal']),
                difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
                turns: z.number().default(4),
            }),
            async ({ userId, scenario, difficulty, turns }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('sensei/conversation-simulation.md');
                const prompt = template({ scenario, difficulty, turns, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
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
            }),
            async ({ userId, topic, resourceType }) => {
                const userContext = await this.fastMcpService.getUserContext(userId);
                const template = this.fastMcpService.loadPromptTemplate('sensei/resource-recommendation.md');
                const prompt = template({ topic, resourceType, userContext, timestamp: new Date().toISOString() });
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
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
                const response = await this.fastMcpService.callGemini(prompt);
                return this.fastMcpService.cleanJsonResponse(response);
            }
        );
    }

    // --- Public Methods (Delegate to Tools) ---

    async checkGrammar(userId: string, text: string): Promise<any> {
        return this.fastMcpService.callTool('sensei_check_grammar', { userId, text });
    }

    async translate(userId: string, text: string, sourceLanguage: string, targetLanguage: string): Promise<any> {
        return this.fastMcpService.callTool('sensei_translate', { userId, text, sourceLanguage, targetLanguage });
    }

    async createFlashcard(userId: string, topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<any> {
        return this.fastMcpService.callTool('sensei_create_flashcard', { userId, topic, difficulty });
    }

    async generatePracticeDrill(
        userId: string,
        type: 'grammar' | 'vocabulary' | 'kanji' | 'listening' | 'reading',
        topic: string,
        difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4',
        count: number = 5,
    ): Promise<any> {
        return this.fastMcpService.callTool('sensei_generate_drill', { userId, type, topic, difficulty, count });
    }

    async simulateConversation(
        userId: string,
        scenario: 'restaurant' | 'shopping' | 'station' | 'office' | 'casual' | 'formal',
        difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
        turns: number = 4,
    ): Promise<any> {
        return this.fastMcpService.callTool('sensei_simulate_conversation', { userId, scenario, difficulty, turns });
    }

    async recommendResources(
        userId: string,
        topic: string,
        resourceType: 'article' | 'video' | 'book' | 'app' | 'website' | 'all' = 'all',
    ): Promise<any> {
        return this.fastMcpService.callTool('sensei_recommend_resources', { userId, topic, resourceType });
    }

    async chat(userId: string, message: string, history: any[] = []): Promise<any> {
        return this.fastMcpService.callTool('sensei_chat', { userId, message, history });
    }
}
