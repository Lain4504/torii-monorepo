import { Controller, Post, Body, Logger } from '@nestjs/common';
import { FastMcpService } from '../fastmcp/fastmcp.service';
import {
  GrammarCheckDto,
  TranslateDto,
  CreateFlashcardDto,
  GenerateDrillDto,
  SimulateConversationDto,
  RecommendResourcesDto,
} from '../dtos/sensei.dto';

/**
 * Sensei Controller
 * 
 * Architecture Flow:
 * Client → SenseiController → FastMcpService (Agent Brain) → Gemini API
 * 
 * Responsibilities:
 * 1. Handle HTTP requests
 * 2. Validate input (DTO)
 * 3. Call FastMCP agent
 * 4. Save history to database (optional)
 * 5. Return response to client
 */
@Controller('agents')
export class SenseiController {
  private readonly logger = new Logger(SenseiController.name);

  constructor(
    private readonly fastMcpService: FastMcpService,
  ) {}

  @Post('grammar-check')
  async checkGrammar(@Body() body: GrammarCheckDto) {
    this.logger.log(
      `📝 Grammar check request for: ${body.text.substring(0, 50)}...`,
    );
    
    const result = await this.fastMcpService.checkGrammar(
      body.userId,
      body.text
    );
    
    // TODO: Save to history
    
    return result;
  }

  @Post('translate')
  async translate(@Body() body: TranslateDto) {
    this.logger.log(`🌐 Translation request: ${body.from} → ${body.to}`);
    
    const result = await this.fastMcpService.translate(
      body.userId,
      body.text,
      body.from,
      body.to
    );
    
    // TODO: Save to history
    
    return result;
  }

  @Post('flashcard')
  async createFlashcard(@Body() body: CreateFlashcardDto) {
    this.logger.log(`📇 Flashcard creation for: ${body.word}`);
    
    const flashcard = await this.fastMcpService.createFlashcard(
      body.userId,
      body.word,
      'intermediate' // TODO: Get from user level
    );
    
    // TODO: Save flashcard to database
    
    return flashcard;
  }

  @Post('drill/generate')
  async generatePracticeDrill(@Body() body: GenerateDrillDto) {
    this.logger.log(
      `🎯 Practice drill generation: ${body.drillType} for JLPT ${body.level}`,
    );
    
    const drill = await this.fastMcpService.generatePracticeDrill(
      body.userId,
      body.drillType as any,
      body.topic || 'general',
      body.level as any,
      5 // count
    );
    
    return drill;
  }

  @Post('conversation/simulate')
  async simulateConversation(@Body() body: SimulateConversationDto) {
    const topic = body.topic || body.scenario || 'general';
    const level = body.level || body.difficulty || 'N5';
    
    this.logger.log(
      `💬 Conversation simulation: ${topic} for JLPT ${level}`,
    );
    
    const conversation = await this.fastMcpService.simulateConversation(
      body.userId,
      topic as any,
      'intermediate',
      4 // turns
    );
    
    return conversation;
  }

  @Post('resources/recommend')
  async recommendResources(@Body() body: RecommendResourcesDto) {
    const concept = body.concept || body.topic || 'general';
    
    this.logger.log(
      `📚 Resource recommendation for: ${concept} at JLPT ${body.level}`,
    );
    
    const resources = await this.fastMcpService.recommendResources(
      body.userId,
      concept,
      'all'
    );
    
    return resources;
  }
}
