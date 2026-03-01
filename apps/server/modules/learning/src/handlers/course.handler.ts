import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { COURSE_MASTER_SERVICE_TOKEN, ICourseMasterService } from '@server/learning/interfaces/services';
import { CourseMasterCreateDTO, CourseMasterUpdateDTO, Requester, UserRole } from '@workspace/schemas';

@Controller()
export class CourseHandler {
    constructor(
        @Inject(COURSE_MASTER_SERVICE_TOKEN) private readonly courseMasterService: ICourseMasterService
    ) { }

    @MessagePattern({ cmd: 'learning.courseMaster.create' })
    async create(@Payload() data: CourseMasterCreateDTO & { requester: Requester }) {
        const { requester, ...dto } = data;
        return this.courseMasterService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.findAll' })
    async findAll(@Payload() data: { query: any, requester?: Requester }) {
        return this.courseMasterService.findAll(data.query);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.advancedSearch' })
    async advancedSearch(@Payload() query: any) {
        // Parse levels from comma-separated string to array
        if (query.levels && typeof query.levels === 'string') {
            query.levels = query.levels.split(',').filter(Boolean);
        }
        return this.courseMasterService.advancedSearch(query);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.getByType' })
    async getByType(@Payload() data: { type: 'vod' | 'live' }) {
        return this.courseMasterService.getByType(data.type);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.findById' })
    async findById(@Payload() data: { id: string, requester?: Requester }) {
        return this.courseMasterService.findById(data.id);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.findBySlug' })
    async findBySlug(@Payload() data: { slug: string, requester?: Requester }) {
        return this.courseMasterService.findBySlug(data.slug);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.getCurriculum' })
    async getCurriculum(@Payload() data: { id: string, requester?: Requester }) {
        return this.courseMasterService.getCurriculum(data.id, data.requester);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.update' })
    async update(@Payload() data: CourseMasterUpdateDTO & { id: string, requester: Requester }) {
        const { id, requester, ...dto } = data;
        return this.courseMasterService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.delete' })
    async delete(@Payload() data: { id: string, hardDelete?: boolean, requester: Requester }) {
        const { id, hardDelete, requester } = data;
        return this.courseMasterService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.publish' })
    async publish(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseMasterService.publish(requester, id);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.submitForReview' })
    async submitForReview(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseMasterService.submitForReview(requester, id);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.updateLiveConfig' })
    async updateLiveConfig(@Payload() data: { id: string, config: any, requester: Requester }) {
        return this.courseMasterService.updateLiveConfig(data.requester, data.id, data.config);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.unpublish' })
    async unpublish(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseMasterService.unpublish(requester, id);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.reject' })
    async reject(@Payload() data: { id: string, reason: string, requester: Requester }) {
        const { id, requester, reason } = data;
        return this.courseMasterService.reject(requester, id, reason);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.recalculate_stats' })
    async recalculateStats(@Payload() data: { courseMasterId: string }) {
        return this.courseMasterService.recalculateStats(data.courseMasterId);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.validateScheduling' })
    async validateScheduling(@Payload() data: { id: string }) {
        return this.courseMasterService.validateForScheduling(data.id);
    }

    @MessagePattern({ cmd: 'learning.courseMaster.getStudentCount' })
    async getStudentCount(@Payload() data: { id: string }) {
        return this.courseMasterService.getStudentCount(data.id);
    }
}
