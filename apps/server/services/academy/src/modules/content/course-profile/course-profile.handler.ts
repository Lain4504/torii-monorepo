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
  constructor(private readonly courseProfiles: CourseProfileService) {}

  @MessagePattern({ cmd: 'academy.courseProfile.findAll' })
  findAll(@Payload() query: CourseProfileQueryDto) {
    return this.courseProfiles.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.findById' })
  findById(@Payload() data: { id: string }) {
    return this.courseProfiles.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.create' })
  create(@Payload() input: CourseProfileCreateDto) {
    return this.courseProfiles.create(input);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.update' })
  update(@Payload() data: { id: string; input: CourseProfileUpdateDto }) {
    return this.courseProfiles.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.delete' })
  delete(@Payload() data: { id: string }) {
    return this.courseProfiles.delete(data.id);
  }
}

