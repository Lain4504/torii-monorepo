import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentCreateDto, EnrollmentQueryDto } from './dto/enrollment.dto';

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
  create(@Payload() input: EnrollmentCreateDto) {
    return this.enrollments.create(input);
  }

  @MessagePattern({ cmd: 'academy.enrollment.updateStatus' })
  updateStatus(@Payload() data: { id: string; status: string }) {
    return this.enrollments.updateStatus(data.id, data.status);
  }

  @MessagePattern({ cmd: 'academy.enrollment.delete' })
  delete(@Payload() data: { id: string }) {
    return this.enrollments.delete(data.id);
  }
}

