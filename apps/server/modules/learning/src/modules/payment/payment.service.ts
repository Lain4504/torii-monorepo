import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
    type PaymentCreateDTO,
    type PaymentQueryDTO,
    type PaymentResponseDTO,
    type PaymentConfirmDTO,
    type PaginatedResponseDTO,
    PaymentStatus,
    PaymentMethod,
} from '@workspace/schemas';
import type { IPaymentService } from '../../interfaces/services';
import { PAYMENT_SERVICE_TOKEN, ENROLLMENT_SERVICE_TOKEN } from '../../interfaces/services';
import type { IEnrollmentService } from '../../interfaces/services';
import { PaymentRepository } from './payment.repository';
import { ICourseRepository, COURSE_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import type { Prisma } from '@prisma/generated';

/**
 * Payment Service
 * Handles payment business logic operations
 */
@Injectable()
export class PaymentService implements IPaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly paymentRepository: PaymentRepository,
        @Inject(COURSE_REPOSITORY_TOKEN)
        private readonly courseRepository: ICourseRepository,
        @Inject(ENROLLMENT_SERVICE_TOKEN)
        private readonly enrollmentService: IEnrollmentService,
    ) { }

    private toPaymentDto(p: any): PaymentResponseDTO {
        return {
            id: p.id,
            userId: p.userId,
            amount: Number(p.amount),
            currency: p.currency,
            paymentMethod: p.paymentMethod,
            paymentGateway: p.paymentGateway || undefined,
            transactionId: p.transactionId || undefined,
            gatewayTransactionId: p.gatewayTransactionId || undefined,
            status: p.status,
            paymentType: p.paymentType,
            enrollmentId: p.enrollmentId || undefined,
            couponId: p.couponId || undefined,
            description: p.description || undefined,
            metadata: p.metadata || {},
            completedAt: p.completedAt || undefined,
            failedAt: p.failedAt || undefined,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }

    /**
     * Find all payments with pagination and filters
     */
    async findAll(query: PaymentQueryDTO): Promise<PaginatedResponseDTO<PaymentResponseDTO>> {
        try {
            const { page = 1, limit = 10, userId, courseId, status } = query;
            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: Prisma.PaymentWhereInput = {};
            if (userId) whereClause.userId = userId;
            if (status) whereClause.status = status;

            const [total, items] = await Promise.all([
                this.paymentRepository.count(whereClause),
                this.paymentRepository.findMany({
                    where: whereClause,
                    take: validLimit,
                    skip,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: items.map((i) => this.toPaymentDto(i)),
                total,
                page: validPage,
                limit: validLimit,
                totalPages,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching payments: ${error.message}`, error.stack);
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
     * Find payment by ID
     */
    async findOne(id: string): Promise<PaymentResponseDTO | null> {
        try {
            const item = await this.paymentRepository.findById(id);
            if (!item) return null;
            return this.toPaymentDto(item);
        } catch (error: any) {
            this.logger.error(`Error fetching payment ${id}: ${error.message}`, error.stack);
            return null;
        }
    }

    /**
     * Create a new payment (mock implementation)
     */
    async create(userId: string, input: PaymentCreateDTO): Promise<PaymentResponseDTO> {
        let amount = 0;

        // For course_purchase type, get course price from metadata or courseId
        const courseId = input.courseId || input.metadata?.courseId;
        if (input.paymentType === 'course_purchase' && courseId) {
            const course = await this.courseRepository.findById(courseId);
            if (!course) {
                throw new NotFoundException('Course not found');
            }

            // Calculate amount (use discountPrice if available, otherwise price)
            amount = course.discountPrice ? Number(course.discountPrice) : Number(course.price);

            // Free courses don't need payment
            if (amount === 0 || course.isFree) {
                this.logger.log(`Course ${courseId} is free, skipping payment creation`);
                throw new BadRequestException('Free courses do not require payment');
            }
        } else if (!courseId && input.paymentType === 'course_purchase') {
            throw new BadRequestException('CourseId is required for course_purchase payment type');
        }

        try {
            // Calculate original amount and discount if course has discount
            const originalAmount = courseId && course?.discountPrice 
                ? Number(course.price) 
                : undefined;
            const discountAmount = courseId && course?.discountPrice 
                ? Number(course.price) - Number(course.discountPrice) 
                : undefined;

            // Store courseId, originalAmount, and discountAmount in metadata
            const metadata = {
                ...input.metadata,
                courseId: courseId,
                ...(originalAmount && { originalAmount }),
                ...(discountAmount && { discountAmount }),
            };

            const created = await this.paymentRepository.create({
                user: { connect: { id: userId } },
                amount,
                currency: 'VND',
                paymentMethod: input.paymentMethod || 'mock',
                paymentGateway: input.paymentGateway || 'mock',
                status: PaymentStatus.PENDING,
                paymentType: input.paymentType || 'course_purchase',
                description: input.description || undefined,
                metadata,
            });
            return this.toPaymentDto(created);
        } catch (error: any) {
            this.logger.error(`Error creating payment: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Confirm/complete payment (mock implementation)
     * In a real implementation, this would verify with payment gateway
     */
    async confirm(paymentId: string, input: PaymentConfirmDTO): Promise<PaymentResponseDTO> {
        const payment = await this.paymentRepository.findById(paymentId);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            throw new BadRequestException('Payment already completed');
        }

        if (payment.status === PaymentStatus.FAILED || payment.status === PaymentStatus.CANCELLED) {
            throw new BadRequestException('Payment cannot be confirmed in current status');
        }

        try {
            // Mock payment confirmation - simulate successful payment
            // In production, this would verify with payment gateway
            const transactionId = input.transactionId || `MOCK-${Date.now()}-${paymentId.substring(0, 8)}`;
            
            const updated = await this.paymentRepository.update(paymentId, {
                status: PaymentStatus.COMPLETED,
                transactionId,
                gatewayTransactionId: input.gatewayTransactionId,
                completedAt: new Date(),
                metadata: input.metadata ? { ...payment.metadata, ...input.metadata } : payment.metadata,
            });

            // Automatically create enrollment after successful payment (if course_purchase type)
            // Note: courseId should be in metadata when creating payment for course purchase
            if (payment.paymentType === 'course_purchase' && payment.metadata?.courseId) {
                try {
                    const enrollment = await this.enrollmentService.create(payment.userId, {
                        courseId: payment.metadata.courseId,
                    });
                    
                    // Link payment to enrollment (update enrollment with paymentId)
                    await this.enrollmentService.updatePaymentId(enrollment.id, paymentId);
                    
                    // Optionally update payment with enrollmentId for reverse lookup (field only, not relation)
                    await this.paymentRepository.update(paymentId, {
                        enrollmentId: enrollment.id,
                    });
                    
                    this.logger.log(`Enrollment created automatically for user ${payment.userId} and course ${payment.metadata.courseId}`);
                } catch (enrollError: any) {
                    // If enrollment already exists, that's okay - just log it
                    if (enrollError?.message?.includes('Already enrolled')) {
                        this.logger.log(`User ${payment.userId} is already enrolled in course ${payment.metadata.courseId}`);
                    } else {
                        this.logger.warn(`Failed to create enrollment after payment: ${enrollError.message}`);
                    }
                }
            }

            this.logger.log(`Payment ${paymentId} confirmed successfully (MOCK)`);
            return this.toPaymentDto(updated);
        } catch (error: any) {
            // Update payment status to failed
            await this.paymentRepository.update(paymentId, {
                status: PaymentStatus.FAILED,
                failedAt: new Date(),
                metadata: {
                    ...payment.metadata,
                    failureReason: error.message,
                },
            });

            this.logger.error(`Error confirming payment: ${error.message}`, error.stack);
            throw error;
        }
    }
}

