import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ClientProxy } from '@nestjs/microservices';
import type { Requester } from '@workspace/schemas';
import { CourseRunStatus, CourseRunCreateDTO, CourseRunUpdateDTO, CourseRunResponseDTO, CourseRunSearchRequestDTO, PaginatedApiResponse, UserRole } from '@workspace/schemas';
import { ICourseRunRepository } from '../../interfaces/repositories/i-course-run.repository';
import { ICourseMasterRepository } from '../../interfaces/repositories/i-course-master.repository';
import { COURSE_MASTER_REPOSITORY_TOKEN, COURSE_RUN_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { generateSlug, PrismaService } from '@server/shared';

// Valid status transitions for Course Run
const STATUS_TRANSITIONS: Record<CourseRunStatus, CourseRunStatus[]> = {
    [CourseRunStatus.PLANNING]: [CourseRunStatus.ENROLLING],
    [CourseRunStatus.ENROLLING]: [CourseRunStatus.IN_PROGRESS, CourseRunStatus.POSTPONED, CourseRunStatus.CANCELLED_BY_SYSTEM],
    [CourseRunStatus.IN_PROGRESS]: [CourseRunStatus.COMPLETED, CourseRunStatus.POSTPONED],
    [CourseRunStatus.POSTPONED]: [CourseRunStatus.ENROLLING, CourseRunStatus.CANCELLED_BY_SYSTEM],
    [CourseRunStatus.COMPLETED]: [],
    [CourseRunStatus.CANCELLED_BY_SYSTEM]: [],
    [CourseRunStatus.CANCELLED]: [],
};

@Injectable()
export class CourseRunService {
    private readonly logger = new Logger(CourseRunService.name);

    constructor(
        @Inject(COURSE_RUN_REPOSITORY_TOKEN)
        private readonly courseRunRepository: ICourseRunRepository,
        @Inject(COURSE_MASTER_REPOSITORY_TOKEN)
        private readonly courseRepository: ICourseMasterRepository,
        private readonly prisma: PrismaService,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
        @InjectMapper()
        private readonly mapper: Mapper,
    ) { }

    async create(requester: Requester, dto: CourseRunCreateDTO): Promise<CourseRunResponseDTO> {
        if (!this.hasPermission(requester, 'course.update')) {
            throw new ForbiddenException('You do not have permission to create course runs');
        }

        const courseMaster = await this.courseRepository.findById(dto.courseMasterId);
        if (!courseMaster) {
            throw new NotFoundException(`Course master with id ${dto.courseMasterId} not found`);
        }

        // --- P0 Business Rule: VOD courses can only have 1 CourseRun ---
        // VOD = always-on, self-paced. Content changes go through CourseVersion, not new runs.
        // Enforced at service layer (not DB) to keep flexibility for future enterprise scenarios.
        if ((courseMaster as any).type === 'vod') {
            const existingRunCount = await this.courseRunRepository.count({ courseMasterId: dto.courseMasterId });
            if (existingRunCount >= 1) {
                throw new BadRequestException(
                    'VOD courses can only have one CourseRun. To update content, publish a new CourseVersion instead.'
                );
            }
        }

        // Ensure syllabus is published (has a version)
        const latestVersion = await this.courseRepository.getLatestVersion(dto.courseMasterId);
        if (!latestVersion) {
            throw new BadRequestException('Cannot create a run for an empty or unpublished course master. Please publish the course master first.');
        }

        const baseSlug = `${courseMaster.slug}-${generateSlug(dto.title)}`;
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
        const existing = await this.courseRunRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Course run with id ${id} not found`);
        }

        // Ownership Check: Staff/Admin or assigned Lecturer only
        this.checkOwnership(requester, existing);

        const updateData: any = { ...dto };

        if (dto.title && dto.title !== existing.title) {
            const courseMaster = await this.courseRepository.findById(existing.courseMasterId);
            const baseSlug = `${courseMaster?.slug || 'run'}-${generateSlug(dto.title)}`;
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

    async findBySlug(slug: string): Promise<CourseRunResponseDTO> {
        const run = await this.courseRunRepository.findBySlug(slug);
        if (!run) {
            throw new NotFoundException(`Course run with slug ${slug} not found`);
        }
        return this.toResponseDTO(run);
    }

    async findAll(query: CourseRunSearchRequestDTO): Promise<PaginatedApiResponse<CourseRunResponseDTO>> {
        const { page = 1, limit = 10, courseMasterId, status } = query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (courseMasterId) where.courseMasterId = courseMasterId;
        if (status) where.status = status;
        if (query.lecturerId) where.lecturerId = query.lecturerId;
        if (query.type) {
            where.courseMaster = {
                type: query.type,
            };
        }

        const [items, total] = await Promise.all([
            this.courseRunRepository.findMany({
                skip,
                take: limitNum,
                where,
                include: {
                    lecturer: true,
                    courseMaster: true,
                },
            }),
            this.courseRunRepository.count(where),
        ]);

        return {
            success: true,
            data: items.map(item => this.toResponseDTO(item)),
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        };
    }

    async findMyRuns(requester: Requester, query: CourseRunSearchRequestDTO): Promise<PaginatedApiResponse<CourseRunResponseDTO>> {
        if (!requester || !requester.sub) {
            throw new ForbiddenException('User is not authenticated properly to access my course runs');
        }

        const { page = 1, limit = 10, courseMasterId, status } = query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {
            lecturerId: requester.sub
        };
        if (courseMasterId) where.courseMasterId = courseMasterId;
        if (status) where.status = status;
        if (query.type) {
            where.courseMaster = {
                type: query.type,
            };
        }

        const [items, total] = await Promise.all([
            this.courseRunRepository.findMany({
                skip,
                take: limitNum,
                where,
                include: {
                    lecturer: true,
                    courseMaster: true,
                },
            }),
            this.courseRunRepository.count(where),
        ]);

        return {
            success: true,
            data: items.map(item => this.toResponseDTO(item)),
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        };
    }

    async updateStatus(requester: Requester, id: string, status: CourseRunStatus): Promise<CourseRunResponseDTO> {
        const existing = await this.courseRunRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Course run with id ${id} not found`);
        }

        // Ownership Check
        this.checkOwnership(requester, existing);

        // Determine course type (vod/live) from course master
        const courseMaster = await this.courseRepository.findById(existing.courseMasterId);
        const isVod = (courseMaster as any)?.type === 'vod';

        const currentStatus = existing.status as CourseRunStatus;
        const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

        if (!allowedTransitions.includes(status)) {
            throw new BadRequestException(
                `Cannot transition course run from '${currentStatus}' to '${status}'. Allowed transitions: [${allowedTransitions.join(', ') || 'none'}]`
            );
        }

        // Guard: For LIVE classes, cannot move to ENROLLING if no start date is set.
        // For VOD courses, startDate is optional and learners can enroll anytime.
        if (status === CourseRunStatus.ENROLLING && !isVod) {
            if (!existing.startDate) {
                throw new BadRequestException('Cannot open enrollment without a start date set');
            }
        }

        // Guard: Cannot move to IN_PROGRESS if did not reach minimum enrollment
        if (status === CourseRunStatus.IN_PROGRESS) {
            const run = existing as any;
            if (run.minStudents && run.totalStudents < run.minStudents) {
                throw new BadRequestException(
                    `Cannot start class: enrolled students (${run.totalStudents}) is less than minimum required (${run.minStudents})`
                );
            }
        }

        const updated = await this.courseRunRepository.update(id, { status: status as any });

        await this.emitAuditLog(requester.sub, 'courserun.updateStatus', id,
            `Updated course run status from '${currentStatus}' to '${status}'`,
            { status: currentStatus },
            { status }
        );

        return this.toResponseDTO(updated);
    }

    async getStudentsByCourseRun(id: string, page = 1, limit = 20): Promise<any> {
        const existing = await this.courseRunRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Course run with id ${id} not found`);
        }

        const skip = (page - 1) * limit;

        const [total, items] = await Promise.all([
            this.prisma.enrollment.count({ where: { courseRunId: id } }),
            this.prisma.enrollment.findMany({
                where: { courseRunId: id },
                skip,
                take: limit,
                orderBy: { enrollmentDate: 'desc' },
                include: { user: { select: { id: true, email: true, displayName: true, avatarUrl: true } } },
            }),
        ]);

        return {
            data: items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async delete(requester: Requester, id: string): Promise<void> {
        const existing = await this.courseRunRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Course run with id ${id} not found`);
        }

        // Ownership Check
        this.checkOwnership(requester, existing);

        const run = existing as any;
        if (run.totalStudents && run.totalStudents > 0) {
            throw new BadRequestException('Cannot delete a course run with enrolled students');
        }

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
        return role === UserRole.ADMIN || role === UserRole.STAFF || role === UserRole.STAFF_LMS || (requester.permissions?.includes(permission) ?? false);
    }

    private checkOwnership(requester: Requester, run: any) {
        // Admins and LMS Staff can manage EVERYTHING
        if (requester.role === UserRole.ADMIN || requester.role === UserRole.STAFF_LMS) {
            return;
        }

        // If Lecturer, they must be the assigned instructor for this run
        if (requester.role === UserRole.LECTURER) {
            if (run.lecturerId !== requester.sub) {
                throw new ForbiddenException('You are not the assigned lecturer for this course run.');
            }
            return;
        }

        throw new ForbiddenException('You do not have permission to manage this course run.');
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
