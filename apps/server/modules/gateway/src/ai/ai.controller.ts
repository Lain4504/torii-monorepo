import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '@server/shared';

@ApiTags('AI Service')
@Controller('api/ai')
// @UseGuards(JwtAuthGuard) // Temporarily disabled for Postman testing
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  // Sensei Agent Endpoints
  @Post('grammar-check')
  @ApiOperation({ summary: 'Check Japanese grammar' })
  @ApiResponse({ status: 200, description: 'Grammar analysis result' })
  async checkGrammar(@Body() body: { text: string }) {
    try {
      this.logger.log(`Grammar check request for: ${body.text.substring(0, 50)}...`);
      const result = await this.aiService.checkGrammar(body.text);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Grammar check failed:', error);
      throw new HttpException(
        { message: 'Grammar check failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('translate')
  @ApiOperation({ summary: 'Translate text between languages' })
  @ApiResponse({ status: 200, description: 'Translation result' })
  async translate(@Body() body: { text: string; from: string; to: string }) {
    try {
      this.logger.log(`Translation request: ${body.from} -> ${body.to}`);
      const result = await this.aiService.translate(body.text, body.from, body.to);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Translation failed:', error);
      throw new HttpException(
        { message: 'Translation failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('flashcard')
  @ApiOperation({ summary: 'Create a flashcard for vocabulary' })
  @ApiResponse({ status: 200, description: 'Flashcard creation result' })
  async createFlashcard(@Body() body: { word: string; meaning: string; example?: string }) {
    try {
      this.logger.log(`Flashcard creation for: ${body.word}`);
      const result = await this.aiService.createFlashcard(body.word, body.meaning, body.example);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Flashcard creation failed:', error);
      throw new HttpException(
        { message: 'Flashcard creation failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Assessment Agent Endpoints
  @Post('test/generate')
  @ApiOperation({ summary: 'Generate JLPT test' })
  @ApiResponse({ status: 200, description: 'Test generation result' })
  async generateTest(@Body() body: { level: string; type: string; questionCount: number }) {
    try {
      this.logger.log(`Test generation: JLPT ${body.level} ${body.type} (${body.questionCount} questions)`);
      const result = await this.aiService.generateJLPTTest(body.level, body.type, body.questionCount);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Test generation failed:', error);
      throw new HttpException(
        { message: 'Test generation failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('test/evaluate')
  @ApiOperation({ summary: 'Evaluate test answers' })
  @ApiResponse({ status: 200, description: 'Test evaluation result' })
  async evaluateTest(@Body() body: { testId: string; answers: any }) {
    try {
      this.logger.log(`Test evaluation for: ${body.testId}`);
      const result = await this.aiService.evaluateTest(body.testId, body.answers);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Test evaluation failed:', error);
      throw new HttpException(
        { message: 'Test evaluation failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Analytics Agent Endpoints
  @Post('progress/track')
  @ApiOperation({ summary: 'Track learning progress' })
  @ApiResponse({ status: 200, description: 'Progress tracking result' })
  async trackProgress(@Body() body: { userId: string; activity: string; score?: number }) {
    try {
      this.logger.log(`Progress tracking for user: ${body.userId}, activity: ${body.activity}`);
      const result = await this.aiService.trackProgress(body.userId, body.activity, body.score);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Progress tracking failed:', error);
      throw new HttpException(
        { message: 'Progress tracking failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('path/suggest')
  @ApiOperation({ summary: 'Suggest personalized study path' })
  @ApiResponse({ status: 200, description: 'Study path suggestion result' })
  async suggestStudyPath(@Body() body: { userId: string }) {
    try {
      this.logger.log(`Study path suggestion for user: ${body.userId}`);
      const result = await this.aiService.suggestStudyPath(body.userId);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Study path suggestion failed:', error);
      throw new HttpException(
        { message: 'Study path suggestion failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private formatResponse(result: any) {
    if (Array.isArray(result.content)) {
      // Extract text content from MCP response
      const textContent = result.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');

      return {
        success: true,
        data: textContent,
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
  }
}
