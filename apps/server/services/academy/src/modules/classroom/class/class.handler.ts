import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClassService } from './class.service';
import {
  ClassAssignmentCreateDto,
  ClassAssignmentUpdateDto,
  ClassCreateDto,
  ClassDuplicateDto,
  ClassQueryDto,
  ClassUpdateDto,
  MarkLessonCompleteDto,
} from './dto/class.dto';

/**
 * ClassHandler - NATS Interface for Class Operations.
 * Refactored to link directly to CourseProfile.
 */
@Controller()
export class ClassHandler {
  constructor(private readonly classes: ClassService) {}

  // ==== Class CRUD ====

  @MessagePattern({ cmd: 'academy.class.findAll' })
  findAll(@Payload() query: ClassQueryDto) {
    return this.classes.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.class.findById' })
  findById(@Payload() data: { id: string }) {
    return this.classes.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.class.create' })
  create(@Payload() data: ClassCreateDto & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.classes.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.update' })
  update(
    @Payload()
    data: {
      id: string;
      input: ClassUpdateDto;
      requesterId?: string;
    },
  ) {
    return this.classes.update(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.publish' })
  publish(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.publishClass(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.submitForApproval' })
  submitForApproval(@Payload() data: { id: string; requesterId: string }) {
    return this.classes.submitForApproval(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.approve' })
  approve(@Payload() data: { id: string; requesterId: string }) {
    return this.classes.approve(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.reject' })
  reject(@Payload() data: { id: string; reason: string; requesterId: string }) {
    return this.classes.reject(data.id, data.reason, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.start' })
  start(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.startClass(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.complete' })
  complete(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.completeClass(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.archive' })
  archive(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.archiveClass(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.delete' })
  delete(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.delete(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.duplicate' })
  duplicate(
    @Payload()
    data: {
      id: string;
      input?: ClassDuplicateDto;
      requesterId?: string;
    },
  ) {
    return this.classes.duplicate(data.id, data.input, data.requesterId);
  }

  // ==== Class Assignments ====

  @MessagePattern({ cmd: 'academy.class.getAssignmentById' })
  getClassAssignmentById(@Payload() data: { id: string }) {
    return this.classes.getClassAssignmentById(data.id);
  }

  @MessagePattern({ cmd: 'academy.class.getAssignments' })
  getAssignments(@Payload() data: { classId: string }) {
    return this.classes.getAssignments(data.classId);
  }

  @MessagePattern({ cmd: 'academy.class.addAssignment' })
  addAssignment(
    @Payload() data: ClassAssignmentCreateDto & { requesterId?: string },
  ) {
    const { requesterId, ...input } = data;
    return this.classes.addAssignment(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.updateAssignment' })
  updateAssignment(
    @Payload() data: { id: string; input: ClassAssignmentUpdateDto },
  ) {
    return this.classes.updateAssignment(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.class.removeAssignment' })
  removeAssignment(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.removeAssignment(data.id, data.requesterId);
  }

  /** Gets curriculum (modules/lessons) for the course profile associated with this class */
  @MessagePattern({ cmd: 'academy.class.getCurriculum' })
  async getCurriculum(@Payload() data: { id: string }) {
    const klass = await this.classes.findById(data.id);
    return klass.courseProfile;
  }

  // ==== Lesson Progress ====

  @MessagePattern({ cmd: 'academy.class.getUserProgress' })
  getUserProgress(@Payload() data: { userId: string; classId: string }) {
    return this.classes.getUserProgress(data.userId, data.classId);
  }

  @MessagePattern({ cmd: 'academy.class.markLessonComplete' })
  markLessonComplete(@Payload() data: MarkLessonCompleteDto) {
    return this.classes.markLessonComplete(
      data.userId,
      data.classId,
      data.lessonId,
    );
  }

  @MessagePattern({ cmd: 'academy.class.findTerms' })
  findTerms(@Payload() data: { courseProfileId: string }) {
    return this.classes.findTerms(data.courseProfileId);
  }

  @MessagePattern({ cmd: 'academy.class.findPublicCatalog' })
  findPublicCatalog(
    @Payload()
    data: {
      mode: 'LIVE' | 'VOD';
      level?: string;
      month?: string;
      q?: string;
    },
  ) {
    return this.classes.findPublicCatalog(data);
  }

  @MessagePattern({ cmd: 'academy.class.findPublicCatalogById' })
  findPublicCatalogById(@Payload() data: { id: string }) {
    return this.classes.findPublicCatalogById(data.id);
  }
}
