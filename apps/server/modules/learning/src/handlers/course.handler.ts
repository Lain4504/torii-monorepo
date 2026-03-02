import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { COURSE_SERVICE_TOKEN, ICourseService } from '@server/learning/interfaces/services';
import { CourseCreateDTO, CourseUpdateDTO, Requester, UserRole } from '@workspace/schemas';

@Controller()
export class CourseHandler {
    constructor(
        @Inject(COURSE_SERVICE_TOKEN) private readonly courseService: ICourseService
    ) { }

    @MessagePattern({ cmd: 'learning.course.create' })
    async create(@Payload() data: CourseCreateDTO & { requester: Requester }) {
        const { requester, ...dto } = data;
        return this.courseService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.course.findAll' })
    async findAll(@Payload() data: { query: any, requester?: Requester }) {
        return this.courseService.findAll(data.query);
    }

    @MessagePattern({ cmd: 'learning.course.advancedSearch' })
    async advancedSearch(@Payload() query: any) {
        // Parse levels from comma-separated string to array
        if (query.levels && typeof query.levels === 'string') {
            query.levels = query.levels.split(',').filter(Boolean);
        }
        return this.courseService.advancedSearch(query);
    }

    @MessagePattern({ cmd: 'learning.course.getByType' })
    async getByType(@Payload() data: { type: 'vod' | 'live' }) {
        return this.courseService.getByType(data.type);
    }

    @MessagePattern({ cmd: 'learning.course.findById' })
    async findById(@Payload() data: { id: string, requester?: Requester }) {
        return this.courseService.findById(data.id);
    }

    @MessagePattern({ cmd: 'learning.course.findBySlug' })
    async findBySlug(@Payload() data: { slug: string, requester?: Requester }) {
        return this.courseService.findBySlug(data.slug);
    }

    @MessagePattern({ cmd: 'learning.course.getCurriculum' })
    async getCurriculum(@Payload() data: { id: string, requester?: Requester }) {
        return this.courseService.getCurriculum(data.id, data.requester);
    }

    @MessagePattern({ cmd: 'learning.course.update' })
    async update(@Payload() data: CourseUpdateDTO & { id: string, requester: Requester }) {
        const { id, requester, ...dto } = data;
        return this.courseService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.course.delete' })
    async delete(@Payload() data: { id: string, hardDelete?: boolean, requester: Requester }) {
        const { id, hardDelete, requester } = data;
        return this.courseService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.course.publish' })
    async publish(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseService.publish(requester, id);
    }

    @MessagePattern({ cmd: 'learning.course.submitForReview' })
    async submitForReview(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseService.submitForReview(requester, id);
    }

    @MessagePattern({ cmd: 'learning.course.updateLiveConfig' })
    async updateLiveConfig(@Payload() data: { id: string, config: any, requester: Requester }) {
        return this.courseService.updateLiveConfig(data.requester, data.id, data.config);
    }

    @MessagePattern({ cmd: 'learning.course.unpublish' })
    async unpublish(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseService.unpublish(requester, id);
    }

    @MessagePattern({ cmd: 'learning.course.reject' })
    async reject(@Payload() data: { id: string, reason: string, requester: Requester }) {
        const { id, requester, reason } = data;
        return this.courseService.reject(requester, id, reason);
    }

    @MessagePattern({ cmd: 'learning.course.recalculate_stats' })
    async recalculateStats(@Payload() data: { courseId: string }) {
        return this.courseService.recalculateStats(data.courseId);
    }

    @MessagePattern({ cmd: 'learning.course.validateScheduling' })
    async validateScheduling(@Payload() data: { id: string }) {
        return this.courseService.validateForScheduling(data.id);
    }
}
