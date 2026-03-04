import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Requester } from '@workspace/schemas';

import { AssessmentService } from './assessment.service';

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

  @MessagePattern({ cmd: 'agents.assessment.analyzeResults' })
  async analyzeResults(
    @Payload()
    data: {
      attemptId: string;
      requester: Requester;
    },
  ) {
    return this.assessmentService.analyzeResults(
      data.requester,
      data.attemptId,
    );
  }

  @MessagePattern({ cmd: 'agents.assessment.getPlacementTests' })
  async getPlacementTests(
    @Payload()
    data: {
      level?: string;
      requester: Requester;
    },
  ) {
    return this.assessmentService.getPlacementTests(
      data.requester,
      data.level,
    );
  }

  @MessagePattern({ cmd: 'agents.assessment.recommendCourses' })
  async recommendCourses(
    @Payload()
    data: {
      placementResultId: string;
      requester: Requester;
    },
  ) {
    return this.assessmentService.recommendCourses(
      data.requester,
      data.placementResultId,
    );
  }
}
