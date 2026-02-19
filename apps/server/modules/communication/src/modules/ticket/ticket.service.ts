import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    Ticket,
    TicketQueryDTO,
    CreateTicketDTO,
    UpdateTicketStatusDTO,
    PaginatedResponseDTO,
    TicketType,
    TicketStatus,
    NotificationType
} from '@workspace/schemas';
import { ITicketService, INotificationService, NOTIFICATION_SERVICE_TOKEN } from '../../interfaces/services';
import { ITicketRepository, TICKET_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { EmailService } from '../email/email.service';

@Injectable()
export class TicketService implements ITicketService {
    private readonly logger = new Logger(TicketService.name);

    constructor(
        @Inject(TICKET_REPOSITORY_TOKEN)
        private readonly ticketRepository: ITicketRepository,
        @Inject(NOTIFICATION_SERVICE_TOKEN)
        private readonly notificationService: INotificationService,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Helper to emit audit log event
     */
    private async createAuditLog(entry: {
        userId: string;
        action: string;
        entity: string;
        entityId?: string;
        description: string;
        metadata?: any;
        oldValues?: any;
        newValues?: any;
    }) {
        try {
            this.natsClient.emit({ cmd: 'identity.audit.log' }, entry);
        } catch (error) {
            this.logger.error(`Failed to emit audit log: ${error.message}`);
        }
    }

    async createTicket(userId: string, dto: CreateTicketDTO): Promise<Ticket> {
        // Validate refund ticket
        if (dto.type === TicketType.REFUND) {
            const courseId = dto.metadata?.courseId;
            if (!courseId) {
                throw new BadRequestException('Course ID is required for refund ticket');
            }

            // Check if user is enrolled and within 14 days
            try {
                const result = await firstValueFrom(
                    this.natsClient.send({ cmd: 'learning.enrollment.check' }, { userId, courseId })
                );

                if (!result || !result.isEnrolled) {
                    throw new BadRequestException('You are not enrolled in this course or enrollment is not active');
                }

                const enrollmentDate = new Date(result.enrollment.enrollmentDate);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - enrollmentDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 14) {
                    throw new BadRequestException('Bạn chỉ có thể yêu cầu hoàn tiền trong vòng 14 ngày kể từ ngày đăng ký khóa học.');
                }
            } catch (error) {
                if (error instanceof BadRequestException) throw error;
                this.logger.error(`Error checking enrollment for refund: ${error.message}`);
                throw new BadRequestException('Could not verify enrollment status or refund eligibility');
            }
        }

        const ticket = await this.ticketRepository.create({ ...dto, userId });



        return ticket;
    }

    async getTicketById(id: string): Promise<Ticket> {
        const ticket = await this.ticketRepository.findById(id);
        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }
        return ticket;
    }

    async getTickets(query: TicketQueryDTO): Promise<PaginatedResponseDTO<Ticket>> {
        const { data, total } = await this.ticketRepository.findAll(query);
        const limit = Number(query.limit) || 10;
        const page = Number(query.page) || 1;

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async updateTicketStatus(id: string, handlerId: string, dto: UpdateTicketStatusDTO): Promise<Ticket> {
        const ticket = await this.getTicketById(id);

        if (ticket.status !== TicketStatus.PENDING && ticket.status !== TicketStatus.PROCESSING) {
            throw new BadRequestException('Ticket is already finalized');
        }

        // Handle Refund Logic
        if (dto.status === TicketStatus.APPROVED && ticket.type === TicketType.REFUND) {
            const courseId = (ticket.metadata as any)?.courseId;
            const userId = ticket.userId;

            if (courseId && userId) {
                try {
                    // Re-verify eligibility before final approval
                    const result = await firstValueFrom(
                        this.natsClient.send({ cmd: 'learning.enrollment.check' }, { userId, courseId })
                    );

                    if (!result || !result.isEnrolled) {
                        throw new BadRequestException('Enrollment not found or already processed.');
                    }

                    const enrollmentDate = new Date(result.enrollment.enrollmentDate);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - enrollmentDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays > 14) {
                        throw new BadRequestException('Khóa học này đã quá thời hạn 14 ngày để hoàn tiền.');
                    }

                    // Logic: Delete Enrollment and get its data
                    const deletedEnrollment = await firstValueFrom(
                        this.natsClient.send({ cmd: 'learning.enrollment.delete' }, { userId, courseId })
                    );

                    if (!deletedEnrollment) {
                        this.logger.warn(`Enrollment deletion returned no data for User ${userId}, Course ${courseId}`);
                    } else if (deletedEnrollment.finalPrice > 0) {
                        // Refund balance
                        await firstValueFrom(
                            this.natsClient.send({ cmd: 'billing.user_balance.add' }, {
                                userId,
                                amount: Math.round(Number(deletedEnrollment.finalPrice)),
                                reason: `Hoàn tiền khóa học (Ticket #${ticket.id})`
                            })
                        );

                        // Optionally update response if not provided
                        if (!dto.response) {
                            dto.response = `Đã hoàn trả ${deletedEnrollment.finalPrice} vào số dư cho khóa học của bạn.`;
                        } else {
                            dto.response = `${dto.response} (Đã hoàn trả ${deletedEnrollment.finalPrice} vào số dư)`.trim();
                        }
                    }

                    this.logger.log(`Refund approved and enrollment deleted for User ${userId}, Course ${courseId}.`);

                    // Send Email Notification
                    try {
                        this.logger.log(`Fetching user and course details for refund email (UserId: ${userId}, CourseId: ${courseId})`);
                        const [userResult, courseResult] = await Promise.all([
                            firstValueFrom(this.natsClient.send({ cmd: 'identity.users.findOne' }, { id: userId })),
                            firstValueFrom(this.natsClient.send({ cmd: 'learning.course.findOne' }, { id: courseId }))
                        ]).catch(err => {
                            this.logger.error(`Failed to fetch user/course details via NATS: ${err.message}`);
                            return [null, null];
                        });

                        if (userResult?.user?.email) {
                            this.logger.log(`Directly calling EmailService for refund email to: ${userResult.user.email}`);
                            await this.emailService.sendEmail({
                                type: 'refund_status',
                                to: userResult.user.email,
                                data: {
                                    displayName: userResult.user.displayName || userResult.user.username || 'Học viên',
                                    courseName: courseResult?.title || 'Khóa học',
                                    amount: Math.round(Number(deletedEnrollment?.finalPrice || 0)),
                                    currency: 'Coin',
                                    ticketId: ticket.id,
                                    reason: dto.response,
                                    status: 'APPROVED'
                                }
                            });
                            this.logger.log(`Refund email processed by EmailService for: ${userResult.user.email}`);
                        } else {
                            this.logger.warn(`Could not send refund email: User email not found. UserResult: ${JSON.stringify(userResult)}`);
                        }
                    } catch (emailError) {
                        this.logger.error(`Failed to trigger refund email: ${emailError.message}`, emailError.stack);
                    }
                } catch (error) {
                    if (error instanceof BadRequestException) throw error;
                    this.logger.error(`Error processing refund cancellation: ${error.message}`);
                    if (error.message?.includes('not found')) {
                        this.logger.warn(`Enrollment not found during refund for User ${userId}, Course ${courseId}. Proceeding with ticket approval.`);
                    } else {
                        throw new BadRequestException(`Failed to process enrollment cancellation: ${error.message}`);
                    }
                }
            }
        }

        const updatedTicket = await this.ticketRepository.updateStatus(id, dto.status, dto.response, handlerId);

        await this.createAuditLog({
            userId: handlerId,
            action: 'ticket.update_status',
            entity: 'ticket',
            entityId: id,
            description: `Updated ticket status to ${dto.status}`,
            oldValues: { status: ticket.status, response: (ticket as any).response },
            newValues: { status: updatedTicket.status, response: (updatedTicket as any).response },
            metadata: { handlerId },
        });

        // Send Notification to User
        try {
            let title = '';
            let message = '';

            if (dto.status === TicketStatus.APPROVED) {
                title = ticket.type === TicketType.REFUND ? 'Yêu cầu hoàn tiền được chấp nhận' : 'Yêu cầu hỗ trợ được chấp nhận';
                message = ticket.type === TicketType.REFUND
                    ? `Yêu cầu hoàn tiền cho khóa học của bạn đã được phê duyệt. ${dto.response || ''}`
                    : `Yêu cầu hỗ trợ của bạn đã được xử lý thành công. ${dto.response || ''}`;
            } else if (dto.status === TicketStatus.REJECTED) {
                title = ticket.type === TicketType.REFUND ? 'Yêu cầu hoàn tiền bị từ chối' : 'Yêu cầu hỗ trợ bị từ chối';
                message = `Rất tiếc, yêu cầu của bạn đã bị từ chối. Lý do: ${dto.response || 'Không có lý do cụ thể.'}`;
            } else if (dto.status === TicketStatus.PROCESSING) {
                title = 'Yêu cầu đang được xử lý';
                message = `Yêu cầu của bạn đã được tiếp nhận và đang trong quá trình xử lý.`;
            }

            if (title && message) {
                await this.notificationService.create({
                    userId: ticket.userId,
                    title,
                    message,
                    notificationType: ticket.type === TicketType.REFUND ? NotificationType.PAYMENT : NotificationType.SYSTEM,
                    metadata: {
                        ticketId: ticket.id,
                        status: dto.status,
                        type: ticket.type
                    }
                });
            }
        } catch (error) {
            this.logger.error(`Failed to send notification for ticket ${id}: ${error.message}`);
        }

        return updatedTicket;
    }

    async getTicketStats(): Promise<{ pendingCount: number; refundCount: number; totalCount: number }> {
        const [pendingCount, refundCount, totalCount] = await Promise.all([
            this.ticketRepository.count({ status: TicketStatus.PENDING }),
            this.ticketRepository.count({ type: TicketType.REFUND, status: TicketStatus.PENDING }),
            this.ticketRepository.count({}),
        ]);

        return {
            pendingCount,
            refundCount,
            totalCount,
        };
    }
}
