import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AssessmentService } from '@server/agents/modules';
import { Requester } from '@workspace/schemas';

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
      requester: Requester;
    },
  ) {
    return this.assessmentService.generateJlptTest(
      data.requester,
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
      requester: Requester;
    },
  ) {
    return this.assessmentService.evaluateTest(
      data.requester,
      data.testId,
      data.answers,
    );
  }

  @MessagePattern({ cmd: 'agents.assessment.placementTest' })
  async generatePlacementTest(
    @Payload()
    data: {
      questionCount?: number;
      requester: Requester;
    },
  ) {
    return this.assessmentService.generatePlacementTest(
      data.requester,
      data.questionCount || 15,
    );
  }

  @MessagePattern({ cmd: 'agents.assessment.evaluatePlacement' })
  async evaluatePlacementTest(
    @Payload()
    data: {
      requester: Requester;
      testId: string;
      userAnswers: any;
    },
  ) {
    return this.assessmentService.evaluatePlacementTest(
      data.requester,
      data.testId,
      data.userAnswers,
    );
  }
}
