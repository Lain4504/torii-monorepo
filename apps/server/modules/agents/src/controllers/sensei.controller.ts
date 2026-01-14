import { Controller, Post, Body, Logger, Inject } from '@nestjs/common';
import { SenseiAgentService } from '../sensei-agent/sensei-agent.service';
import {
  GrammarCheckDto,
  TranslateDto,
  CreateFlashcardDto,
  GenerateDrillDto,
  SimulateConversationDto,
  RecommendResourcesDto,
} from '../dtos/sensei.dto';
import type { ISenseiAgentService } from '../interfaces/services';
import { SENSEI_AGENT_SERVICE_TOKEN } from '../interfaces/services';

@Controller('agents')
export class SenseiController {
  private readonly logger = new Logger(SenseiController.name);

  constructor(
    @Inject(SENSEI_AGENT_SERVICE_TOKEN)
    private readonly senseiService: ISenseiAgentService,
  ) {}

  @Post('grammar-check')
  async checkGrammar(@Body() body: GrammarCheckDto) {
    this.logger.log(
      `Grammar check request for: ${body.text.substring(0, 50)}...`,
    );
    return await this.senseiService.checkGrammar(body.text, body.userId);
  }

  @Post('translate')
  async translate(@Body() body: TranslateDto) {
    this.logger.log(`Translation request: ${body.from} -> ${body.to}`);
    return await this.senseiService.translate(body.text, body.from, body.to, body.userId);
  }

  @Post('flashcard')
  async createFlashcard(@Body() body: CreateFlashcardDto) {
    this.logger.log(`Flashcard creation for: ${body.word}`);
    return await this.senseiService.createFlashcard(
      body.word,
      body.meaning,
      body.example,
      body.userId,
    );
  }

  @Post('drill/generate')
  async generatePracticeDrill(@Body() body: GenerateDrillDto) {
    this.logger.log(
      `Practice drill generation: ${body.drillType} for JLPT ${body.level}`,
    );
    return await this.senseiService.generatePracticeDrill(
      body.drillType,
      body.level,
      body.topic,
      body.userId,
    );
  }

  @Post('conversation/simulate')
  async simulateConversation(@Body() body: SimulateConversationDto) {
    this.logger.log(
      `Conversation simulation: ${body.topic} for JLPT ${body.level}`,
    );
    return await this.senseiService.simulateConversation(
      body.topic,
      body.level,
      body.userId,
    );
  }

  @Post('resources/recommend')
  async recommendResources(@Body() body: RecommendResourcesDto) {
    this.logger.log(
      `Resource recommendation for: ${body.concept} at JLPT ${body.level}`,
    );
    return await this.senseiService.recommendResources(
      body.concept,
      body.level,
      body.userId,
    );
  }
}
