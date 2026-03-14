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
  OrderStatus,
} from '@workspace/schemas';
import { ITicketService } from '@server/academy/interfaces/services';
import { ITicketRepository, TICKET_REPOSITORY_TOKEN } from '@server/academy/interfaces/repositories';
import { EmailService } from '@server/identity/modules/email/email.service';
import { AuditLoggerService } from '../audit-logger.service';
import { RefundService } from './refund.service';

@Injectable()
export class TicketService implements ITicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    @Inject(TICKET_REPOSITORY_TOKEN)
    private readonly ticketRepository: ITicketRepository,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
    private readonly emailService: EmailService,
    private readonly audit: AuditLoggerService,
    private readonly refundService: RefundService,
  ) { }

  async createTicket(userId: string, dto: CreateTicketDTO, requesterId?: string): Promise<Ticket> {
    let ticketMetadata = dto.metadata;

    if (dto.type === TicketType.REFUND) {
      const classId = dto.classId;

      if (!classId) {
        throw new BadRequestException(
          'Class ID is required for refund ticket',
        );
      }

      try {
        const result = await firstValueFrom(
          this.natsClient.send(
            { cmd: 'academy.enrollment.check' },
            { userId, classId },
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
            `User ${userId} attempted refund for class ${classId} with ${progress}% progress.`,
          );
          throw new BadRequestException(
            'Khóa học không đủ điều kiện hoàn tiền do bạn đã hoàn thành hơn 20% nội dung.',
          );
        }

        const classResult = await firstValueFrom(
          this.natsClient.send(
            { cmd: 'academy.class.findById' },
            { id: classId },
          ),
        ).catch(() => null);

        ticketMetadata = {
          ...dto.metadata,
          progress,
          enrollmentDate: result.enrollment.enrollmentDate,
          courseTitle: classResult?.name || 'Unknown Class',
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
    requesterId?: string,
  ): Promise<Ticket> {
    const ticket = await this.getTicketById(id);

    if (
      ticket.status !== TicketStatus.PENDING &&
      ticket.status !== TicketStatus.PROCESSING
    ) {
      throw new BadRequestException('Ticket is already finalized');
    }

    // Workflow enforcement for REFUND tickets
    if (ticket.type === TicketType.REFUND) {
      // 1. Block direct RESOLVED from PENDING (must go through PROCESSING to create Refund record)
      if (ticket.status === TicketStatus.PENDING && dto.status === TicketStatus.RESOLVED) {
        throw new BadRequestException(
          'Yêu cầu hoàn tiền cần được chuyển sang trạng thái "Đang xử lý" để khởi tạo quy trình hoàn tiền trước khi giải quyết.',
        );
      }

      // 2. Block manual RESOLVED from PROCESSING (forcing usage of Refund Management UI for side-effects like enrollment removal)
      if (ticket.status === TicketStatus.PROCESSING && dto.status === TicketStatus.RESOLVED) {
        throw new BadRequestException(
          'Vui lòng xử lý và hoàn tất quy trình trong mục "Quản lý hoàn tiền" để giải quyết ticket này tự động.',
        );
      }
    }

    if (
      dto.status === TicketStatus.PROCESSING &&
      ticket.type === TicketType.REFUND
    ) {
      const classId = ticket.classId;
      const userId = ticket.userId;

      if (classId && userId) {
        try {
          // Check if refund already exists
          const existingRefund = await this.refundService.findAll({ ticketId: id });
          if (existingRefund.total > 0) {
            this.logger.warn(`Refund request already exists for ticket ${id}`);
          } else {
            // Find order for this enrollment if not specified
            let orderId = ticket.orderId;
            let amount = 0;

            const result = await firstValueFrom(
              this.natsClient.send(
                { cmd: 'academy.enrollment.check' },
                { userId, classId },
              ),
            ).catch(() => null);

            if (result?.isEnrolled && result?.enrollment?.sourceOrderId) {
              orderId = result.enrollment.sourceOrderId;
            }

            // Get amount from order or enrollment if possible
            if (orderId) {
              const order = await firstValueFrom(
                this.natsClient.send({ cmd: 'billing.order.findById' }, { id: orderId })
              ).catch(() => null);
              if (order) {
                amount = Number(order.grandTotal || 0);
              }
            }

            await this.refundService.createRefund({
              ticketId: id,
              orderId,
              amount,
              reason: ticket.description,
              adminNote: dto.response,
            }, requesterId || handlerId);

            this.logger.log(`Refund request initiated for ticket ${id} in PENDING status`);
          }
        } catch (error) {
          this.logger.error(`Failed to initiate refund request: ${error.message}`);
          // Don't fail the whole ticket update, but log it
        }
      }
    }

    const updatedTicket = await this.ticketRepository.updateStatus(
      id,
      dto.status,
      dto.response,
      handlerId,
    );

    await this.audit.log({
      userId: requesterId || handlerId,
      action: 'ticket.update_status',
      entity: 'Ticket',
      entityId: id,
      description: `Updated ticket status to ${dto.status}`,
      oldValues: { status: ticket.status },
      newValues: { status: updatedTicket.status },
      metadata: { handlerId, response: dto.response },
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
        this.natsClient.emit(
          { cmd: 'send_notification' },
          {
            recipientId: ticket.userId,
            type: 'system',
            payload: {
              title,
              body: message,
              metadata: {
                ticketId: ticket.id,
                status: dto.status,
                type: ticket.type,
              },
            },
          },
        );
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

  async deleteTicket(id: string, userId?: string, requesterId?: string, isAdmin?: boolean): Promise<void> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (!isAdmin && ticket.userId !== userId) {
      throw new BadRequestException('You are not the owner of this ticket');
    }

    if (ticket.status !== TicketStatus.PENDING) {
      throw new BadRequestException('Only pending tickets can be deleted');
    }

    await this.ticketRepository.delete(id);

    await this.audit.log({
      userId: requesterId || userId || ticket.userId,
      action: 'ticket.delete',
      entity: 'Ticket',
      entityId: id,
      description: `Deleted ticket: ${ticket.subject}${isAdmin ? ' (Admin force)' : ''}`,
      metadata: { subject: ticket.subject, type: ticket.type, isAdmin },
    });
  }
}
