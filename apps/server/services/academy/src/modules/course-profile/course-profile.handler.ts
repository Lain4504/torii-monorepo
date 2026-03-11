import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CourseProfileService } from './course-profile.service';
import type {
  AcademyCourseProfileCreateDTO,
  AcademyCourseProfileQueryDTO,
  AcademyCourseProfileUpdateDTO,
} from '@workspace/schemas';

@Controller()
export class CourseProfileHandler {
  constructor(private readonly courseProfiles: CourseProfileService) { }

  @MessagePattern({ cmd: 'academy.courseProfile.findAll' })
  findAll(@Payload() query: AcademyCourseProfileQueryDTO) {
    return this.courseProfiles.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.findById' })
  findById(@Payload() data: { id: string }) {
    return this.courseProfiles.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.create' })
  create(@Payload() data: AcademyCourseProfileCreateDTO & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.courseProfiles.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.update' })
  update(@Payload() data: { id: string; input: AcademyCourseProfileUpdateDTO; requesterId?: string }) {
    return this.courseProfiles.update(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.archive' })
  archive(@Payload() data: { id: string; requesterId?: string }) {
    return this.courseProfiles.archive(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.courseProfile.delete' })
  delete(@Payload() data: { id: string; requesterId?: string }) {
    return this.courseProfiles.delete(data.id, data.requesterId);
  }

  // --- Syllabus management ---

  @MessagePattern({ cmd: 'academy.syllabus.findAll' })
  findAllSyllabi(@Payload() data: { courseProfileId: string }) {
    return this.courseProfiles.findAllSyllabi(data.courseProfileId);
  }

  @MessagePattern({ cmd: 'academy.syllabus.findById' })
  findSyllabusById(@Payload() data: { id: string }) {
    return this.courseProfiles.findSyllabusById(data.id);
  }

  @MessagePattern({ cmd: 'academy.syllabus.create' })
  createSyllabus(@Payload() data: { courseProfileId: string; version: string; name?: string; requesterId?: string }) {
    return this.courseProfiles.createSyllabus(data);
  }

  @MessagePattern({ cmd: 'academy.syllabus.clone' })
  cloneSyllabus(@Payload() data: { sourceSyllabusId: string; newVersion: string; newName?: string; requesterId?: string }) {
    return this.courseProfiles.cloneSyllabus(data);
  }

  @MessagePattern({ cmd: 'academy.syllabus.publish' })
  publishSyllabus(@Payload() data: { id: string; requesterId?: string }) {
    return this.courseProfiles.publishSyllabus(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.syllabus.lock' })
  lockSyllabus(@Payload() data: { id: string; requesterId?: string }) {
    return this.courseProfiles.lockSyllabus(data.id, data.requesterId);
  }
}

