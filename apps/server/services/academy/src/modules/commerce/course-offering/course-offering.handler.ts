import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CourseOfferingService } from './course-offering.service';
import {
  CourseOfferingCreateDto,
  CourseOfferingQueryDto,
  CourseOfferingSetClassesDto,
  CourseOfferingUpdateDto,
} from './dto/course-offering.dto';

@Controller()
export class CourseOfferingHandler {
  constructor(private readonly offerings: CourseOfferingService) { }

  @MessagePattern({ cmd: 'academy.courseOffering.findAll' })
  findAll(@Payload() query: CourseOfferingQueryDto) {
    return this.offerings.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.findById' })
  findById(@Payload() data: { id: string }) {
    return this.offerings.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.create' })
  create(@Payload() data: CourseOfferingCreateDto & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.offerings.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.update' })
  update(@Payload() data: { id: string; input: CourseOfferingUpdateDto; requesterId?: string }) {
    return this.offerings.update(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.setClasses' })
  setClasses(@Payload() data: CourseOfferingSetClassesDto & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.offerings.setClasses(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.delete' })
  delete(@Payload() data: { id: string; requesterId?: string }) {
    return this.offerings.delete(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.submitForApproval' })
  submitForApproval(@Payload() data: { id: string; requesterId: string }) {
    return this.offerings.submitForApproval(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.approve' })
  approve(@Payload() data: { id: string; requesterId: string }) {
    return this.offerings.approve(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.reject' })
  reject(@Payload() data: { id: string; reason: string; requesterId: string }) {
    return this.offerings.reject(data.id, data.reason, data.requesterId);
  }
}

