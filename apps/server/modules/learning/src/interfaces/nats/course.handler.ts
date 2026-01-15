import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { COURSE_SERVICE_TOKEN, ICourseService } from '../../interfaces/services';
import { CourseCreateDTO, CourseUpdateDTO } from '@workspace/schemas';

@Controller()
export class CourseHandler {
    constructor(
        @Inject(COURSE_SERVICE_TOKEN) private readonly courseService: ICourseService
    ) { }

    @MessagePattern({ cmd: 'learning.course.create' })
    async create(@Payload() data: CourseCreateDTO & { instructorId: string }) {
        const { instructorId, ...dto } = data;
        // Mock requester for service compatibility
        const requester = { sub: instructorId, role: 'INSTRUCTOR' as any, permissions: [] };
        return this.courseService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.course.findAll' })
    async findAll(@Payload() query: any) {
        return this.courseService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.course.advancedSearch' })
    async advancedSearch(@Payload() query: any) {
        return this.courseService.advancedSearch(query);
    }

    @MessagePattern({ cmd: 'learning.course.getByType' })
    async getByType(@Payload() data: { type: 'vod' | 'live' }) {
        return this.courseService.getByType(data.type);
    }

    @MessagePattern({ cmd: 'learning.course.findOne' })
    async findOne(@Payload() data: { id: string, userId?: string }) {
        return this.courseService.findOne(data.id);
    }

    @MessagePattern({ cmd: 'learning.course.findBySlug' })
    async findBySlug(@Payload() data: { slug: string, userId?: string }) {
        return this.courseService.findBySlug(data.slug);
    }

    @MessagePattern({ cmd: 'learning.course.getCurriculum' })
    async getCurriculum(@Payload() data: { id: string }) {
        return this.courseService.getCurriculum(data.id);
    }

    @MessagePattern({ cmd: 'learning.course.update' })
    async update(@Payload() data: CourseUpdateDTO & { id: string, userId: string }) {
        const { id, userId, ...dto } = data;
        const requester = { sub: userId, role: 'INSTRUCTOR' as any, permissions: [] };
        return this.courseService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.course.delete' })
    async delete(@Payload() data: { id: string, userId: string, hardDelete?: boolean }) {
        const { id, userId, hardDelete } = data;
        const requester = { sub: userId, role: 'INSTRUCTOR' as any, permissions: [] };
        return this.courseService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.course.publish' })
    async publish(@Payload() data: { id: string, userId: string }) {
        const { id, userId } = data;
        const requester = { sub: userId, role: 'INSTRUCTOR' as any, permissions: [] };
        return this.courseService.publish(requester, id);
    }

    @MessagePattern({ cmd: 'learning.course.unpublish' })
    async unpublish(@Payload() data: { id: string, userId: string }) {
        const { id, userId } = data;
        const requester = { sub: userId, role: 'INSTRUCTOR' as any, permissions: [] };
        return this.courseService.unpublish(requester, id);
    }
}
