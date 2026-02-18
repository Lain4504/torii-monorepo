import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import {
    type EnrollmentCreateDTO,
    type EnrollmentQueryDTO,
    type EnrollmentResponseDTO,
    type PaginatedResponseDTO,
    EnrollmentStatus,
    CourseStatus,
} from '@workspace/schemas';
import type { IEnrollmentService, ICertificateService } from '@server/learning/interfaces/services';
import { CERTIFICATE_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { EnrollmentRepository } from '@server/learning/modules/enrollment/enrollment.repository';
import { ICourseRepository, COURSE_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
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
        @Inject(COURSE_REPOSITORY_TOKEN)
        private readonly courseRepository: ICourseRepository,
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: ICertificateService,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
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
                    this.natsClient.send({ cmd: 'identity.users.findOne' }, { id: enrollment.userId })
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
        return {
            id: e.id,
            userId: e.userId,
            courseId: e.courseId,
            enrollmentDate: e.enrollmentDate,
            completionStatus: e.completionStatus,
            completionPercentage: Number(e.completionPercentage),
            lastAccessedAt: e.lastAccessedAt || undefined,
            completedAt: e.completedAt || undefined,
            paymentId: e.paymentId || undefined,
            couponAppliedId: e.couponAppliedId || undefined,
            finalPrice: Number(e.finalPrice),
            isGift: e.isGift || false,
            giftMessage: e.giftMessage || undefined,
            senderId: e.senderId || undefined,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
        };
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
    async findOne(id: string): Promise<EnrollmentResponseDTO | null> {
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
        if (existing) {
            if (existing.completionStatus === EnrollmentStatus.PENDING_PAYMENT) {
                this.logger.log(`Found existing pending enrollment ${existing.id} for user ${userId} and course ${input.courseId}`);
                return this.toEnrollmentDto(existing);
            }
            throw new BadRequestException('Already enrolled in this course');
        }

        try {
            // Get course to determine final price
            const course = await this.courseRepository.findById(input.courseId);
            if (!course) {
                throw new NotFoundException('Course not found');
            }
            const finalPrice = course.discountPrice ? Number(course.discountPrice) : Number(course.price);

            const created = await this.enrollmentRepository.create({
                user: { connect: { id: userId } },
                course: { connect: { id: input.courseId } },
                enrollmentDate: new Date(),
                lastAccessedAt: new Date(),
                completionStatus: (input as any).status || (finalPrice > 0 ? EnrollmentStatus.PENDING_PAYMENT : EnrollmentStatus.IN_PROGRESS),
                completionPercentage: 0,
                finalPrice,
                isGift: (input as any).isGift || false,
                giftMessage: (input as any).giftMessage,
                sender: (input as any).senderId ? { connect: { id: (input as any).senderId } } : undefined,
            });

            // If it's a free enrollment (finalPrice is 0) or explicitly active, emit success event for notification/email
            if (created.completionStatus === EnrollmentStatus.IN_PROGRESS) {
                try {
                    this.logger.log(`Fetching user ${userId} for enrollment notification`);
                    const response = await lastValueFrom(
                        this.natsClient.send({ cmd: 'identity.users.findOne' }, { id: userId })
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
                            enrollmentId: created.id,
                        });
                        this.logger.log(`course_enrollment_success event emitted for free course ${course.id}`);
                    } else {
                        this.logger.warn(`Could not find user email for enrollment notification: userId=${userId}, foundUser=${!!user}`);
                    }
                } catch (error: any) {
                    this.logger.error(`Failed to emit free enrollment success event: ${error.message}`);
                }

            }

            return this.toEnrollmentDto(created);
        } catch (error: any) {
            this.logger.error(`Error creating enrollment: ${error.message}`, error.stack);
            throw error;
        }
    }


    /**
     * Check if user is enrolled in a course
     */
    async isEnrolled(userId: string, courseId: string): Promise<boolean> {
        try {
            const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
            return enrollment !== null && (
                enrollment.completionStatus === EnrollmentStatus.IN_PROGRESS ||
                enrollment.completionStatus === EnrollmentStatus.COMPLETED
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
}

