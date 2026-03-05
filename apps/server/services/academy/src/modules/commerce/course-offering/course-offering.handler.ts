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
  constructor(private readonly offerings: CourseOfferingService) {}

  @MessagePattern({ cmd: 'academy.courseOffering.findAll' })
  findAll(@Payload() query: CourseOfferingQueryDto) {
    return this.offerings.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.findById' })
  findById(@Payload() data: { id: string }) {
    return this.offerings.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.create' })
  create(@Payload() input: CourseOfferingCreateDto) {
    return this.offerings.create(input);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.update' })
  update(@Payload() data: { id: string; input: CourseOfferingUpdateDto }) {
    return this.offerings.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.setClasses' })
  setClasses(@Payload() input: CourseOfferingSetClassesDto) {
    return this.offerings.setClasses(input);
  }

  @MessagePattern({ cmd: 'academy.courseOffering.delete' })
  delete(@Payload() data: { id: string }) {
    return this.offerings.delete(data.id);
  }
}

