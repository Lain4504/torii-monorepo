import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ClientProxy } from '@nestjs/microservices';
import type { Requester } from '@workspace/schemas';
import { CourseRunStatus, CourseRunCreateDTO, CourseRunUpdateDTO, CourseRunResponseDTO, CourseRunSearchRequestDTO, PaginatedApiResponse, UserRole } from '@workspace/schemas';
import { ICourseRunRepository } from '../../interfaces/repositories/i-course-run.repository';
import { ICourseRepository } from '../../interfaces/repositories/i-course.repository';
import { COURSE_REPOSITORY_TOKEN, COURSE_RUN_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { generateSlug } from '@server/shared';

@Injectable()
export class CourseRunService {
    private readonly logger = new Logger(CourseRunService.name);

    constructor(
        @Inject(COURSE_RUN_REPOSITORY_TOKEN)
        private readonly courseRunRepository: ICourseRunRepository,
        @Inject(COURSE_REPOSITORY_TOKEN)
        private readonly courseRepository: ICourseRepository,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
        @InjectMapper()
        private readonly mapper: Mapper,
    ) { }

    async create(requester: Requester, dto: CourseRunCreateDTO): Promise<CourseRunResponseDTO> {
        if (!this.hasPermission(requester, 'course.update')) {
            throw new ForbiddenException('You do not have permission to create course runs');
        }

        const course = await this.courseRepository.findById(dto.courseId);
        if (!course) {
            throw new NotFoundException(`Course with id ${dto.courseId} not found`);
        }

        // Ensure syllabus is published (has a version)
        const latestVersion = await this.courseRepository.getLatestVersion(dto.courseId);
        if (!latestVersion) {
            throw new BadRequestException('Cannot create a run for an empty or unpublished course. Please publish the course first.');
        }

        const baseSlug = `${course.slug}-${generateSlug(dto.title)}`;
        const slug = await this.ensureUniqueSlug(baseSlug);

        const run = await this.courseRunRepository.create({
            ...dto,
            slug,
            versionId: dto.versionId || latestVersion.id,
            status: CourseRunStatus.PLANNING,
        } as any);

        await this.emitAuditLog(requester.sub, 'courserun.create', run.id, `Created course run: ${run.title}`);

        return this.toResponseDTO(run);
    }

    async update(requester: Requester, id: string, dto: CourseRunUpdateDTO): Promise<CourseRunResponseDTO> {
        if (!this.hasPermission(requester, 'course.update')) {
            throw new ForbiddenException('You do not have permission to update course runs');
        }

        const existing = await this.courseRunRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Course run with id ${id} not found`);
        }

        const updateData: any = { ...dto };

        if (dto.title && dto.title !== existing.title) {
            const course = await this.courseRepository.findById(existing.courseId);
            const baseSlug = `${course?.slug || 'run'}-${generateSlug(dto.title)}`;
            updateData.slug = await this.ensureUniqueSlug(baseSlug, id);
        }

        const updated = await this.courseRunRepository.update(id, updateData);

        await this.emitAuditLog(requester.sub, 'courserun.update', id, `Updated course run: ${updated.title}`, existing, updated);

        return this.toResponseDTO(updated);
    }

    async findById(id: string): Promise<CourseRunResponseDTO> {
        const run = await this.courseRunRepository.findById(id);
        if (!run) {
            throw new NotFoundException(`Course run with id ${id} not found`);
        }
        return this.toResponseDTO(run);
    }

    async findAll(query: CourseRunSearchRequestDTO): Promise<PaginatedApiResponse<CourseRunResponseDTO>> {
        const { page = 1, limit = 10, courseId, status } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (courseId) where.courseId = courseId;
        if (status) where.status = status;

        const [items, total] = await Promise.all([
            this.courseRunRepository.findMany({
                skip,
                take: limit,
                where,
                include: { lecturer: true },
            }),
            this.courseRunRepository.count(where),
        ]);

        return {
            success: true,
            data: items.map(item => this.toResponseDTO(item)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async delete(requester: Requester, id: string): Promise<void> {
        if (!this.hasPermission(requester, 'course.delete')) {
            throw new ForbiddenException('You do not have permission to delete course runs');
        }

        const existing = await this.courseRunRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Course run with id ${id} not found`);
        }

        // Check if there are enrollments before deleting?
        // For now, simple delete
        await this.courseRunRepository.delete(id);

        await this.emitAuditLog(requester.sub, 'courserun.delete', id, `Deleted course run: ${existing.title}`);
    }

    private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
        let slug = baseSlug;
        let counter = 1;
        while (await this.courseRunRepository.slugExists(slug, excludeId)) {
            slug = `${baseSlug}-${counter++}`;
        }
        return slug;
    }

    private hasPermission(requester: Requester, permission: string): boolean {
        const role = requester.role;
        return role === UserRole.ADMIN || role === UserRole.STAFF || (requester.permissions?.includes(permission) ?? false);
    }

    private toResponseDTO(run: any): CourseRunResponseDTO {
        return run as CourseRunResponseDTO; // Placeholder for actual mapper if needed
    }

    private async emitAuditLog(userId: string, action: string, entityId: string, description: string, oldValues?: any, newValues?: any) {
        this.natsClient.emit({ cmd: 'identity.audit.log' }, {
            userId,
            action,
            entity: 'course_run',
            entityId,
            description,
            oldValues,
            newValues,
            timestamp: new Date(),
        });
    }
}
