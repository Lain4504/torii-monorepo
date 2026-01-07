import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AssessmentAgentService } from '../../assessment-agent/assessment-agent.service';

@Controller()
export class AssessmentAgentController {
  private readonly logger = new Logger(AssessmentAgentController.name);

  constructor(private readonly assessmentService: AssessmentAgentService) {}

  @MessagePattern({ cmd: 'ai.test.generate' })
  async generateJLPTTest(data: { level: string; type: string; questionCount: number }) {
    try {
      this.logger.log('AI Test generate request received');
      const result = await this.assessmentService.generateJlptTest(data.level, data.type, data.questionCount);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.test.generate:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.test.evaluate' })
  async evaluateTest(data: { testId: string; answers: any }) {
    try {
      this.logger.log('AI Test evaluate request received');
      const result = await this.assessmentService.evaluateTest(data.testId, data.answers);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.test.evaluate:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.benchmark.get' })
  async getProgressBenchmark(data: { userId: string; level: string }) {
    try {
      this.logger.log('AI Benchmark get request received');
      const result = await this.assessmentService.getProgressBenchmark(data.userId, data.level);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.benchmark.get:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.test.schedule' })
  async scheduleTest(data: { userId: string; level: string; date: string }) {
    try {
      this.logger.log('AI Test schedule request received');
      const result = await this.assessmentService.scheduleTest(data.userId, data.level, data.date);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.test.schedule:', error);
      throw error;
    }
  }
}
