import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SenseiAgentService } from '../../sensei-agent/sensei-agent.service';

@Controller('ai')
export class SenseiController {
  private readonly logger = new Logger(SenseiController.name);

  constructor(private readonly senseiService: SenseiAgentService) {}

  @Post('grammar-check')
  async checkGrammar(@Body() body: { text: string }) {
    this.logger.log(`Grammar check request for: ${body.text.substring(0, 50)}...`);
    return await this.senseiService.checkGrammar(body.text);
  }

  @Post('translate')
  async translate(@Body() body: { text: string; from: string; to: string }) {
    this.logger.log(`Translation request: ${body.from} -> ${body.to}`);
    return await this.senseiService.translate(body.text, body.from, body.to);
  }

  @Post('flashcard')
  async createFlashcard(@Body() body: { word: string; meaning: string; example?: string }) {
    this.logger.log(`Flashcard creation for: ${body.word}`);
    return await this.senseiService.createFlashcard(body.word, body.meaning, body.example);
  }

  @Post('drill/generate')
  async generatePracticeDrill(@Body() body: { drillType: string; level: string; topic?: string }) {
    this.logger.log(`Practice drill generation: ${body.drillType} for JLPT ${body.level}`);
    return await this.senseiService.generatePracticeDrill(body.drillType, body.level, body.topic);
  }

  @Post('conversation/simulate')
  async simulateConversation(@Body() body: { topic: string; level: string }) {
    this.logger.log(`Conversation simulation: ${body.topic} for JLPT ${body.level}`);
    return await this.senseiService.simulateConversation(body.topic, body.level);
  }

  @Post('resources/recommend')
  async recommendResources(@Body() body: { concept: string; level: string }) {
    this.logger.log(`Resource recommendation for: ${body.concept} at JLPT ${body.level}`);
    return await this.senseiService.recommendResources(body.concept, body.level);
  }
}
