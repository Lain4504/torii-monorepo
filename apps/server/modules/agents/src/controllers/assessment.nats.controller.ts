import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FastMcpService } from '../fastmcp/fastmcp.service';

/**
 * NATS Controller for Assessment Agent
 * Handles inter-service communication via NATS messaging
 */
@Controller()
export class AssessmentNatsController {
  constructor(private readonly fastMcpService: FastMcpService) {}

  @MessagePattern('agents.assessment.generate-test')
  async generateTest(
    @Payload()
    data: {
      level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      section: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'full';
      questionCount?: number;
      userId: string;
    },
  ) {
    return this.fastMcpService.generateJlptTest(
      data.userId,
      data.level,
      data.section,
      data.questionCount || 10,
    );
  }

  @MessagePattern('agents.assessment.evaluate-test')
  async evaluateTest(
    @Payload()
    data: {
      testId: string;
      answers: Array<{ questionId: string; userAnswer: string; correctAnswer: string }>;
      userId: string;
    },
  ) {
    return this.fastMcpService.evaluateTest(
      data.userId,
      data.testId,
      data.answers,
    );
  }

  @MessagePattern('agents.assessment.progress-benchmark')
  async getProgressBenchmark(
    @Payload()
    data: {
      userId: string;
      targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    },
  ) {
    const level = (data.level || data.targetLevel || 'N5') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    return this.fastMcpService.getProgressBenchmark(data.userId, level);
  }

  @MessagePattern('agents.assessment.schedule-test')
  async scheduleTest(
    @Payload()
    data: {
      userId: string;
      targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    },
  ) {
    const level = (data.level || data.targetLevel || 'N5') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    return this.fastMcpService.scheduleTest(data.userId, level);
  }
}
