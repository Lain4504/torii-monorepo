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
    TicketStatus
} from '@workspace/schemas';
import { ITicketService } from '../../interfaces/services';
import { ITicketRepository, TICKET_REPOSITORY_TOKEN } from '../../interfaces/repositories';

@Injectable()
export class TicketService implements ITicketService {
    private readonly logger = new Logger(TicketService.name);

    constructor(
        @Inject(TICKET_REPOSITORY_TOKEN)
        private readonly ticketRepository: ITicketRepository,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
    ) { }

    async createTicket(userId: string, dto: CreateTicketDTO): Promise<Ticket> {
        // Validate refund ticket
        if (dto.type === TicketType.REFUND) {
            const courseId = dto.metadata?.courseId;
            if (!courseId) {
                throw new BadRequestException('Course ID is required for refund ticket');
            }

            // Check if user is enrolled in the course
            try {
                const enrollment = await firstValueFrom(
                    this.natsClient.send({ cmd: 'learning.enrollment.isEnrolled' }, { userId, courseId })
                );
                if (!enrollment) {
                    throw new BadRequestException('You are not enrolled in this course');
                }
            } catch (error) {
                this.logger.error(`Error checking enrollment: ${error.message}`);
                throw new BadRequestException('Could not verify enrollment status');
            }
        }

        return this.ticketRepository.create({ ...dto, userId });
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
                    // Logic: Delete Enrollment
                    const deleteResult = await firstValueFrom(
                        this.natsClient.send({ cmd: 'learning.enrollment.delete' }, { userId, courseId })
                    );

                    if (!deleteResult) {
                        this.logger.warn(`Enrollment deletion returned no data for User ${userId}, Course ${courseId}`);
                    }

                    this.logger.log(`Refund approved and enrollment deleted for User ${userId}, Course ${courseId}.`);
                } catch (error) {
                    this.logger.error(`Error processing refund cancellation: ${error.message}`);
                    // If enrollment not found, we might still want to approve the ticket 
                    // (maybe it was deleted manually or already refunded)
                    if (error.message?.includes('not found')) {
                        this.logger.warn(`Enrollment not found during refund for User ${userId}, Course ${courseId}. Proceeding with ticket approval.`);
                    } else {
                        throw new BadRequestException(`Failed to process enrollment cancellation: ${error.message}`);
                    }
                }
            }
        }

        return this.ticketRepository.updateStatus(id, dto.status, dto.response, handlerId);
    }
}
