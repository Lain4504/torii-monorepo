import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CourseEditionService } from './course-edition.service';
import {
  CourseEditionCreateDto,
  CourseEditionQueryDto,
  CourseEditionUpdateDto,
} from './dto/course-edition.dto';

@Controller()
export class CourseEditionHandler {
  constructor(private readonly editions: CourseEditionService) { }

  @MessagePattern({ cmd: 'academy.courseEdition.findAll' })
  findAll(@Payload() query: CourseEditionQueryDto) {
    return this.editions.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.findById' })
  findById(@Payload() data: { id: string }) {
    return this.editions.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.findByCourseProfileId' })
  findByCourseProfileId(@Payload() data: { courseProfileId: string }) {
    return this.editions.findByCourseProfileId(data.courseProfileId);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.create' })
  create(@Payload() data: CourseEditionCreateDto & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.editions.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.update' })
  update(@Payload() data: { id: string; input: CourseEditionUpdateDto; requesterId?: string }) {
    return this.editions.update(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.publish' })
  publish(@Payload() data: { id: string; requesterId?: string }) {
    return this.editions.publishEdition(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.submitForApproval' })
  submitForApproval(@Payload() data: { id: string; requesterId: string }) {
    return this.editions.submitForApproval(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.approve' })
  approve(@Payload() data: { id: string; requesterId: string }) {
    return this.editions.approve(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.reject' })
  reject(@Payload() data: { id: string; reason: string; requesterId: string }) {
    return this.editions.reject(data.id, data.reason, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.archive' })
  archive(@Payload() data: { id: string; requesterId?: string }) {
    return this.editions.archiveEdition(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.setCurrent' })
  setCurrent(@Payload() data: { id: string; requesterId?: string }) {
    return this.editions.setCurrent(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseEdition.delete' })
  delete(@Payload() data: { id: string; requesterId?: string }) {
    return this.editions.delete(data.id, data.requesterId);
  }
}

