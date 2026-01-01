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

  @Post('drill/generate')
  @ApiOperation({ summary: 'Generate practice drill' })
  @ApiResponse({ status: 200, description: 'Practice drill generation result' })
  async generatePracticeDrill(@Body() body: { drillType: string; level: string; topic?: string }) {
    try {
      this.logger.log(`Practice drill generation: ${body.drillType} for JLPT ${body.level}`);
      const result = await this.aiService.generatePracticeDrill(body.drillType, body.level, body.topic);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Practice drill generation failed:', error);
      throw new HttpException(
        { message: 'Practice drill generation failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('conversation/simulate')
  @ApiOperation({ summary: 'Simulate conversation' })
  @ApiResponse({ status: 200, description: 'Conversation simulation result' })
  async simulateConversation(@Body() body: { topic: string; level: string }) {
    try {
      this.logger.log(`Conversation simulation: ${body.topic} for JLPT ${body.level}`);
      const result = await this.aiService.simulateConversation(body.topic, body.level);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Conversation simulation failed:', error);
      throw new HttpException(
        { message: 'Conversation simulation failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('resources/recommend')
  @ApiOperation({ summary: 'Recommend learning resources' })
  @ApiResponse({ status: 200, description: 'Resource recommendation result' })
  async recommendResources(@Body() body: { concept: string; level: string }) {
    try {
      this.logger.log(`Resource recommendation for: ${body.concept} at JLPT ${body.level}`);
      const result = await this.aiService.recommendResources(body.concept, body.level);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Resource recommendation failed:', error);
      throw new HttpException(
        { message: 'Resource recommendation failed', error: error.message },
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

  @Post('benchmark/get')
  @ApiOperation({ summary: 'Get progress benchmark' })
  @ApiResponse({ status: 200, description: 'Progress benchmark result' })
  async getProgressBenchmark(@Body() body: { userId: string; level: string }) {
    try {
      this.logger.log(`Progress benchmark for user: ${body.userId} at JLPT ${body.level}`);
      const result = await this.aiService.getProgressBenchmark(body.userId, body.level);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Progress benchmark failed:', error);
      throw new HttpException(
        { message: 'Progress benchmark failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('test/schedule')
  @ApiOperation({ summary: 'Schedule a practice test' })
  @ApiResponse({ status: 200, description: 'Test scheduling result' })
  async scheduleTest(@Body() body: { userId: string; level: string; date: string }) {
    try {
      this.logger.log(`Test scheduling for user: ${body.userId} at JLPT ${body.level} on ${body.date}`);
      const result = await this.aiService.scheduleTest(body.userId, body.level, body.date);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Test scheduling failed:', error);
      throw new HttpException(
        { message: 'Test scheduling failed', error: error.message },
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

  @Post('weaknesses/identify')
  @ApiOperation({ summary: 'Identify learning weaknesses' })
  @ApiResponse({ status: 200, description: 'Weakness identification result' })
  async identifyWeaknesses(@Body() body: { userId: string }) {
    try {
      this.logger.log(`Weakness identification for user: ${body.userId}`);
      const result = await this.aiService.identifyWeaknesses(body.userId);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Weakness identification failed:', error);
      throw new HttpException(
        { message: 'Weakness identification failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('readiness/predict')
  @ApiOperation({ summary: 'Predict JLPT readiness' })
  @ApiResponse({ status: 200, description: 'Readiness prediction result' })
  async predictReadiness(@Body() body: { userId: string; level: string }) {
    try {
      this.logger.log(`Readiness prediction for user: ${body.userId} at JLPT ${body.level}`);
      const result = await this.aiService.predictReadiness(body.userId, body.level);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Readiness prediction failed:', error);
      throw new HttpException(
        { message: 'Readiness prediction failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('report/generate')
  @ApiOperation({ summary: 'Generate progress report' })
  @ApiResponse({ status: 200, description: 'Report generation result' })
  async generateReport(@Body() body: { userId: string; reportType: string }) {
    try {
      this.logger.log(`Report generation for user: ${body.userId}, type: ${body.reportType}`);
      const result = await this.aiService.generateReport(body.userId, body.reportType);
      return this.formatResponse(result);
    } catch (error) {
      this.logger.error('Report generation failed:', error);
      throw new HttpException(
        { message: 'Report generation failed', error: error.message },
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
