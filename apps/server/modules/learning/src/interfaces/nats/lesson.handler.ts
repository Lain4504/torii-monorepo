import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LESSON_SERVICE_TOKEN, ILessonService } from '@server/learning/interfaces/services';
import { LessonCreateDTO, LessonUpdateDTO } from '@workspace/schemas';

@Controller()
export class LessonHandler {
    constructor(
        @Inject(LESSON_SERVICE_TOKEN) private readonly lessonService: ILessonService
    ) { }

    @MessagePattern({ cmd: 'learning.lesson.create' })
    async create(@Payload() data: LessonCreateDTO & { userId: string }) {
        const { userId, ...dto } = data;
        const requester = { sub: userId, role: 'STAFF' as any, permissions: [] };
        return this.lessonService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.lesson.findAll' })
    async findAll(@Payload() query: any) {
        return this.lessonService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.lesson.findByModuleId' })
    async findByModuleId(@Payload() data: { moduleId: string, userId: string, userRole?: string, userPermissions?: string[] }) {
        const requester = { sub: data.userId, role: (data.userRole || 'LEARNER') as any, permissions: data.userPermissions || [] };
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
    async update(@Payload() data: LessonUpdateDTO & { id: string, userId: string, userRole: string, userPermissions?: string[] }) {
        const { id, userId, userRole, userPermissions, ...dto } = data;
        const requester = { sub: userId, role: userRole as any, permissions: userPermissions || [] };
        return this.lessonService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.lesson.delete' })
    async delete(@Payload() data: { id: string, userId: string, userRole: string, hardDelete?: boolean, userPermissions?: string[] }) {
        const { id, userId, userRole, hardDelete, userPermissions } = data;
        const requester = { sub: userId, role: userRole as any, permissions: userPermissions || [] };
        return this.lessonService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.lesson.reorder' })
    async reorder(@Payload() data: { moduleId: string, lessonOrders: { id: string; orderIndex: number }[], userId: string, userRole: string, userPermissions?: string[] }) {
        const { moduleId, lessonOrders, userId, userRole, userPermissions } = data;
        const requester = { sub: userId, role: userRole as any, permissions: userPermissions || [] };
        return this.lessonService.reorder(requester, moduleId, lessonOrders);
    }
}

