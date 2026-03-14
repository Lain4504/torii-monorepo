import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentCreateDto, EnrollmentQueryDto } from './dto/enrollment.dto';

@Controller()
export class EnrollmentHandler {
  constructor(private readonly enrollments: EnrollmentService) { }

  @MessagePattern({ cmd: 'academy.enrollment.findAll' })
  findAll(@Payload() query: EnrollmentQueryDto) {
    return this.enrollments.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.enrollment.findById' })
  findById(@Payload() data: { id: string }) {
    return this.enrollments.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.enrollment.create' })
  create(@Payload() data: EnrollmentCreateDto & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.enrollments.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.enrollment.updateStatus' })
  updateStatus(@Payload() data: { id: string; status: string; requesterId?: string }) {
    return this.enrollments.updateStatus(data.id, data.status, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.enrollment.delete' })
  async delete(@Payload() data: { id: string; requesterId?: string }) {
    await this.enrollments.delete(data.id, data.requesterId);
    return { success: true };
  }

  @MessagePattern({ cmd: 'academy.enrollment.getStats' })
  getStats(@Payload() data: { userId: string }) {
    return this.enrollments.getLearnerStats(data.userId);
  }

  @MessagePattern({ cmd: 'academy.enrollment.check' })
  check(@Payload() data: { userId: string; classId: string }) {
    return this.enrollments.checkEnrollment(data.userId, data.classId);
  }
}

