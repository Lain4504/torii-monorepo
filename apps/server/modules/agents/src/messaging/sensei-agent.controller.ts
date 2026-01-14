import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { ISenseiAgentService } from '../interfaces/services';
import { SENSEI_AGENT_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Sensei Agent NATS Message Handler
 * Handles inter-service communication for AI tutoring operations
 *
 * @example
 * // From other service:
 * this.natsClient.send('agents.ai.grammar.check', { text }).toPromise();
 */
@Controller()
export class SenseiAgentController {
  private readonly logger = new Logger(SenseiAgentController.name);

  constructor(
    @Inject(SENSEI_AGENT_SERVICE_TOKEN)
    private readonly senseiService: ISenseiAgentService,
  ) {
    this.logger.log('SenseiAgentController instantiated');
  }

  /**
   * Check grammar for Japanese text
   * Pattern: agents.ai.grammar.check
   */
  @MessagePattern('agents.ai.grammar.check')
  async checkGrammar(@Payload() data: { text: string; userId: string }) {
    try {
      this.logger.log('AI Grammar check request received');
      console.log('Received grammar check request for:', data.text);
      const result = await this.senseiService.checkGrammar(data.text, data.userId);
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.ai.grammar.check:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Translate text between languages
   * Pattern: agents.ai.translate
   */
  @MessagePattern('agents.ai.translate')
  async translate(@Payload() data: { text: string; from: string; to: string; userId: string }) {
    try {
      this.logger.log('AI Translate request received');
      const result = await this.senseiService.translate(
        data.text,
        data.from,
        data.to,
        data.userId,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.ai.translate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create AI-generated flashcard
   * Pattern: agents.ai.flashcard.create
   */
  @MessagePattern('agents.ai.flashcard.create')
  async createFlashcard(
    @Payload() data: { word: string; meaning: string; example?: string; userId: string },
  ) {
    try {
      this.logger.log('AI Flashcard create request received');
      const result = await this.senseiService.createFlashcard(
        data.word,
        data.meaning,
        data.example,
        data.userId,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.ai.flashcard.create:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate practice drill
   * Pattern: agents.ai.drill.generate
   */
  @MessagePattern('agents.ai.drill.generate')
  async generatePracticeDrill(
    @Payload() data: { drillType: string; level: string; topic?: string; userId: string },
  ) {
    try {
      this.logger.log('AI Drill generate request received');
      const result = await this.senseiService.generatePracticeDrill(
        data.drillType,
        data.level,
        data.topic,
        data.userId,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.ai.drill.generate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Simulate conversation practice
   * Pattern: agents.ai.conversation.simulate
   */
  @MessagePattern('agents.ai.conversation.simulate')
  async simulateConversation(
    @Payload() data: { scenario: string; level: string; userId: string },
  ) {
    try {
      this.logger.log('AI Conversation simulate request received');
      const result = await this.senseiService.simulateConversation(
        data.scenario,
        data.level,
        data.userId,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.ai.conversation.simulate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Recommend learning resources
   * Pattern: agents.ai.resources.recommend
   */
  @MessagePattern('agents.ai.resources.recommend')
  async recommendResources(
    @Payload() data: { topic: string; level: string; userId: string },
  ) {
    try {
      this.logger.log('AI Resources recommend request received');
      const result = await this.senseiService.recommendResources(
        data.topic,
        data.level,
        data.userId,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.ai.resources.recommend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
