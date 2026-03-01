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
    CourseStatus,
} from '@workspace/schemas';
import { PrismaService } from '@server/shared';
import type { IEnrollmentService, ICertificateService } from '@server/learning/interfaces/services';
import { CERTIFICATE_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { EnrollmentRepository } from '@server/learning/modules/enrollment/enrollment.repository';
import { ICourseRepository, COURSE_REPOSITORY_TOKEN, ILessonRepository, LESSON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
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
        @Inject(COURSE_REPOSITORY_TOKEN)
        private readonly courseRepository: ICourseRepository,
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

            const course = await this.courseRepository.findById(enrollment.courseId);
            const courseRunId = (enrollment as any).courseRunId;

            if (course?.type === 'live') {
                if (courseRunId) {
                    await this.prisma.courseRun.update({
                        where: { id: courseRunId },
                        data: { totalStudents: { increment: 1 } },
                    });
                } else {
                    await this.courseRepository.incrementTotalStudents(course.id);
                }
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
                        courseId: course.id,
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
            const { page = 1, limit = 10, userId, courseId, status } = query;
            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: Prisma.EnrollmentWhereInput = {};
            if (userId) whereClause.userId = userId;
            if (courseId) whereClause.courseId = courseId;
            if (status) whereClause.completionStatus = status;

            const [total, items] = await Promise.all([
                this.enrollmentRepository.count(whereClause),
                this.enrollmentRepository.findMany({
                    where: whereClause,
                    take: validLimit,
                    skip,
                    orderBy: { enrollmentDate: 'desc' },
                    include: { course: true }, // Include course details
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
     * Find enrollment by user and course
     */
    async findByUserAndCourse(userId: string, courseId: string): Promise<EnrollmentResponseDTO | null> {
        try {
            const item = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
            if (!item) return null;
            return this.toEnrollmentDto(item);
        } catch (error: any) {
            this.logger.error(`Error fetching enrollment: ${error.message}`, error.stack);
            return null;
        }
    }

    /**
     * Check enrollment details including version update info
     */
    async checkEnrollmentDetails(userId: string, courseId: string): Promise<{ isEnrolled: boolean; enrollment: EnrollmentResponseDTO | null; hasNewerVersion: boolean }> {
        try {
            const enrollment = await this.findByUserAndCourse(userId, courseId);
            let hasNewerVersion = false;

            if (enrollment) {
                const latestVersion = await this.courseRepository.getLatestVersion(courseId);
                if (latestVersion && enrollment.versionId !== latestVersion.id) {
                    hasNewerVersion = true;
                }
            }

            const inProgressStatus = [
                EnrollmentStatus.IN_PROGRESS,
                EnrollmentStatus.COMPLETED,
                EnrollmentStatus.TRIAL,
                EnrollmentStatus.SUSPENDED as any,
            ];

            return {
                isEnrolled: !!enrollment && (
                    inProgressStatus.includes(enrollment.completionStatus as any) ||
                    (enrollment.completionStatus === EnrollmentStatus.TRIAL && !!enrollment.trialExpiresAt && new Date(enrollment.trialExpiresAt).getTime() > Date.now())
                ),
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
        const courseId = input.courseId;
        // Check if course exists
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Check if course allows trial
        if (!course.trialDays || course.trialDays <= 0) {
            throw new BadRequestException('This course does not offer a trial period');
        }

        // Check if already enrolled (any status)
        const existing = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
        if (existing) {
            throw new BadRequestException('User already has an enrollment record for this course');
        }

        try {
            const now = new Date();
            const trialExpiresAt = new Date(now);
            trialExpiresAt.setDate(now.getDate() + course.trialDays);

            // Get latest course version
            const latestVersion = await this.courseRepository.getLatestVersion(courseId);
            const versionId = latestVersion ? latestVersion.id : undefined;

            const created = await this.enrollmentRepository.create({
                user: { connect: { id: userId } },
                course: { connect: { id: courseId } },
                ...(versionId ? { version: { connect: { id: versionId } } } : {}),
                ...((input as any).courseRunId ? { courseRun: { connect: { id: (input as any).courseRunId } } } : {}),
                enrollmentDate: now,
                lastAccessedAt: now,
                completionStatus: EnrollmentStatus.TRIAL,
                completionPercentage: 0,
                finalPrice: 0,
                trialExpiresAt: trialExpiresAt,
            } as any);

            // Log Audit
            await this.logAudit({
                action: 'enrollment.create_trial',
                entity: 'enrollment',
                entityId: created.id,
                userId: userId,
                description: `Created trial enrollment for user ${userId} and course ${courseId}`,
                newValues: { completionStatus: EnrollmentStatus.TRIAL, trialExpiresAt },
            });

            return this.toEnrollmentDto(created);
        } catch (error: any) {
            this.logger.error(`Error creating trial enrollment: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Create a new enrollment
     */
    async create(userId: string, input: EnrollmentCreateDTO): Promise<EnrollmentResponseDTO> {
        if (!input.courseId) {
            throw new BadRequestException('CourseId is required');
        }

        // Check if course exists
        const course = await this.courseRepository.findById(input.courseId);
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Check if course is published
        if (course.status !== CourseStatus.PUBLISHED) {
            throw new NotFoundException('Course not found');
        }

        // Check if already enrolled
        const existing = await this.enrollmentRepository.findByUserAndCourse(userId, input.courseId);

        // If already enrolled and NOT expired, block
        if (existing) {
            if (existing.completionStatus === EnrollmentStatus.PENDING_PAYMENT) {
                this.logger.log(`Found existing pending enrollment ${existing.id} for user ${userId} and course ${input.courseId}`);
                return this.toEnrollmentDto(existing);
            }

            const isExpired = existing.expiresAt && existing.expiresAt < new Date();
            const isMarkedExpired = existing.completionStatus === EnrollmentStatus.EXPIRED;

            if (!isExpired && !isMarkedExpired) {
                throw new BadRequestException('Already enrolled in this course');
            }

            // If it IS expired, we allow "renewal" by updating the existing record below
            this.logger.log(`Renewing enrollment ${existing.id} for user ${userId} and course ${input.courseId}`);
        }

        // Validation: For Live courses, check registration deadline
        let courseRun: any = null;
        if (course.type === 'live') {
            const courseRunId = (input as any).courseRunId;
            if (!courseRunId) {
                throw new BadRequestException('Course run ID is required for live courses');
            }
            courseRun = await this.prisma.courseRun.findUnique({ where: { id: courseRunId } });
            if (!courseRun) throw new NotFoundException('Course run not found');

            if (courseRun.enrollmentEnd && new Date() > new Date(courseRun.enrollmentEnd)) {
                throw new BadRequestException('Registration for this class has ended');
            }
            if (courseRun.maxStudents && courseRun.totalStudents >= courseRun.maxStudents) {
                throw new BadRequestException('This class is full');
            }
        }

        try {
            const expiresAt = this.computeEnrollmentExpiry(course, courseRun);
            const finalPrice = (input as any).courseRunId && courseRun?.price !== undefined && courseRun?.price !== null
                ? (courseRun.discountPrice ?? courseRun.price)
                : (course.discountPrice ? Number(course.discountPrice) : Number(course.price));

            // Get latest course version for snapshot tracking
            const latestVersion = await this.courseRepository.getLatestVersion(input.courseId);
            const versionId = courseRun?.versionId || latestVersion?.id;

            const completionStatus = finalPrice > 0 ? EnrollmentStatus.PENDING_PAYMENT : EnrollmentStatus.IN_PROGRESS;
            let result;

            if (existing) {
                // Renewal logic: Update existing record
                result = await this.enrollmentRepository.update(existing.id, {
                    enrollmentDate: new Date(),
                    lastAccessedAt: new Date(),
                    completionStatus,
                    ...(versionId ? { version: { connect: { id: versionId } } } : {}),
                    ...((input as any).courseRunId ? { courseRun: { connect: { id: (input as any).courseRunId } } } : {}),
                    expiresAt,
                    finalPrice,
                } as any);
            } else {
                // New enrollment logic
                result = await this.enrollmentRepository.create({
                    user: { connect: { id: userId } },
                    course: { connect: { id: input.courseId } },
                    ...(versionId ? { version: { connect: { id: versionId } } } : {}),
                    ...((input as any).courseRunId ? { courseRun: { connect: { id: (input as any).courseRunId } } } : {}),
                    enrollmentDate: new Date(),
                    lastAccessedAt: new Date(),
                    completionStatus,
                    completionPercentage: 0,
                    finalPrice,
                    isGift: (input as any).isGift || false,
                    giftMessage: (input as any).giftMessage,
                    sender: (input as any).senderId ? { connect: { id: (input as any).senderId } } : undefined,
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
                            courseId: course.id,
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
    async checkAccess(userId: string, courseId: string, lessonId?: string): Promise<boolean> {
        const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);

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

            // If checking specific lesson
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                return false;
            }

            // If no limit defined, allow access (since time trial is valid)
            if (!course.maxTrialLessons || course.maxTrialLessons <= 0) {
                return true;
            }

            // Check if lesson is within the first N lessons
            const allowedLessons = await this.lessonRepository.findTopLessonsByCourse(courseId, course.maxTrialLessons);
            return allowedLessons.some(l => l.id === lessonId);
        }

        return false;
    }

    async getAccessibleLessonIds(userId: string, courseId: string): Promise<string[] | 'ALL'> {
        const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
        if (!enrollment) return [];

        if (enrollment.completionStatus === EnrollmentStatus.IN_PROGRESS ||
            enrollment.completionStatus === EnrollmentStatus.COMPLETED) {
            return 'ALL';
        }

        if (enrollment.completionStatus === EnrollmentStatus.TRIAL) {
            if (enrollment.trialExpiresAt && enrollment.trialExpiresAt < new Date()) {
                return [];
            }

            const course = await this.courseRepository.findById(courseId);
            if (!course || !course.maxTrialLessons) {
                return 'ALL'; // No lesson limit defined for trial -> allow all (time-based only)
            }

            const lessons = await this.lessonRepository.findTopLessonsByCourse(courseId, course.maxTrialLessons);
            return lessons.map(l => l.id);
        }

        return [];
    }

    /**
     * Check if user is enrolled in a course
     */
    async isEnrolled(userId: string, courseId: string): Promise<boolean> {
        try {
            const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);

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
                this.certificateService.issueCertificate(enrollment.userId, enrollment.courseId, enrollmentId).catch((err: any) => {
                    this.logger.error(`Failed to automatically issue certificate: ${err.message}`, err.stack);
                });

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
    async upgradeVersion(userId: string, courseId: string): Promise<EnrollmentResponseDTO> {
        try {
            const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
            if (!enrollment) {
                throw new NotFoundException('Enrollment not found');
            }

            const latestVersion = await this.courseRepository.getLatestVersion(courseId);
            if (!latestVersion) {
                return this.toEnrollmentDto(enrollment);
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
    async deleteByUserAndCourse(userId: string, courseId: string): Promise<EnrollmentResponseDTO> {
        try {
            const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
            if (!enrollment) {
                throw new NotFoundException('Enrollment not found');
            }
            await this.enrollmentRepository.delete(enrollment.id);
            this.logger.log(`Deleted enrollment ${enrollment.id} for user ${userId} and course ${courseId}`);

            // Log Audit
            await this.logAudit({
                userId,
                action: 'enrollment.delete',
                entity: 'enrollment',
                entityId: enrollment.id,
                description: `Deleted enrollment for user ${userId} and course ${courseId}`,
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


