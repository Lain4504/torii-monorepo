import { Controller, Post, Body, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { FastMcpService } from '../fastmcp/fastmcp.service';
import {
  GenerateTestDto,
  EvaluateTestDto,
  GetBenchmarkDto,
  ScheduleTestDto,
} from '../dtos/assessment.dto';

/**
 * Assessment Controller
 * 
 * Architecture Flow:
 * Client → AssessmentController → FastMcpService (Agent Brain) → Gemini API
 */
@Controller('agents')
export class AssessmentController {
  private readonly logger = new Logger(AssessmentController.name);

  constructor(
    private readonly fastMcpService: FastMcpService,
  ) {}

  @Post('test/generate')
  async generateTest(@Body() body: GenerateTestDto) {
    this.logger.log(
      `📝 Test generation: JLPT ${body.level} ${body.type} (${body.questionCount} questions)`,
    );
    
    const test = await this.fastMcpService.generateJlptTest(
      body.userId,
      body.level as any,
      body.type as any,
      body.questionCount
    );
    
    // TODO: Save test to database with correct answers
    
    return test;
  }

  @Post('test/evaluate')
  async evaluateTest(@Body() body: EvaluateTestDto) {
    this.logger.log(`✅ Test evaluation for: ${body.testId}`);
    
    const evaluation = await this.fastMcpService.evaluateTest(
      body.userId,
      body.testId,
      body.answers as any
    );
    
    // TODO: Save evaluation results to database
    
    return evaluation;
  }

  @Post('assessment/benchmark')
  @UsePipes(new ValidationPipe({ skipMissingProperties: true, whitelist: false }))
  async getProgressBenchmark(@Body() body: any) {
    this.logger.log(`📊 Raw body received: ${JSON.stringify(body)}`);
    
    // Extract level from either field and normalize
    let level = body.level || body.targetLevel || 'N5';
    
    // If targetLevel is provided, extract the JLPT level (e.g., "N5" from "N5")
    if (!body.level && body.targetLevel) {
      const match = body.targetLevel.match(/N[1-5]/);
      level = match ? match[0] : body.targetLevel;
    }
    
    this.logger.log(
      `📊 Progress benchmark for user: ${body.userId} at JLPT ${level}`,
    );
    
    const benchmark = await this.fastMcpService.getProgressBenchmark(
      body.userId,
      level as any
    );
    
    return benchmark;
  }

  @Post('test/schedule')
  async scheduleTest(@Body() body: ScheduleTestDto) {
    const level = body.level || body.targetLevel || 'N5';
    
    this.logger.log(
      `📅 Test scheduling for user: ${body.userId} at JLPT ${level}`,
    );
    
    const schedule = await this.fastMcpService.scheduleTest(
      body.userId,
      level as any
    );
    
    // TODO: Save schedule to database
    
    return schedule;
  }
}
