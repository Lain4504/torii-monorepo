import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClassAssessmentService } from './class-assessment.service';
import {
  ClassAssessmentCreateDto,
  ClassAssessmentQueryDto,
  ClassAssessmentUpdateDto,
} from './dto/class-assessment.dto';

@Controller()
export class ClassAssessmentHandler {
  constructor(private readonly assessments: ClassAssessmentService) {}

  @MessagePattern({ cmd: 'academy.classAssessment.findAll' })
  findAll(@Payload() query: ClassAssessmentQueryDto) {
    return this.assessments.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.classAssessment.findById' })
  findById(@Payload() data: { id: string }) {
    return this.assessments.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.classAssessment.create' })
  create(@Payload() input: ClassAssessmentCreateDto) {
    return this.assessments.create(input);
  }

  @MessagePattern({ cmd: 'academy.classAssessment.update' })
  update(@Payload() data: { id: string; input: ClassAssessmentUpdateDto }) {
    return this.assessments.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.classAssessment.delete' })
  delete(@Payload() data: { id: string }) {
    return this.assessments.delete(data.id);
  }
}

