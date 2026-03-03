import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LESSON_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import type { ILessonService } from '@server/learning/interfaces/services/i-lesson.service';
import { LessonCreateDTO, LessonUpdateDTO, Requester, UserRole, LessonQueryDTO } from '@workspace/schemas';

@Controller()
export class LessonHandler {
    constructor(
        @Inject(LESSON_SERVICE_TOKEN) private readonly lessonService: ILessonService
    ) { }

    @MessagePattern({ cmd: 'learning.lesson.create' })
    async create(@Payload() data: LessonCreateDTO & { requester: Requester }) {
        const { requester, ...dto } = data;
        return this.lessonService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.lesson.findAll' })
    async findAll(@Payload() query: any) {
        return this.lessonService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.lesson.search' })
    async search(@Payload() query: LessonQueryDTO) {
        return this.lessonService.search(query);
    }

    @MessagePattern({ cmd: 'learning.lesson.findByModuleId' })
    async findByModuleId(@Payload() data: { moduleId: string, requester?: Requester }) {
        return this.lessonService.findByModuleId(data.moduleId, data.requester);
    }

    @MessagePattern({ cmd: 'learning.lesson.findPreviewLessonsByCourseId' })
    async findPreviewLessonsByCourseId(@Payload() data: { courseMasterId: string }) {
        return this.lessonService.findPreviewLessonsByCourseId(data.courseMasterId);
    }

    @MessagePattern({ cmd: 'learning.lesson.findById' })
    async findById(@Payload() data: { id: string; requester?: Requester }) {
        return this.lessonService.findById(data.id, data.requester);
    }

    @MessagePattern({ cmd: 'learning.lesson.update' })
    async update(@Payload() data: LessonUpdateDTO & { id: string, requester: Requester }) {
        const { id, requester, ...dto } = data;
        return this.lessonService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.lesson.delete' })
    async delete(@Payload() data: { id: string, hardDelete?: boolean, requester: Requester }) {
        const { id, requester, hardDelete } = data;
        return this.lessonService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.lesson.reorder' })
    async reorder(@Payload() data: { moduleId: string, lessonOrders: { id: string; orderIndex: number }[], requester: Requester }) {
        const { moduleId, lessonOrders, requester } = data;
        return this.lessonService.reorder(requester, moduleId, lessonOrders);
    }
}

