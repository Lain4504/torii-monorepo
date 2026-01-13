import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
    type EnrollmentCreateDTO,
    type EnrollmentQueryDTO,
    type EnrollmentResponseDTO,
    type PaginatedResponseDTO,
    EnrollmentStatus,
} from '@workspace/schemas';
import type { IEnrollmentService } from '../../interfaces/services';
import { ENROLLMENT_SERVICE_TOKEN } from '../../interfaces/services';
import { EnrollmentRepository } from './enrollment.repository';
import { ICourseRepository, COURSE_REPOSITORY_TOKEN } from '../../interfaces/repositories';
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
    ) { }

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

        // Check if already enrolled
        const existing = await this.enrollmentRepository.findByUserAndCourse(userId, input.courseId);
        if (existing) {
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
                completionStatus: EnrollmentStatus.IN_PROGRESS,
                completionPercentage: 0,
                finalPrice,
            });
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
            return enrollment !== null && enrollment.completionStatus === EnrollmentStatus.IN_PROGRESS;
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
    async updateOrderId(enrollmentId: string, orderId: string): Promise<void> {
        try {
            await this.enrollmentRepository.update(enrollmentId, {
                order: { connect: { id: orderId } },
            });
        } catch (error: any) {
            this.logger.error(`Error updating enrollment order ID: ${error.message}`, error.stack);
            throw error;
        }
    }
}


