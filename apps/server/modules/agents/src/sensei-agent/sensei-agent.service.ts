import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AiTemplateService, AiExecutionResult } from '../shared/ai-template.service';
import { FlashcardSchema, TranslateInputSchema, FlashcardInputSchema } from '../shared/interfaces/template.interface';

@Injectable()
export class SenseiAgentService implements OnModuleInit {
  constructor(private readonly aiTemplateService: AiTemplateService) {}

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

  async checkGrammar(text: string): Promise<string> {
    const result = await this.aiTemplateService.executeTemplate<string>(
      'sensei.grammar-check',
      { text },
    );
    if (this.isExecutionResult(result) && !result.success) {
      throw new Error(result.error || 'AI execution failed');
    }
    return this.isExecutionResult(result) ? (result.data as string) : (result as string);
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    const result = await this.aiTemplateService.executeTemplate<string>('sensei.translate', {
      text,
      from,
      to,
    });
    if (this.isExecutionResult(result) && !result.success) {
      throw new Error(result.error || 'AI execution failed');
    }
    return this.isExecutionResult(result) ? (result.data as string) : (result as string);
  }

  async createFlashcard(
    word: string,
    meaning: string,
    example?: string,
  ): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'sensei.flashcard',
      { word, meaning, example },
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
    topic?: string,
  ): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'sensei.practice-drill',
      { drillType, level, topic },
    );
    if (this.isExecutionResult(result) && !result.success) {
      throw new Error(result.error || 'AI execution failed');
    }
    return this.isExecutionResult(result) ? result.data : result;
  }

  async simulateConversation(topic: string, level: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'sensei.conversation-simulate',
      { topic, level },
    );
    if (this.isExecutionResult(result) && !result.success) {
      throw new Error(result.error || 'AI execution failed');
    }
    return this.isExecutionResult(result) ? result.data : result;
  }

  async recommendResources(concept: string, level: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate(
      'sensei.resource-recommend',
      { concept, level },
    );
    if (this.isExecutionResult(result) && !result.success) {
      throw new Error(result.error || 'AI execution failed');
    }
    return this.isExecutionResult(result) ? result.data : result;
  }

  private isExecutionResult(obj: any): obj is AiExecutionResult {
    return obj && typeof obj === 'object' && 'success' in obj;
  }
}
