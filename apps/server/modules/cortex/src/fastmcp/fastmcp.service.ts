import { Injectable, OnModuleInit } from '@nestjs/common';
import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { SenseiAgentService } from '../sensei-agent/sensei-agent.service';
import { AssessmentAgentService } from '../assessment-agent/assessment-agent.service';
import { AnalyticsAgentService } from '../analytics-agent/analytics-agent.service';

@Injectable()
export class FastMcpService implements OnModuleInit {
  private server: FastMCP;

  constructor(
    private readonly senseiService: SenseiAgentService,
    private readonly assessmentService: AssessmentAgentService,
    private readonly analyticsService: AnalyticsAgentService,
  ) {}

  onModuleInit() {
    this.initializeServer();
  }

  private initializeServer() {
    this.server = new FastMCP({
      name: 'ai-learning-support',
      version: '1.0.0',
    });

    this.addSenseiTools();
    this.addAssessmentTools();
    this.addAnalyticsTools();

    // Start the server
    this.server.start();
  }

  private addSenseiTools() {
    // Sensei Agent: Grammar, Translation, Flashcards
    this.server.addTool({
      name: 'sensei_grammar_check',
      description: 'Check grammar in Japanese text',
      parameters: z.object({
        text: z.string(),
      }),
      execute: async ({ text }) => {
        return await this.senseiService.checkGrammar(text);
      },
    });

    this.server.addTool({
      name: 'sensei_translate',
      description: 'Translate text between Japanese and English',
      parameters: z.object({
        text: z.string(),
        from: z.enum(['ja', 'en']),
        to: z.enum(['ja', 'en']),
      }),
      execute: async ({ text, from, to }) => {
        return await this.senseiService.translate(text, from, to);
      },
    });

    this.server.addTool({
      name: 'sensei_create_flashcard',
      description: 'Create a flashcard for vocabulary learning',
      parameters: z.object({
        word: z.string(),
        meaning: z.string(),
        example: z.string().optional(),
      }),
      execute: async ({ word, meaning, example }) => {
        const flashcard = await this.senseiService.createFlashcard(word, meaning, example);
        return `Flashcard created: ${JSON.stringify(flashcard)}`;
      },
    });
  }

  private addAssessmentTools() {
    // Assessment Agent: Generate and evaluate JLPT-style tests
    this.server.addTool({
      name: 'assessment_generate_jlpt_test',
      description: 'Generate a JLPT-style test',
      parameters: z.object({
        level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
        type: z.enum(['vocabulary', 'grammar', 'reading', 'listening']),
        questionCount: z.number().min(1).max(50),
      }),
      execute: async ({ level, type, questionCount }) => {
        const test = await this.assessmentService.generateJlptTest(level, type, questionCount);
        return `Test generated: ${JSON.stringify(test)}`;
      },
    });

    this.server.addTool({
      name: 'assessment_evaluate_test',
      description: 'Evaluate answers for a JLPT-style test',
      parameters: z.object({
        testId: z.string(),
        answers: z.record(z.string()),
      }),
      execute: async ({ testId, answers }) => {
        const result = await this.assessmentService.evaluateTest(testId, answers);
        return `Evaluation result: ${JSON.stringify(result)}`;
      },
    });
  }

  private addAnalyticsTools() {
    // Analytics Agent: Track progress and suggest study paths
    this.server.addTool({
      name: 'analytics_track_progress',
      description: 'Track user learning progress',
      parameters: z.object({
        userId: z.string(),
        activity: z.string(),
        score: z.number().optional(),
      }),
      execute: async ({ userId, activity, score }) => {
        const progress = await this.analyticsService.trackProgress(userId, activity, score);
        return `Progress tracked: ${JSON.stringify(progress)}`;
      },
    });

    this.server.addTool({
      name: 'analytics_suggest_path',
      description: 'Suggest personalized study path',
      parameters: z.object({
        userId: z.string(),
      }),
      execute: async ({ userId }) => {
        const suggestion = await this.analyticsService.suggestStudyPath(userId);
        return `Study path suggestion: ${JSON.stringify(suggestion)}`;
      },
    });
  }
}
