import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LESSON_SERVICE_TOKEN, ILessonService } from '@server/learning/interfaces/services';
import { LessonCreateDTO, LessonUpdateDTO, Requester, UserRole } from '@workspace/schemas';

@Controller()
export class LessonHandler {
    constructor(
        @Inject(LESSON_SERVICE_TOKEN) private readonly lessonService: ILessonService
    ) { }

    @MessagePattern({ cmd: 'learning.lesson.create' })
    async create(@Payload() data: LessonCreateDTO & { userId: string }) {
        const { userId, ...dto } = data;
        const requester: Requester = { sub: userId, role: UserRole.STAFF, permissions: [] };
        return this.lessonService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.lesson.findAll' })
    async findAll(@Payload() query: { page?: number; limit?: number; search?: string }) {
        return this.lessonService.findAll({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            search: query.search
        });
    }

    @MessagePattern({ cmd: 'learning.lesson.findByModuleId' })
    async findByModuleId(@Payload() data: { moduleId: string, requester?: Requester }) {
        return this.lessonService.findByModuleId(data.moduleId, data.requester);
    }

    @MessagePattern({ cmd: 'learning.lesson.findPreviewLessonsByCourseId' })
    async findPreviewLessonsByCourseId(@Payload() data: { courseId: string }) {
        return this.lessonService.findPreviewLessonsByCourseId(data.courseId);
    }

    @MessagePattern({ cmd: 'learning.lesson.findOne' })
    async findOne(@Payload() data: { id: string; requester?: Requester }) {
        return this.lessonService.findOne(data.id, data.requester);
    }

    @MessagePattern({ cmd: 'learning.lesson.update' })
    async update(@Payload() data: LessonUpdateDTO & { id: string, userId: string, userRole: UserRole, userPermissions?: string[] }) {
        const { id, userId, userRole, userPermissions, ...dto } = data;
        const requester: Requester = { sub: userId, role: userRole, permissions: userPermissions || [] };
        return this.lessonService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.lesson.delete' })
    async delete(@Payload() data: { id: string, userId: string, userRole: UserRole, hardDelete?: boolean, userPermissions?: string[] }) {
        const { id, userId, userRole, hardDelete, userPermissions } = data;
        const requester: Requester = { sub: userId, role: userRole, permissions: userPermissions || [] };
        return this.lessonService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.lesson.reorder' })
    async reorder(@Payload() data: { moduleId: string, lessonOrders: { id: string; orderIndex: number }[], userId: string, userRole: UserRole, userPermissions?: string[] }) {
        const { moduleId, lessonOrders, userId, userRole, userPermissions } = data;
        const requester: Requester = { sub: userId, role: userRole, permissions: userPermissions || [] };
        return this.lessonService.reorder(requester, moduleId, lessonOrders);
    }
}

