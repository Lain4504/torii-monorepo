import { Injectable } from '@nestjs/common';
import { AiTemplateService } from '../shared/ai-template.service';

@Injectable()
export class SenseiAgentService {
  constructor(private readonly aiTemplateService: AiTemplateService) {}

  async checkGrammar(text: string): Promise<string> {
    return await this.aiTemplateService.executeTemplate('sensei.grammar-check', { text });
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    return await this.aiTemplateService.executeTemplate('sensei.translate', { text, from, to });
  }

  async createFlashcard(word: string, meaning: string, example?: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate('sensei.flashcard', { word, meaning, example });
    
    if (result.rawResponse) {
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
      ...result,
      created: new Date(),
    };
  }

  async generatePracticeDrill(drillType: string, level: string, topic?: string): Promise<any> {
    return await this.aiTemplateService.executeTemplate('sensei.practice-drill', { drillType, level, topic });
  }

  async simulateConversation(topic: string, level: string): Promise<any> {
    return await this.aiTemplateService.executeTemplate('sensei.conversation-simulate', { topic, level });
  }

  async recommendResources(concept: string, level: string): Promise<any> {
    return await this.aiTemplateService.executeTemplate('sensei.resource-recommend', { concept, level });
  }
}
