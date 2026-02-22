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
    async create(@Payload() data: CourseCreateDTO & { instructorId: string, userEmail: string }) {
        const { instructorId, userEmail, ...dto } = data;
        const requester: Requester & { email: string } = {
            sub: instructorId,
            role: UserRole.STAFF,
            email: userEmail,
            permissions: []
        };
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
    async getCurriculum(@Payload() data: { id: string, userId?: string }) {
        return this.courseService.getCurriculum(data.id, data.userId);
    }

    @MessagePattern({ cmd: 'learning.course.update' })
    async update(@Payload() data: CourseUpdateDTO & { id: string, userId: string, userRole: UserRole, userEmail: string, userPermissions?: string[] }) {
        const { id, userId, userRole, userEmail, userPermissions, ...dto } = data;
        const requester: Requester & { email: string } = {
            sub: userId,
            role: userRole,
            email: userEmail,
            permissions: userPermissions || []
        };
        return this.courseService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.course.delete' })
    async delete(@Payload() data: { id: string, hardDelete?: boolean, userId: string, userRole: UserRole, userEmail: string, userPermissions?: string[] }) {
        const { id, hardDelete, userId, userRole, userEmail, userPermissions } = data;
        const requester: Requester & { email: string } = {
            sub: userId,
            role: userRole,
            email: userEmail,
            permissions: userPermissions || []
        };
        return this.courseService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.course.publish' })
    async publish(@Payload() data: { id: string, userId: string, userRole: UserRole, userEmail: string, userPermissions?: string[] }) {
        const { id, userId, userRole, userEmail, userPermissions } = data;
        const requester: Requester & { email: string } = {
            sub: userId,
            role: userRole,
            email: userEmail,
            permissions: userPermissions || []
        };
        return this.courseService.publish(requester, id);
    }

    @MessagePattern({ cmd: 'learning.course.submitForReview' })
    async submitForReview(@Payload() data: { id: string, userId: string, userRole: UserRole, userEmail: string, userPermissions?: string[] }) {
        const { id, userId, userRole, userEmail, userPermissions } = data;
        const requester: Requester & { email: string } = {
            sub: userId,
            role: userRole,
            email: userEmail,
            permissions: userPermissions || []
        };
        return this.courseService.submitForReview(requester, id);
    }

    @MessagePattern({ cmd: 'learning.course.updateLiveConfig' })
    async updateLiveConfig(@Payload() data: { id: string, config: any, userId: string, userPermissions?: string[] }) {
        const requester: Requester = {
            sub: data.userId,
            role: UserRole.LECTURER,
            permissions: data.userPermissions || [],
        };
        return this.courseService.updateLiveConfig(requester, data.id, data.config);
    }

    @MessagePattern({ cmd: 'learning.course.unpublish' })
    async unpublish(@Payload() data: { id: string, userId: string, userRole: UserRole, userEmail: string, userPermissions?: string[] }) {
        const { id, userId, userRole, userEmail, userPermissions } = data;
        const requester: Requester & { email: string } = {
            sub: userId,
            role: userRole,
            email: userEmail,
            permissions: userPermissions || []
        };
        return this.courseService.unpublish(requester, id);
    }

    @MessagePattern({ cmd: 'learning.course.reject' })
    async reject(@Payload() data: { id: string, userId: string, userRole: UserRole, userEmail: string, reason: string, userPermissions?: string[] }) {
        const { id, userId, userRole, userEmail, reason, userPermissions } = data;
        const requester: Requester & { email: string } = {
            sub: userId,
            role: userRole,
            email: userEmail,
            permissions: userPermissions || []
        };
        return this.courseService.reject(requester, id, reason);
    }

    @MessagePattern({ cmd: 'learning.course.recalculate_stats' })
    async recalculateStats(@Payload() data: { courseId: string }) {
        return this.courseService.recalculateStats(data.courseId);
    }
}
