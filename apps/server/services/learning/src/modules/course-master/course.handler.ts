import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { COURSE_MASTER_SERVICE_TOKEN, ICourseMasterService } from '@server/learning/interfaces/services';
import { CourseMasterCreateDTO, CourseMasterUpdateDTO, Requester } from '@workspace/schemas';

@Controller()
export class CourseHandler {
    constructor(
        @Inject(COURSE_MASTER_SERVICE_TOKEN) private readonly courseMasterService: ICourseMasterService
    ) { }

    @MessagePattern({ cmd: 'learning.coursemaster.create' })
    async create(@Payload() data: CourseMasterCreateDTO & { requester: Requester }) {
        const { requester, ...dto } = data;
        return this.courseMasterService.create(requester, dto);
    }

    // --- Shared / legacy findAll (learner catalog, etc.) ---
    @MessagePattern({ cmd: 'learning.coursemaster.findAll' })
    async findAll(@Payload() data: { query: any, requester?: Requester }) {
        return this.courseMasterService.findAll(data.query);
    }

    // --- Admin-specific listing (for web-admin) ---
    @MessagePattern({ cmd: 'learning.coursemaster-admin.findAll' })
    async findAllAdmin(@Payload() data: { query: any, requester: Requester }) {
        return this.courseMasterService.findAll(data.query);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.advancedSearch' })
    async advancedSearch(@Payload() query: any) {
        // Parse levels from comma-separated string to array
        if (query.levels && typeof query.levels === 'string') {
            query.levels = query.levels.split(',').filter(Boolean);
        }
        return this.courseMasterService.advancedSearch(query);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.getByType' })
    async getByType(@Payload() data: { type: 'vod' | 'live' }) {
        return this.courseMasterService.getByType(data.type);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.findById' })
    async findById(@Payload() data: { id: string, requester?: Requester }) {
        return this.courseMasterService.findById(data.id);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.findBySlug' })
    async findBySlug(@Payload() data: { slug: string, requester?: Requester }) {
        return this.courseMasterService.findBySlug(data.slug);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.getCurriculum' })
    async getCurriculum(@Payload() data: { id: string, requester?: Requester }) {
        return this.courseMasterService.getCurriculum(data.id, data.requester);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.update' })
    async update(@Payload() data: CourseMasterUpdateDTO & { id: string, requester: Requester }) {
        const { id, requester, ...dto } = data;
        return this.courseMasterService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.delete' })
    async delete(@Payload() data: { id: string, hardDelete?: boolean, requester: Requester }) {
        const { id, hardDelete, requester } = data;
        return this.courseMasterService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.publish' })
    async publish(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseMasterService.publish(requester, id);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.submitForReview' })
    async submitForReview(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseMasterService.submitForReview(requester, id);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.submitSyllabusReview' })
    async submitSyllabusReview(@Payload() data: { id: string; requester: Requester }) {
        const { id, requester } = data;
        return this.courseMasterService.submitForSyllabusReview(requester, id);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.updateLiveConfig' })
    async updateLiveConfig(@Payload() data: { id: string, config: any, requester: Requester }) {
        return this.courseMasterService.updateLiveConfig(data.requester, data.id, data.config);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.unpublish' })
    async unpublish(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseMasterService.unpublish(requester, id);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.reject' })
    async reject(@Payload() data: { id: string, reason: string, requester: Requester }) {
        const { id, requester, reason } = data;
        return this.courseMasterService.reject(requester, id, reason);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.reviewSyllabus' })
    async reviewSyllabus(
        @Payload()
        data: {
            id: string;
            requester: Requester;
            outcome: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUIRED';
            checklist?: Record<string, any>;
            comments?: string;
            rejectionReason?: string;
        },
    ) {
        const { id, requester, ...payload } = data;
        return this.courseMasterService.reviewSyllabus(requester, id, payload);
    }



    @MessagePattern({ cmd: 'learning.coursemaster.getVersionHistory' })
    async getVersionHistory(@Payload() data: { id: string }) {
        return this.courseMasterService.getVersionHistory(data.id);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.validateScheduling' })
    async validateScheduling(@Payload() data: { id: string }) {
        return this.courseMasterService.validateForScheduling(data.id);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.getStudentCount' })
    async getStudentCount(@Payload() data: { id: string }) {
        return this.courseMasterService.getStudentCount(data.id);
    }

    @MessagePattern({ cmd: 'learning.coursemaster.recalculate_stats' })
    @MessagePattern({ cmd: 'learning.courseMaster.recalculate_stats' })
    async recalculate_stats(@Payload() data: { id?: string; courseMasterId?: string }) {
        const id = data.id || data.courseMasterId;
        if (!id) return;
        return this.courseMasterService.recalculateStats(id);
    }
}
