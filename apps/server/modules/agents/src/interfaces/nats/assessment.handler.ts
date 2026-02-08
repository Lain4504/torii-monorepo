import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AssessmentService } from '../../modules/assessment/assessment.service';

/**
 * NATS Handler for Assessment Agent
 * Handles inter-service communication via NATS messaging
 */
@Controller()
export class AssessmentHandler {
  constructor(private readonly assessmentService: AssessmentService) { }

  @MessagePattern({ cmd: 'agents.assessment.generateTest' })
  async generateTest(
    @Payload()
    data: {
      level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      section: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'full';
      questionCount?: number;
      userId: string;
    },
  ) {
    return this.assessmentService.generateJlptTest(
      data.userId,
      data.level,
      data.section,
      data.questionCount || 10,
    );
  }

  @MessagePattern({ cmd: 'agents.assessment.evaluateTest' })
  async evaluateTest(
    @Payload()
    data: {
      testId: string;
      answers: Array<{ questionId: string; userAnswer: string; correctAnswer: string }>;
      userId: string;
    },
  ) {
    return this.assessmentService.evaluateTest(
      data.userId,
      data.testId,
      data.answers,
    );
  }

  @MessagePattern({ cmd: 'agents.assessment.progressBenchmark' })
  async getProgressBenchmark(
    @Payload()
    data: {
      userId: string;
      targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    },
  ) {
    const level = (data.level || data.targetLevel || 'N5') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    return this.assessmentService.getProgressBenchmark(data.userId, level);
  }

  @MessagePattern({ cmd: 'agents.assessment.scheduleTest' })
  async scheduleTest(
    @Payload()
    data: {
      userId: string;
      targetLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    },
  ) {
    const level = (data.level || data.targetLevel || 'N5') as 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    return this.assessmentService.scheduleTest(data.userId, level);
  }

  @MessagePattern({ cmd: 'agents.assessment.placementTest' })
  async generatePlacementTest(
    @Payload()
    data: {
      userId: string;
      questionCount?: number;
    },
  ) {
    return this.assessmentService.generatePlacementTest(
      data.userId,
      data.questionCount || 15,
    );
  }

  @MessagePattern({ cmd: 'agents.assessment.evaluatePlacement' })
  async evaluatePlacementTest(
    @Payload()
    data: {
      userId: string;
      testId: string;
      answers: any;
    },
  ) {
    return this.assessmentService.evaluatePlacementTest(
      data.userId,
      data.testId,
      data.answers,
    );
  }
}
