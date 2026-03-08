import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CourseProfileService } from './course-profile.service';
import {
  CourseProfileCreateDto,
  CourseProfileQueryDto,
  CourseProfileUpdateDto,
} from './dto/course-profile.dto';

@Controller()
export class CourseProfileHandler {
  constructor(private readonly courseProfiles: CourseProfileService) { }

  @MessagePattern({ cmd: 'academy.courseProfile.findAll' })
  findAll(@Payload() query: CourseProfileQueryDto) {
    return this.courseProfiles.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.findById' })
  findById(@Payload() data: { id: string }) {
    return this.courseProfiles.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.create' })
  create(@Payload() data: CourseProfileCreateDto & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.courseProfiles.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.update' })
  update(@Payload() data: { id: string; input: CourseProfileUpdateDto; requesterId?: string }) {
    return this.courseProfiles.update(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.archive' })
  archive(@Payload() data: { id: string; requesterId?: string }) {
    return this.courseProfiles.archiveProfile(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.delete' })
  delete(@Payload() data: { id: string; requesterId?: string }) {
    return this.courseProfiles.delete(data.id, data.requesterId);
  }
}

