import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentCreateDto, EnrollmentQueryDto } from './dto/enrollment.dto';

/**
 * EnrollmentHandler - NATS Message Interface for Student Management.
 * Refactored to remove legacy Syllabus patterns.
 */
@Controller()
export class EnrollmentHandler {
  constructor(private readonly enrollments: EnrollmentService) {}

  @MessagePattern({ cmd: 'academy.enrollment.findAll' })
  findAll(@Payload() query: EnrollmentQueryDto) {
    return this.enrollments.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.enrollment.findById' })
  findById(@Payload() data: { id: string }) {
    return this.enrollments.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.enrollment.create' })
  enroll(@Payload() data: EnrollmentCreateDto & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.enrollments.enroll(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.enrollment.cancel' })
  cancel(@Payload() data: { id: string; requesterId?: string }) {
    return this.enrollments.cancelEnrollment(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.enrollment.complete' })
  complete(@Payload() data: { id: string; requesterId?: string }) {
    return this.enrollments.completeEnrollment(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.enrollment.getCohortProgress' })
  getCohortProgress(@Payload() data: { classId: string }) {
    return this.enrollments.getCohortProgress(data.classId);
  }

  @MessagePattern({ cmd: 'academy.enrollment.migrateStudents' })
  migrate(@Payload() data: { sourceClassId: string; targetClassId: string; requesterId?: string }) {
    return this.enrollments.migrateStudents(
      data.sourceClassId,
      data.targetClassId,
      data.requesterId,
    );
  }

  @MessagePattern({ cmd: 'academy.enrollment.checkEligibility' })
  checkEligibility(@Payload() data: { userId: string; targetId: string; targetType: 'CLASS' | 'OFFERING' | 'COURSE' }) {
    return this.enrollments.checkEligibility(data.userId, data.targetId, data.targetType);
  }
}
