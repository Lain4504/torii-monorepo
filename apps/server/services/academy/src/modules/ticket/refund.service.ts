import { Injectable, Logger, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
    RefundStatus,
    CreateRefundDTO,
    UpdateRefundStatusDTO,
    TicketStatus,
    OrderStatus
} from '@workspace/schemas';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RefundService {
    private readonly logger = new Logger(RefundService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
    ) { }

    async createRefund(dto: CreateRefundDTO, creatorId?: string) {
        return this.prisma.$transaction(async (tx) => {
            const refund = await tx.refund.create({
                data: {
                    ticketId: dto.ticketId,
                    orderId: dto.orderId,
                    amount: dto.amount,
                    reason: dto.reason,
                    adminNote: dto.adminNote,
                    status: RefundStatus.PENDING,
                },
            });

            await tx.refundStatusLog.create({
                data: {
                    refundId: refund.id,
                    oldStatus: RefundStatus.PENDING,
                    newStatus: RefundStatus.PENDING,
                    changedById: creatorId,
                    reason: 'Initial creation',
                },
            });

            return refund;
        });
    }

    async updateStatus(id: string, dto: UpdateRefundStatusDTO, changedById?: string) {
        const refund = await this.prisma.refund.findUnique({
            where: { id },
            include: { ticket: true },
        });

        if (!refund) {
            throw new NotFoundException('Refund not found');
        }

        const oldStatus = refund.status;
        const newStatus = dto.status;

        if (oldStatus === newStatus) {
            return refund;
        }

        return this.prisma.$transaction(async (tx) => {
            const updatedRefund = await tx.refund.update({
                where: { id },
                data: {
                    status: newStatus,
                    adminNote: dto.adminNote ?? refund.adminNote,
                },
            });

            await tx.refundStatusLog.create({
                data: {
                    refundId: id,
                    oldStatus,
                    newStatus,
                    changedById,
                    reason: dto.reason,
                },
            });

            // Side effects based on status
            if (newStatus === RefundStatus.COMPLETED) {
                await this.handleRefundCompletion(updatedRefund.id, tx, changedById);
            } else if (newStatus === RefundStatus.REJECTED) {
                await this.handleRefundRejection(updatedRefund.id, tx, changedById);
            }

            return updatedRefund;
        });
    }

    private async handleRefundCompletion(refundId: string, tx: any, completedById?: string) {
        const refund = await tx.refund.findUnique({
            where: { id: refundId },
            include: { ticket: true },
        });

        // 1. Resolve the associated Ticket
        await tx.ticket.update({
            where: { id: refund.ticketId },
            data: {
                status: TicketStatus.RESOLVED,
                response: `Refund completed. ${refund.adminNote || ''}`,
            },
        });

        // 2. Remove Enrollment
        if (refund.ticket.classId && refund.ticket.userId) {
            try {
                const enrollment = await tx.enrollment.findUnique({
                    where: {
                        userId_classId: {
                            userId: refund.ticket.userId,
                            classId: refund.ticket.classId,
                        },
                    },
                });

                if (enrollment) {
                    // Instead of hard delete, maybe update status to CANCELLED first?
                    // The requirement says "gỡ enrollment", which usually means delete or cancel.
                    // Looking at enrollment.service.ts, delete() requires it to be CANCELLED first.

                    await tx.enrollment.update({
                        where: { id: enrollment.id },
                        data: { status: 'CANCELLED' },
                    });

                    this.logger.log(`Enrollment ${enrollment.id} cancelled for refund ${refundId}`);
                }
            } catch (error) {
                this.logger.error(`Failed to remove enrollment during refund completion: ${error.message}`);
                // We might not want to fail the whole transaction if enrollment is already gone
            }
        }

        // 3. Update Order status if orderId exists
        if (refund.orderId) {
            await tx.order.update({
                where: { id: refund.orderId },
                data: { status: OrderStatus.REFUNDED },
            });
        }

        // 4. Send notification or email?
        // This can be done outside the transaction or via event
        this.natsClient.emit({ cmd: 'send_notification' }, {
            recipientId: refund.ticket.userId,
            type: 'system',
            payload: {
                title: 'Hoàn tiền hoàn tất',
                body: `Yêu cầu hoàn tiền của bạn đã được xử lý thành công. Số tiền: ${refund.amount} Coins.`,
                metadata: { refundId: refund.id, ticketId: refund.ticketId },
            },
        });
    }

    private async handleRefundRejection(refundId: string, tx: any, rejectedById?: string) {
        const refund = await tx.refund.findUnique({
            where: { id: refundId },
            include: { ticket: true },
        });

        if (!refund) return;

        // 1. Cancel the associated Ticket
        await tx.ticket.update({
            where: { id: refund.ticketId },
            data: {
                status: TicketStatus.CANCELLED,
                response: `Refund request rejected. ${refund.adminNote || 'No specific reason provided.'}`,
            },
        });

        // 2. Send notification
        this.natsClient.emit({ cmd: 'send_notification' }, {
            recipientId: refund.ticket.userId,
            type: 'system',
            payload: {
                title: 'Yêu cầu hoàn tiền bị từ chối',
                body: `Yêu cầu hoàn tiền cho khóa học của bạn đã bị từ chối. Lý do: ${refund.adminNote || 'Vui lòng kiểm tra chi tiết trong mục Hỗ trợ.'}`,
                metadata: { refundId: refund.id, ticketId: refund.ticketId },
            },
        });
    }

    async findAll(query: any) {
        const page = Number(query.page || 1);
        const limit = Number(query.limit || 10);
        const { status, ticketId, orderId } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (ticketId) where.ticketId = ticketId;
        if (orderId) where.orderId = orderId;

        const [data, total] = await Promise.all([
            this.prisma.refund.findMany({
                where,
                skip,
                take: limit,
                include: {
                    ticket: {
                        include: {
                            user: {
                                select: { displayName: true, email: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.refund.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(id: string) {
        const refund = await this.prisma.refund.findUnique({
            where: { id },
            include: {
                ticket: {
                    include: {
                        user: {
                            select: { displayName: true, email: true },
                        },
                    },
                },
                logs: {
                    include: {
                        changedBy: {
                            select: { displayName: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!refund) {
            throw new NotFoundException('Refund not found');
        }

        return refund;
    }
}
