import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LESSON_SERVICE_TOKEN, ILessonService } from '../../interfaces/services';
import { LessonCreateDTO, LessonUpdateDTO } from '@workspace/schemas';

@Controller()
export class LessonHandler {
    constructor(
        @Inject(LESSON_SERVICE_TOKEN) private readonly lessonService: ILessonService
    ) { }

    @MessagePattern({ cmd: 'learning.lesson.create' })
    async create(@Payload() data: LessonCreateDTO & { userId: string, userRole: string }) {
        const { userId, userRole, ...dto } = data;
        const requester = { sub: userId, role: userRole as any, permissions: [] };
        return this.lessonService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.lesson.findAll' })
    async findAll(@Payload() query: any) {
        return this.lessonService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.lesson.findByModuleId' })
    async findByModuleId(@Payload() data: { moduleId: string, userId: string, userRole?: string }) {
        const requester = { sub: data.userId, role: (data.userRole || 'LEARNER') as any, permissions: [] };
        return this.lessonService.findByModuleId(data.moduleId, requester);
    }

    @MessagePattern({ cmd: 'learning.lesson.findPreviewLessonsByCourseId' })
    async findPreviewLessonsByCourseId(@Payload() data: { courseId: string }) {
        return this.lessonService.findPreviewLessonsByCourseId(data.courseId);
    }

    @MessagePattern({ cmd: 'learning.lesson.findOne' })
    async findOne(@Payload() data: { id: string, userId?: string }) {
        return this.lessonService.findOne(data.id, data.userId);
    }

    @MessagePattern({ cmd: 'learning.lesson.update' })
    async update(@Payload() data: LessonUpdateDTO & { id: string, userId: string, userRole: string }) {
        const { id, userId, userRole, ...dto } = data;
        const requester = { sub: userId, role: userRole as any, permissions: [] };
        return this.lessonService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.lesson.delete' })
    async delete(@Payload() data: { id: string, userId: string, userRole: string, hardDelete?: boolean }) {
        const { id, userId, userRole, hardDelete } = data;
        const requester = { sub: userId, role: userRole as any, permissions: [] };
        return this.lessonService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.lesson.reorder' })
    async reorder(@Payload() data: { moduleId: string, lessonOrders: { id: string; orderIndex: number }[], userId: string, userRole: string }) {
        const { moduleId, lessonOrders, userId, userRole } = data;
        const requester = { sub: userId, role: userRole as any, permissions: [] };
        return this.lessonService.reorder(requester, moduleId, lessonOrders);
    }
}
