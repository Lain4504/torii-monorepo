import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SenseiAgentService } from './sensei-agent.service';

@Controller()
export class SenseiAgentController {
  private readonly logger = new Logger(SenseiAgentController.name);

  constructor(private readonly senseiService: SenseiAgentService) {}

  @MessagePattern({ cmd: 'ai.grammar.check' })
  async checkGrammar(data: { text: string }) {
    try {
      this.logger.log('AI Grammar check request received');
      const result = await this.senseiService.checkGrammar(data.text);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.grammar.check:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.translate' })
  async translate(data: { text: string; from: string; to: string }) {
    try {
      this.logger.log('AI Translate request received');
      const result = await this.senseiService.translate(data.text, data.from, data.to);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.translate:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.flashcard.create' })
  async createFlashcard(data: { word: string; meaning: string; example?: string }) {
    try {
      this.logger.log('AI Flashcard create request received');
      const result = await this.senseiService.createFlashcard(data.word, data.meaning, data.example);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.flashcard.create:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.drill.generate' })
  async generatePracticeDrill(data: { drillType: string; level: string; topic?: string }) {
    try {
      this.logger.log('AI Drill generate request received');
      const result = await this.senseiService.generatePracticeDrill(data.drillType, data.level, data.topic);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.drill.generate:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.conversation.simulate' })
  async simulateConversation(data: { topic: string; level: string }) {
    try {
      this.logger.log('AI Conversation simulate request received');
      const result = await this.senseiService.simulateConversation(data.topic, data.level);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.conversation.simulate:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.resources.recommend' })
  async recommendResources(data: { concept: string; level: string }) {
    try {
      this.logger.log('AI Resources recommend request received');
      const result = await this.senseiService.recommendResources(data.concept, data.level);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.resources.recommend:', error);
      throw error;
    }
  }
}
