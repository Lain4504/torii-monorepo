import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { COURSE_SERVICE_TOKEN, ICourseService } from '../../interfaces/services';
import { CourseCreateDTO, CourseUpdateDTO, Requester } from '@workspace/schemas';

@Controller()
export class CourseHandler {
    constructor(
        @Inject(COURSE_SERVICE_TOKEN) private readonly courseService: ICourseService
    ) { }

    @MessagePattern({ cmd: 'learning.course.create' })
    async create(@Payload() data: CourseCreateDTO & { user: Requester }) {
        const { user, ...dto } = data;
        return this.courseService.create(user, dto);
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
    async update(@Payload() data: CourseUpdateDTO & { id: string, user: Requester }) {
        const { id, user, ...dto } = data;
        return this.courseService.update(user, id, dto);
    }

    @MessagePattern({ cmd: 'learning.course.delete' })
    async delete(@Payload() data: { id: string, hardDelete?: boolean, user: Requester }) {
        const { id, hardDelete, user } = data;
        return this.courseService.delete(user, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.course.publish' })
    async publish(@Payload() data: { id: string, user: Requester }) {
        const { id, user } = data;
        return this.courseService.publish(user, id);
    }

    @MessagePattern({ cmd: 'learning.course.unpublish' })
    async unpublish(@Payload() data: { id: string, user: Requester }) {
        const { id, user } = data;
        return this.courseService.unpublish(user, id);
    }
}
