import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';

import {
    type EnrollmentCreateDTO,
    type TrialEnrollmentCreateDTO,
    type EnrollmentQueryDTO,
    type EnrollmentResponseDTO,
    type PaginatedResponseDTO,
    EnrollmentStatus,
    CourseMasterStatus,
} from '@workspace/schemas';
import { PrismaService } from '@server/shared';
import type { IEnrollmentService, ICertificateService } from '@server/learning/interfaces/services';
import { CERTIFICATE_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { EnrollmentRepository } from '@server/learning/modules/enrollment/enrollment.repository';
import { ICourseMasterRepository, COURSE_MASTER_REPOSITORY_TOKEN, ILessonRepository, LESSON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import type { Prisma } from '@prisma/generated';

/**
 * Enrollment Service
 * Handles enrollment business logic operations
 */
@Injectable()
export class EnrollmentService implements IEnrollmentService {
    private readonly logger = new Logger(EnrollmentService.name);

    constructor(
        private readonly enrollmentRepository: EnrollmentRepository,
        private readonly prisma: PrismaService,
        @Inject(COURSE_MASTER_REPOSITORY_TOKEN)
        private readonly courseRepository: ICourseMasterRepository,
        @Inject(LESSON_REPOSITORY_TOKEN)
        private readonly lessonRepository: ILessonRepository,
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: ICertificateService,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
        @InjectMapper() private readonly mapper: Mapper,
    ) { }

    /**
     * Activate enrollment (switch from PENDING_PAYMENT to IN_PROGRESS)
     */
    async activateEnrollment(enrollmentId: string): Promise<EnrollmentResponseDTO> {
        const enrollment = await this.enrollmentRepository.findById(enrollmentId);
        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        if (enrollment.completionStatus !== EnrollmentStatus.PENDING_PAYMENT) {
            return this.toEnrollmentDto(enrollment);
        }

        try {
            const updated = await this.enrollmentRepository.update(enrollmentId, {
                completionStatus: EnrollmentStatus.IN_PROGRESS,
            });

            // Fetch run with master info to know if we need to increment students
            const enrollmentWithRun = await this.prisma.enrollment.findUnique({
                where: { id: enrollmentId },
                include: { courseRun: { include: { courseMaster: true } } }
            });

            const courseRun = enrollmentWithRun?.courseRun;
            const course = courseRun?.courseMaster;

            if (course?.type === 'live' && courseRun) {
                await this.prisma.courseRun.update({
                    where: { id: courseRun.id },
                    data: { totalStudents: { increment: 1 } },
                });
            } else if (course) {
                await this.courseRepository.incrementTotalStudents(course.id);
            }

            // Audit Log
            await this.logAudit({
                action: 'enrollment.activate',
                entity: 'enrollment',
                entityId: enrollment.id,
                userId: enrollment.userId,
                description: `Activated enrollment ${enrollment.id}`,
                oldValues: { completionStatus: EnrollmentStatus.PENDING_PAYMENT },
                newValues: { completionStatus: EnrollmentStatus.IN_PROGRESS },
            });

            // Fetch User
            try {
                const response = await lastValueFrom(
                    this.natsClient.send({ cmd: 'identity.users.findById' }, { id: enrollment.userId })
                );
                const user = response?.user;

                if (user && user.email && course) {
                    this.natsClient.emit({ cmd: 'course_enrollment_success' }, {
                        userId: enrollment.userId,
                        userEmail: user.email,
                        userName: user.displayName || user.email || 'User',
                        courseMasterId: course.id,
                        courseName: course.title,
                        enrollmentId: enrollment.id,
                    });
                }
            } catch (error: any) {
                this.logger.error(`Failed to emit activation event: ${error.message}`);
            }

            return this.toEnrollmentDto(updated);

        } catch (error: any) {
            this.logger.error(`Error activating enrollment: ${error.message}`, error.stack);
            throw error;
        }
    }


    /**
     * Get learning stats for a user
     */
    async getLearnerStats(userId: string): Promise<{
        totalCourses: number;
        completedCourses: number;
        averageProgress: number;
        totalLearningHours: number;
    }> {
        // Fetch stats from repository and aggregated records
        const [enrollments, totalLearningSeconds] = await Promise.all([
            this.findAll({ userId, limit: 1000, page: 1 }),
            this.enrollmentRepository.countTotalLearningSeconds(userId)
        ]);

        const totalCourses = enrollments.total;
        const completedCourses = enrollments.data.filter(e => e.completionStatus === EnrollmentStatus.COMPLETED).length;
        const averageProgress = totalCourses > 0
            ? enrollments.data.reduce((acc, curr) => acc + curr.completionPercentage, 0) / totalCourses
            : 0;

        // Calculate hours from actual duration (seconds / 3600)
        const totalLearningHours = Math.round(totalLearningSeconds / 3600 * 10) / 10; // Precision to 1 decimal point

        return {
            totalCourses,
            completedCourses,
            averageProgress: Math.round(averageProgress),
            totalLearningHours
        };
    }

    private toEnrollmentDto(e: any): EnrollmentResponseDTO {
        return this.mapper.map<any, EnrollmentResponseDTO>(e, 'Enrollment', 'EnrollmentResponseDTO');
    }

    /**
     * Find all enrollments with pagination and filters
     */
    async findAll(query: EnrollmentQueryDTO): Promise<PaginatedResponseDTO<EnrollmentResponseDTO>> {
        try {
            const { page = 1, limit = 10, userId, courseMasterId, courseRunId, status } = query;
            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: Prisma.EnrollmentWhereInput = {};
            if (userId) whereClause.userId = userId;
            if (courseRunId) {
                // Filter by specific course run
                whereClause.courseRunId = courseRunId;
            } else if (courseMasterId) {
                // Filter by all course runs of a course master (aggregate)
                whereClause.courseRun = { courseMasterId };
            }
            if (status) whereClause.completionStatus = status;

            const [total, items] = await Promise.all([
                this.enrollmentRepository.count(whereClause),
                this.enrollmentRepository.findMany({
                    where: whereClause,
                    take: validLimit,
                    skip,
                    orderBy: { enrollmentDate: 'desc' },
                    include: {
                        courseRun: {
                            include: {
                                courseMaster: true
                            }
                        }
                    }, // Include run and course details
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: items.map((i) => this.toEnrollmentDto(i)),
                total,
                page: validPage,
                limit: validLimit,
                totalPages,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching enrollments: ${error.message}`, error.stack);
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            };
        }
    }

    /**
     * Find enrollment by ID
     */
    async findById(id: string): Promise<EnrollmentResponseDTO | null> {
        try {
            const item = await this.enrollmentRepository.findById(id);
            if (!item) return null;
            return this.toEnrollmentDto(item);
        } catch (error: any) {
            this.logger.error(`Error fetching enrollment ${id}: ${error.message}`, error.stack);
            return null;
        }
    }

    /**
     * Find enrollment by user and course run
     */
    async findByUserAndCourseRun(userId: string, courseRunId: string): Promise<EnrollmentResponseDTO | null> {
        try {
            const item = await this.enrollmentRepository.findByUserAndCourseRun(userId, courseRunId);
            if (!item) return null;
            return this.toEnrollmentDto(item);
        } catch (error: any) {
            this.logger.error(`Error fetching enrollment: ${error.message}`, error.stack);
            return null;
        }
    }

    /**
     * Find any active enrollment by user and course master
     */
    async findByUserAndCourseMaster(userId: string, courseMasterId: string): Promise<EnrollmentResponseDTO | null> {
        try {
            const item = await this.enrollmentRepository.findByUserAndCourseMaster(userId, courseMasterId);
            if (!item) return null;
            return this.toEnrollmentDto(item);
        } catch (error: any) {
            this.logger.error(`Error fetching enrollment by course master: ${error.message}`, error.stack);
            return null;
        }
    }

    /**
     * Find all enrollments by user and course master
     */
    async findAllByUserAndCourseMaster(userId: string, courseMasterId: string): Promise<EnrollmentResponseDTO[]> {
        try {
            const items = await this.enrollmentRepository.findAllByUserAndCourseMaster(userId, courseMasterId);
            return items.map(item => this.toEnrollmentDto(item));
        } catch (error: any) {
            this.logger.error(`Error fetching enrollments by course master: ${error.message}`, error.stack);
            return [];
        }
    }

    /**
     * Check enrollment details for a specific course run (public API for /enrollments/check/:courseRunId).
     *
     * Internally this still looks up any enrollment for the underlying CourseMaster,
     * but the identifier passed in MUST be a CourseRun ID.
     */
    async checkEnrollmentDetails(
        userId: string,
        courseRunId: string,
    ): Promise<{ isEnrolled: boolean; enrollment: EnrollmentResponseDTO | null; hasNewerVersion: boolean }> {
        try {
            // Resolve the underlying CourseMaster from the given courseRunId
            const courseRun = await this.prisma.courseRun.findUnique({
                where: { id: courseRunId },
                select: { courseMasterId: true },
            });

            if (!courseRun) {
                return { isEnrolled: false, enrollment: null, hasNewerVersion: false };
            }

            const courseMasterId = courseRun.courseMasterId;

            // Since an enrollment is now tied to a CourseRun, we check if user has any enrollment
            // for ANY run of this CourseMaster.
            const enrollmentRecord = await this.prisma.enrollment.findFirst({
                where: {
                    userId,
                    courseRun: { courseMasterId },
                },
                include: {
                    courseRun: true,
                },
                orderBy: { enrollmentDate: 'desc' },
            });

            if (!enrollmentRecord) {
                return { isEnrolled: false, enrollment: null, hasNewerVersion: false };
            }

            const enrollment = this.toEnrollmentDto(enrollmentRecord);
            let hasNewerVersion = false;

            const latestVersion = await this.courseRepository.getLatestVersion(courseMasterId);
            if (latestVersion && enrollmentRecord.versionId !== latestVersion.id) {
                hasNewerVersion = true;
            }

            const inProgressStatus = [
                EnrollmentStatus.IN_PROGRESS,
                EnrollmentStatus.COMPLETED,
                EnrollmentStatus.TRIAL,
            ];

            return {
                isEnrolled:
                    inProgressStatus.includes(enrollment.completionStatus as any) ||
                    (enrollment.completionStatus === EnrollmentStatus.TRIAL &&
                        !!enrollment.trialExpiresAt &&
                        new Date(enrollment.trialExpiresAt).getTime() > Date.now()),
                enrollment,
                hasNewerVersion,
            };
        } catch (error: any) {
            this.logger.error(`Error checking enrollment details: ${error.message}`, error.stack);
            return { isEnrolled: false, enrollment: null, hasNewerVersion: false };
        }
    }

    /**
     * Create a new trial enrollment
     */
    async createTrial(userId: string, input: TrialEnrollmentCreateDTO): Promise<EnrollmentResponseDTO> {
        const courseRunId = input.courseRunId;
        const courseRun = await this.prisma.courseRun.findUnique({
            where: { id: courseRunId },
            include: { courseMaster: true }
        });
        if (!courseRun) throw new NotFoundException('Course run not found');

        const course = courseRun.courseMaster;
        if (!course) throw new NotFoundException('Course not found');

        // Check if already enrolled (any status)
        const existing = await this.enrollmentRepository.findByUserAndCourseRun(userId, courseRunId);
        if (existing) {
            throw new BadRequestException('User already has an enrollment record for this course run');
        }

        try {
            const now = new Date();
            const TRIAL_DAYS = 7;
            const trialExpiresAt = new Date(now);
            trialExpiresAt.setDate(now.getDate() + TRIAL_DAYS);

            const versionId = courseRun.versionId || (await this.courseRepository.getLatestVersion(course.id))?.id;

            const result = await this.enrollmentRepository.create({
                user: { connect: { id: userId } },
                courseRun: { connect: { id: courseRunId } },
                ...(versionId ? { version: { connect: { id: versionId } } } : {}),
                enrollmentDate: now,
                completionStatus: EnrollmentStatus.TRIAL,
                trialExpiresAt,
                finalPrice: 0,
            } as any);

            // Log Audit
            await this.logAudit({
                userId,
                action: 'enrollment.trial_create',
                entity: 'enrollment',
                entityId: result.id,
                description: `Created trial enrollment for course run ${courseRunId}`,
            });

            return this.toEnrollmentDto(result);
        } catch (error: any) {
            this.logger.error(`Error creating trial enrollment: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Create a new enrollment
     */
    async create(userId: string, input: EnrollmentCreateDTO): Promise<EnrollmentResponseDTO> {
        const courseRunId = input.courseRunId;
        if (!courseRunId) {
            throw new BadRequestException('CourseRunId is required');
        }

        // Fetch courseRun with courseMaster info
        const courseRun = await this.prisma.courseRun.findUnique({
            where: { id: courseRunId },
            include: { courseMaster: true }
        });
        if (!courseRun) throw new NotFoundException('Course run not found');

        const course = courseRun.courseMaster;
        if (!course) throw new NotFoundException('Associated course not found');

        // Check if course is published
        if (course.status !== CourseMasterStatus.APPROVED) {
            throw new BadRequestException('Course is not available for enrollment');
        }

        // Check if already enrolled
        const existing = await this.enrollmentRepository.findByUserAndCourseRun(userId, courseRunId);

        // If already enrolled and NOT expired, block
        if (existing) {
            if (existing.completionStatus === EnrollmentStatus.PENDING_PAYMENT) {
                this.logger.log(`Found existing pending enrollment ${existing.id} for user ${userId} and run ${courseRunId}`);
                return this.toEnrollmentDto(existing);
            }

            const isExpired = existing.expiresAt && existing.expiresAt < new Date();
            const isMarkedExpired = existing.completionStatus === EnrollmentStatus.EXPIRED;

            if (!isExpired && !isMarkedExpired) {
                throw new BadRequestException('Already enrolled in this course run');
            }

            // If it IS expired, we allow "renewal" by updating the existing record below
            this.logger.log(`Renewing enrollment ${existing.id} for user ${userId} and run ${courseRunId}`);
        }

        // Validation: For Live courses, check registration deadline
        if (course.type === 'live') {
            if (courseRun.enrollmentEnd && new Date() > new Date(courseRun.enrollmentEnd)) {
                throw new BadRequestException('Registration for this class has ended');
            }
            if (courseRun.maxStudents && courseRun.totalStudents >= courseRun.maxStudents) {
                throw new BadRequestException('This class is full');
            }
        }

        try {
            const expiresAt = this.computeEnrollmentExpiry(course, courseRun);
            const finalPrice = courseRun.price !== undefined && courseRun.price !== null
                ? Number(courseRun.discountPrice ?? courseRun.price)
                : 0;

            // Get latest course version for snapshot tracking from the run or master
            const versionId = courseRun.versionId || (await this.courseRepository.getLatestVersion(course.id))?.id;

            const completionStatus = finalPrice > 0 ? EnrollmentStatus.PENDING_PAYMENT : EnrollmentStatus.IN_PROGRESS;
            let result;

            if (existing) {
                // Renewal logic: Update existing record
                result = await this.enrollmentRepository.update(existing.id, {
                    enrollmentDate: new Date(),
                    lastAccessedAt: new Date(),
                    completionStatus,
                    ...(versionId ? { version: { connect: { id: versionId } } } : {}),
                    courseRun: { connect: { id: courseRunId } },
                    expiresAt,
                    finalPrice,
                } as any);
            } else {
                // New enrollment logic
                result = await this.enrollmentRepository.create({
                    user: { connect: { id: userId } },
                    courseRun: { connect: { id: courseRunId } },
                    ...(versionId ? { version: { connect: { id: versionId } } } : {}),
                    enrollmentDate: new Date(),
                    lastAccessedAt: new Date(),
                    completionStatus,
                    completionPercentage: 0,
                    finalPrice,
                    isGift: input.isGift || false,
                    giftMessage: input.giftMessage,
                    sender: input.senderId ? { connect: { id: input.senderId } } : undefined,
                    expiresAt,
                } as any);
            }

            // If it's a free enrollment (finalPrice is 0) or explicitly active, emit success event for notification/email
            if (result.completionStatus === EnrollmentStatus.IN_PROGRESS) {
                try {
                    this.logger.log(`Fetching user ${userId} for enrollment notification`);
                    const response = await lastValueFrom(
                        this.natsClient.send({ cmd: 'identity.users.findById' }, { id: userId })
                    );

                    const user = response?.user;

                    if (user && user.email) {
                        this.logger.log(`Emitting course_enrollment_success for ${user.email}`);
                        this.natsClient.emit({ cmd: 'course_enrollment_success' }, {
                            userId: userId,
                            userEmail: user.email,
                            userName: user.displayName || user.email || 'User',
                            courseMasterId: course.id,
                            courseName: course.title,
                            enrollmentId: result.id,
                        });
                        this.logger.log(`course_enrollment_success event emitted for ${existing ? 'renewal' : 'new enrollment'} of course ${course.id}`);
                    }
                } catch (error: any) {
                    this.logger.error(`Failed to emit enrollment success event: ${error.message}`);
                }
            }

            return this.toEnrollmentDto(result);
        } catch (error: any) {
            this.logger.error(`Error creating enrollment: ${error.message}`, error.stack);
            throw error;
        }
    }


    /**
     * Check if user has access to a course or specific lesson (handling trial logic)
     */
    async checkAccess(userId: string, courseMasterId: string, lessonId?: string): Promise<boolean> {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseRun: { courseMasterId }
            }
        });

        // 1. No enrollment
        if (!enrollment) {
            return false;
        }

        // 2. Full access
        if (enrollment.completionStatus === EnrollmentStatus.IN_PROGRESS ||
            enrollment.completionStatus === EnrollmentStatus.COMPLETED) {
            return true;
        }

        // 3. Trial access
        if (enrollment.completionStatus === EnrollmentStatus.TRIAL) {
            // Check expiry
            if (enrollment.trialExpiresAt && enrollment.trialExpiresAt < new Date()) {
                return false;
            }

            // If checking course level access only -> OK
            if (!lessonId) {
                return true;
            }

            // If checking specific lesson: limit access to the first N lessons (configurable constant)
            const MAX_TRIAL_LESSONS = 3;
            const allowedLessons = await this.lessonRepository.findTopLessonsByCourse(courseMasterId, MAX_TRIAL_LESSONS);
            return allowedLessons.some(l => l.id === lessonId);
        }

        return false;
    }

    async getAccessibleLessonIds(userId: string, courseMasterId: string): Promise<string[] | 'ALL'> {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseRun: { courseMasterId }
            }
        });
        if (!enrollment) return [];

        if (enrollment.completionStatus === EnrollmentStatus.IN_PROGRESS ||
            enrollment.completionStatus === EnrollmentStatus.COMPLETED) {
            return 'ALL';
        }

        if (enrollment.completionStatus === EnrollmentStatus.TRIAL) {
            if (enrollment.trialExpiresAt && enrollment.trialExpiresAt < new Date()) {
                return [];
            }

            const MAX_TRIAL_LESSONS = 3;
            const lessons = await this.lessonRepository.findTopLessonsByCourse(courseMasterId, MAX_TRIAL_LESSONS);
            return lessons.map(l => l.id);
        }

        return [];
    }

    /**
     * Check if user is enrolled in a course
     */
    async isEnrolled(userId: string, courseMasterId: string): Promise<boolean> {
        try {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId,
                    courseRun: { courseMasterId }
                }
            });

            if (!enrollment) return false;

            // Reactive Check: Check for expiration regardless of recorded status
            if (enrollment.expiresAt && enrollment.expiresAt < new Date()) {
                return false;
            }

            return (
                enrollment.completionStatus === EnrollmentStatus.IN_PROGRESS ||
                enrollment.completionStatus === EnrollmentStatus.COMPLETED ||
                (enrollment.completionStatus === EnrollmentStatus.TRIAL &&
                    enrollment.trialExpiresAt !== null &&
                    enrollment.trialExpiresAt > new Date())
            );
        } catch (error: any) {
            this.logger.error(`Error checking enrollment: ${error.message}`, error.stack);
            return false;
        }
    }

    /**
     * Update enrollment progress
     */
    async updateProgress(enrollmentId: string, completionPercentage: number): Promise<EnrollmentResponseDTO> {
        if (completionPercentage < 0 || completionPercentage > 100) {
            throw new BadRequestException('Completion percentage must be between 0 and 100');
        }

        const enrollment = await this.enrollmentRepository.findById(enrollmentId);
        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        try {
            const updated = await this.enrollmentRepository.update(enrollmentId, {
                completionPercentage,
                lastAccessedAt: new Date(),
            });

            // Auto-complete if progress reaches 100%
            if (completionPercentage >= 100 && enrollment.completionStatus === EnrollmentStatus.IN_PROGRESS) {
                await this.enrollmentRepository.update(enrollmentId, {
                    completionStatus: EnrollmentStatus.COMPLETED,
                    completedAt: new Date(),
                });

                // Trigger certificate issuance
                // Fetch run to get masterId for certificate
                const fullEnrollment = await this.prisma.enrollment.findUnique({
                    where: { id: enrollmentId },
                    include: { courseRun: true }
                });
                const masterId = fullEnrollment?.courseRun?.courseMasterId;

                if (masterId) {
                    this.certificateService.issueCertificate(enrollment.userId, masterId, enrollmentId).catch((err: any) => {
                        this.logger.error(`Failed to automatically issue certificate: ${err.message}`, err.stack);
                    });
                }

                return this.toEnrollmentDto({ ...updated, completionStatus: EnrollmentStatus.COMPLETED, completedAt: new Date() });
            }

            return this.toEnrollmentDto(updated);
        } catch (error: any) {
            this.logger.error(`Error updating enrollment progress: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Update enrollment order ID (internal use for order service)
     */
    async updateOrderId(enrollmentId: string, orderId: string): Promise<EnrollmentResponseDTO> {
        try {
            const updated = await this.enrollmentRepository.update(enrollmentId, {
                order: { connect: { id: orderId } },
            });
            return this.toEnrollmentDto(updated);
        } catch (error: any) {
            this.logger.error(`Error updating enrollment order ID: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Upgrade enrollment to the latest course version
     */
    async upgradeVersion(userId: string, courseMasterId: string): Promise<EnrollmentResponseDTO> {
        try {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId,
                    courseRun: { courseMasterId }
                }
            });
            if (!enrollment) {
                throw new NotFoundException('Enrollment not found');
            }

            const latestVersion = await this.courseRepository.getLatestVersion(courseMasterId);
            if (!latestVersion) {
                throw new NotFoundException('Latest version not found');
            }

            if (enrollment.versionId === latestVersion.id) {
                return this.toEnrollmentDto(enrollment);
            }

            const updated = await this.enrollmentRepository.update(enrollment.id, {
                version: { connect: { id: latestVersion.id } },
            });

            // Log Audit
            await this.logAudit({
                action: 'enrollment.upgrade_version',
                entity: 'enrollment',
                entityId: enrollment.id,
                userId: userId,
                description: `Upgraded enrollment ${enrollment.id} to version ${latestVersion.id}`,
                oldValues: { versionId: enrollment.versionId },
                newValues: { versionId: latestVersion.id },
            });

            return this.toEnrollmentDto(updated);
        } catch (error: any) {
            this.logger.error(`Error upgrading enrollment version: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Delete enrollment by user and course
     */
    async deleteByUserAndCourseRun(userId: string, courseRunId: string): Promise<EnrollmentResponseDTO> {
        try {
            const enrollment = await this.enrollmentRepository.findByUserAndCourseRun(userId, courseRunId);
            if (!enrollment) {
                throw new NotFoundException('Enrollment not found');
            }
            await this.enrollmentRepository.delete(enrollment.id);
            this.logger.log(`Deleted enrollment ${enrollment.id} for user ${userId} and run ${courseRunId}`);

            // Log Audit
            await this.logAudit({
                userId,
                action: 'enrollment.delete',
                entity: 'enrollment',
                entityId: enrollment.id,
                description: `Deleted enrollment for user ${userId} and run ${courseRunId}`,
                oldValues: enrollment,
            });

            return this.toEnrollmentDto(enrollment);
        } catch (error: any) {
            this.logger.error(`Error deleting enrollment: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Helper to log audit entries to Identity Service
     */
    private async logAudit(data: {
        userId?: string;
        action: string;
        entity: string;
        entityId: string;
        description: string;
        oldValues?: any;
        newValues?: any;
    }) {
        try {
            this.natsClient.emit({ cmd: 'identity.audit.log' }, {
                userId: data.userId,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                description: data.description,
                oldValues: data.oldValues,
                newValues: data.newValues,
                timestamp: new Date(),
            });
        } catch (error) {
            this.logger.error(`Failed to log audit for ${data.action}`, error);
        }
    }

    /**
     * Compute enrollment expiry based on course type:
     *
     * VOD:     enrollment.expiresAt = enrollmentDate + expirationMonths
     *          (expirationMonths set on Course, max 6)
     *
     * WebRTC:  enrollment.expiresAt = course.expiresAt (fixed course end date)
     *          + registrationClosedAt is REQUIRED — enrollment blocked past this date
     */
    private computeEnrollmentExpiry(course: any, courseRun?: any): Date | undefined {
        const now = new Date();

        if (course.type === 'live') {
            if (!courseRun) {
                throw new BadRequestException('Course run ID is required for live courses');
            }
            return courseRun.endDate ? new Date(courseRun.endDate) : undefined;
        }

        // VOD: expires N months from enrollment date (default 6 months if not specified)
        const months = course.expirationMonths || 6;
        const expiry = new Date(now);
        expiry.setMonth(expiry.getMonth() + months);
        return expiry;
    }
}


