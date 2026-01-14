import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IAssessmentAgentService } from '../interfaces/services';
import { ASSESSMENT_AGENT_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Assessment Agent NATS Message Handler
 * Handles inter-service communication for AI assessment operations
 *
 * @example
 * // From other service:
 * this.natsClient.send('agents.assessment.generateTest', { level, type, questionCount }).toPromise();
 */
@Controller()
export class AssessmentAgentController {
  private readonly logger = new Logger(AssessmentAgentController.name);

  constructor(
    @Inject(ASSESSMENT_AGENT_SERVICE_TOKEN)
    private readonly assessmentService: IAssessmentAgentService,
  ) {}

  /**
   * Generate JLPT test
   * Pattern: agents.assessment.test.generate
   */
  @MessagePattern('agents.assessment.test.generate')
  async generateJLPTTest(
    @Payload() data: { level: string; type: string; questionCount: number; userId: string },
  ) {
    try {
      this.logger.log('AI Test generate request received');
      const result = await this.assessmentService.generateJlptTest(
        data.level,
        data.type,
        data.questionCount,
        data.userId,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.assessment.test.generate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Evaluate test answers
   * Pattern: agents.assessment.test.evaluate
   */
  @MessagePattern('agents.assessment.test.evaluate')
  async evaluateTest(@Payload() data: { testId: string; answers: any; userId: string }) {
    try {
      this.logger.log('AI Test evaluate request received');
      const result = await this.assessmentService.evaluateTest(
        data.testId,
        data.answers,
        data.userId,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.assessment.test.evaluate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get progress benchmark
   * Pattern: agents.assessment.benchmark.get
   */
  @MessagePattern('agents.assessment.benchmark.get')
  async getProgressBenchmark(
    @Payload() data: { userId: string; level: string },
  ) {
    try {
      this.logger.log('AI Benchmark get request received');
      const result = await this.assessmentService.getProgressBenchmark(
        data.userId,
        data.level,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.assessment.benchmark.get:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Schedule test
   * Pattern: agents.assessment.test.schedule
   */
  @MessagePattern('agents.assessment.test.schedule')
  async scheduleTest(
    @Payload() data: { userId: string; level: string; date: string },
  ) {
    try {
      this.logger.log('AI Test schedule request received');
      const result = await this.assessmentService.scheduleTest(
        data.userId,
        data.level,
        data.date,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('Error in agents.assessment.test.schedule:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
