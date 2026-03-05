import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
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
  NotificationType,
  OrderStatus,
} from '@workspace/schemas';
import {
  ITicketService,
  INotificationService,
  NOTIFICATION_SERVICE_TOKEN,
} from '@server/communication/interfaces/services';
import {
  ITicketRepository,
  TICKET_REPOSITORY_TOKEN,
} from '@server/communication/interfaces/repositories';
import { EmailService } from '@server/communication/modules/email/email.service';

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
  ) {}

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
    let ticketMetadata = dto.metadata;

    if (dto.type === TicketType.REFUND) {
      const courseRunId = dto.courseRunId;

      if (!courseRunId) {
        throw new BadRequestException(
          'Course Run ID is required for refund ticket',
        );
      }

      try {
        const result = await firstValueFrom(
          this.natsClient.send(
            { cmd: 'learning.enrollment.check' },
            { userId, courseRunId },
          ),
        );

        if (!result || !result.isEnrolled) {
          throw new BadRequestException(
            'You are not enrolled in this course run or enrollment is not active',
          );
        }

        const enrollmentDate = new Date(result.enrollment.enrollmentDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - enrollmentDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 14) {
          throw new BadRequestException(
            'Bạn chỉ có thể yêu cầu hoàn tiền trong vòng 14 ngày kể từ ngày đăng ký khóa học.',
          );
        }

        const progress = result.enrollment?.completionPercentage || 0;
        if (progress > 20) {
          this.logger.warn(
            `User ${userId} attempted refund for course run ${courseRunId} with ${progress}% progress.`,
          );
          throw new BadRequestException(
            'Khóa học không đủ điều kiện hoàn tiền do bạn đã hoàn thành hơn 20% nội dung.',
          );
        }

        const courseRunResult = await firstValueFrom(
          this.natsClient.send(
            { cmd: 'learning.courserun.findById' },
            { id: courseRunId },
          ),
        ).catch(() => null);

        ticketMetadata = {
          ...dto.metadata,
          progress,
          enrollmentDate: result.enrollment.enrollmentDate,
          courseTitle: courseRunResult?.title || 'Unknown Class',
        };
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        this.logger.error(
          `Error checking enrollment for refund: ${error.message}`,
        );
        throw new BadRequestException(
          'Could not verify enrollment status or refund eligibility',
        );
      }
    }

    const ticket = await this.ticketRepository.create({
      ...dto,
      userId,
      metadata: ticketMetadata,
    });

    return ticket;
  }

  async getTicketById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async getTickets(
    query: TicketQueryDTO,
  ): Promise<PaginatedResponseDTO<Ticket>> {
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

  async updateTicketStatus(
    id: string,
    handlerId: string,
    dto: UpdateTicketStatusDTO,
  ): Promise<Ticket> {
    const ticket = await this.getTicketById(id);

    if (
      ticket.status !== TicketStatus.PENDING &&
      ticket.status !== TicketStatus.PROCESSING
    ) {
      throw new BadRequestException('Ticket is already finalized');
    }

    if (
      dto.status === TicketStatus.RESOLVED &&
      ticket.type === TicketType.REFUND
    ) {
      const courseRunId = ticket.courseRunId;
      const userId = ticket.userId;

      if (courseRunId && userId) {
        try {
          const result = await firstValueFrom(
            this.natsClient.send(
              { cmd: 'learning.enrollment.check' },
              { userId, courseRunId },
            ),
          );

          if (!result || !result.isEnrolled) {
            throw new BadRequestException(
              'Enrollment not found or already processed.',
            );
          }

          const enrollmentDate = new Date(result.enrollment.enrollmentDate);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - enrollmentDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 14) {
            throw new BadRequestException(
              'Khóa học này đã quá thời hạn 14 ngày để hoàn tiền.',
            );
          }

          let orderId = (ticket.metadata as any)?.orderId;
          if (!orderId) {
            const ordersRes = await firstValueFrom(
              this.natsClient.send(
                { cmd: 'billing.order.findAll' },
                { userId, status: OrderStatus.COMPLETED },
              ),
            );
            const matchingOrder = ordersRes.data?.find(
              (o: any) => o.metadata?.courseRunId === courseRunId,
            );
            if (matchingOrder) {
              orderId = matchingOrder.id;
            }
          }

          this.logger.log(
            `Refund approved: Processing via Billing Service for Ticket #${ticket.id}. OrderId: ${orderId || 'Not found'}`,
          );

          let refundAmount = 0;
          let finalCourseName = 'Khóa học';

          if (orderId) {
            const refundedOrder = await firstValueFrom(
              this.natsClient.send(
                { cmd: 'billing.order.refund' },
                {
                  id: orderId,
                  reason: `Hoàn tiền theo Ticket #${ticket.id}: ${dto.response || ''}`,
                },
              ),
            );
            refundAmount = Math.round(Number(refundedOrder.amount || 0));
          } else {
            this.logger.warn(
              `No associated order found for refund ticket ${ticket.id}. Falling back to manual enrollment deletion.`,
            );
            const deletedEnrollment = await firstValueFrom(
              this.natsClient.send(
                { cmd: 'learning.enrollment.delete' },
                { userId, courseRunId },
              ),
            );
            if (deletedEnrollment && deletedEnrollment.finalPrice > 0) {
              refundAmount = Math.round(Number(deletedEnrollment.finalPrice));
              await firstValueFrom(
                this.natsClient.send(
                  { cmd: 'billing.user_balance.add' },
                  {
                    userId: deletedEnrollment.senderId || userId,
                    amount: refundAmount,
                    reason: `Hoàn tiền xóa thủ công - Ticket #${ticket.id}`,
                    type: 'REFUND',
                    metadata: { ticketId: ticket.id, courseRunId },
                  },
                ),
              );
            }
          }

          const courseRunResult = await firstValueFrom(
            this.natsClient.send(
              { cmd: 'learning.courserun.findById' },
              { id: courseRunId },
            ),
          ).catch(() => null);
          finalCourseName = courseRunResult?.title || finalCourseName;

          const userResult = await firstValueFrom(
            this.natsClient.send(
              { cmd: 'identity.users.findById' },
              { id: userId },
            ),
          ).catch(() => null);

          try {
            if (userResult?.user?.email) {
              await this.emailService.sendEmail({
                type: 'refund_status',
                to: userResult.user.email,
                data: {
                  displayName:
                    userResult.user.displayName ||
                    userResult.user.username ||
                    'Học viên',
                  courseName: finalCourseName,
                  amount: refundAmount,
                  currency: 'Coin',
                  ticketId: ticket.id,
                  reason: dto.response,
                  status: 'RESOLVED',
                },
              });
            }
          } catch (emailError) {
            this.logger.error(
              `Failed to trigger refund email: ${emailError.message}`,
            );
          }
        } catch (error) {
          if (error instanceof BadRequestException) throw error;
          this.logger.error(
            `Error processing refund cancellation: ${error.message}`,
          );
          if (error.message?.includes('not found')) {
            this.logger.warn(
              `Enrollment not found during refund for User ${userId}, Course Run ${courseRunId}. Proceeding with ticket approval.`,
            );
          } else {
            throw new BadRequestException(
              `Failed to process enrollment cancellation: ${error.message}`,
            );
          }
        }
      }
    }

    const updatedTicket = await this.ticketRepository.updateStatus(
      id,
      dto.status,
      dto.response,
      handlerId,
    );

    await this.createAuditLog({
      userId: handlerId,
      action: 'ticket.update_status',
      entity: 'ticket',
      entityId: id,
      description: `Updated ticket status to ${dto.status}`,
      oldValues: { status: ticket.status, response: (ticket as any).response },
      newValues: {
        status: updatedTicket.status,
        response: (updatedTicket as any).response,
      },
      metadata: { handlerId },
    });

    try {
      let title = '';
      let message = '';

      if (dto.status === TicketStatus.RESOLVED) {
        title =
          ticket.type === TicketType.REFUND
            ? 'Yêu cầu hoàn tiền đã được giải quyết'
            : 'Yêu cầu hỗ trợ đã được giải quyết';
        message =
          ticket.type === TicketType.REFUND
            ? `Yêu cầu hoàn tiền cho khóa học của bạn đã được phê duyệt. ${dto.response || ''}`
            : `Yêu cầu hỗ trợ của bạn đã được xử lý thành công. ${dto.response || ''}`;
      } else if (dto.status === TicketStatus.CANCELLED) {
        title = 'Yêu cầu đã bị hủy';
        message = `Yêu cầu của bạn đã bị hủy. Lý do: ${dto.response || 'Không có lý do cụ thể.'}`;
      } else if (dto.status === TicketStatus.PROCESSING) {
        title = 'Yêu cầu đang được xử lý';
        message = `Yêu cầu của bạn đã được tiếp nhận và đang trong quá trình xử lý.`;
      }

      if (title && message) {
        await this.notificationService.create({
          userId: ticket.userId,
          title,
          message,
          notificationType:
            ticket.type === TicketType.REFUND
              ? NotificationType.PAYMENT
              : NotificationType.SYSTEM,
          metadata: {
            ticketId: ticket.id,
            status: dto.status,
            type: ticket.type,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to send notification for ticket ${id}: ${error.message}`,
      );
    }

    return updatedTicket;
  }

  async getTicketStats(): Promise<{
    pendingCount: number;
    refundCount: number;
    totalCount: number;
  }> {
    const [pendingCount, refundCount, totalCount] = await Promise.all([
      this.ticketRepository.count({ status: TicketStatus.PENDING }),
      this.ticketRepository.count({
        type: TicketType.REFUND,
        status: TicketStatus.PENDING,
      }),
      this.ticketRepository.count({}),
    ]);

    return {
      pendingCount,
      refundCount,
      totalCount,
    };
  }

  async deleteTicket(id: string, userId: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new BadRequestException('You are not the owner of this ticket');
    }

    if (ticket.status !== TicketStatus.PENDING) {
      throw new BadRequestException('Only pending tickets can be deleted');
    }

    await this.ticketRepository.delete(id);

    this.createAuditLog({
      userId,
      action: 'ticket.delete',
      entity: 'ticket',
      entityId: id,
      description: `User deleted ticket ${id}`,
      metadata: { subject: ticket.subject, type: ticket.type },
    }).catch((err) => this.logger.error(`Audit log failed: ${err.message}`));
  }
}
