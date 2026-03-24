import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StudyNoteService } from './study-note.service';
import {
  CreateStudyNoteDto,
  ShareStudyNoteDto,
  UpdateStudyNoteDto,
} from './study-note.dto';

@Controller()
export class StudyNoteHandler {
  constructor(private readonly studyNoteService: StudyNoteService) {}

  @MessagePattern('academy.study-note.create')
  create(@Payload() payload: { userId: string; data: CreateStudyNoteDto }) {
    return this.studyNoteService.create(payload.userId, payload.data);
  }

  @MessagePattern('academy.study-note.findAll')
  findAll(@Payload() payload: { userId: string; lessonId?: string }) {
    return this.studyNoteService.findAll(payload.userId, payload.lessonId);
  }

  @MessagePattern('academy.study-note.findOne')
  findOne(@Payload() payload: { id: string; userId: string }) {
    return this.studyNoteService.findOne(payload.id, payload.userId);
  }

  @MessagePattern('academy.study-note.update')
  update(
    @Payload()
    payload: {
      id: string;
      userId: string;
      data: UpdateStudyNoteDto;
    },
  ) {
    return this.studyNoteService.update(
      payload.id,
      payload.userId,
      payload.data,
    );
  }

  @MessagePattern('academy.study-note.remove')
  remove(@Payload() payload: { id: string; userId: string }) {
    return this.studyNoteService.remove(payload.id, payload.userId);
  }

  @MessagePattern('academy.study-note.updateSharing')
  updateSharing(
    @Payload()
    payload: {
      id: string;
      userId: string;
      data: ShareStudyNoteDto;
    },
  ) {
    return this.studyNoteService.updateSharing(
      payload.id,
      payload.userId,
      payload.data,
    );
  }

  @MessagePattern('academy.study-note.findPublicByToken')
  findPublicByToken(@Payload() payload: { token: string }) {
    return this.studyNoteService.findPublicByToken(payload.token);
  }
}
