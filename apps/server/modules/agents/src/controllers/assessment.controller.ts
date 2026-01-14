import { Controller, Post, Body, Logger, Inject } from '@nestjs/common';
import { AssessmentAgentService } from '../assessment-agent/assessment-agent.service';
import {
  GenerateTestDto,
  EvaluateTestDto,
  GetBenchmarkDto,
  ScheduleTestDto,
} from '../dtos/assessment.dto';
import type { IAssessmentAgentService } from '../interfaces/services';
import { ASSESSMENT_AGENT_SERVICE_TOKEN } from '../interfaces/services';

@Controller('agents')
export class AssessmentController {
  private readonly logger = new Logger(AssessmentController.name);

  constructor(
    @Inject(ASSESSMENT_AGENT_SERVICE_TOKEN)
    private readonly assessmentService: IAssessmentAgentService,
  ) {}

  @Post('test/generate')
  async generateTest(@Body() body: GenerateTestDto) {
    this.logger.log(
      `Test generation: JLPT ${body.level} ${body.type} (${body.questionCount} questions)`,
    );
    return await this.assessmentService.generateJlptTest(
      body.level,
      body.type,
      body.questionCount,
      body.userId,
    );
  }

  @Post('test/evaluate')
  async evaluateTest(@Body() body: EvaluateTestDto) {
    this.logger.log(`Test evaluation for: ${body.testId}`);
    return await this.assessmentService.evaluateTest(body.testId, body.answers, body.userId);
  }

  @Post('benchmark/get')
  async getProgressBenchmark(@Body() body: GetBenchmarkDto) {
    this.logger.log(
      `Progress benchmark for user: ${body.userId} at JLPT ${body.level}`,
    );
    return await this.assessmentService.getProgressBenchmark(
      body.userId,
      body.level,
    );
  }

  @Post('test/schedule')
  async scheduleTest(@Body() body: ScheduleTestDto) {
    this.logger.log(
      `Test scheduling for user: ${body.userId} at JLPT ${body.level} on ${body.date}`,
    );
    return await this.assessmentService.scheduleTest(
      body.userId,
      body.level,
      body.date,
    );
  }
}
