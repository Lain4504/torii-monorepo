import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TICKET_SERVICE_TOKEN } from '@server/communication/interfaces/services';
import { ITicketService } from '@server/communication/interfaces/services';
import {
  CreateTicketDTO,
  TicketQueryDTO,
  UpdateTicketStatusDTO,
  TicketStatus,
} from '@workspace/schemas';

@Controller()
export class TicketHandler {
  constructor(
    @Inject(TICKET_SERVICE_TOKEN)
    private readonly ticketService: ITicketService,
  ) {}

  @MessagePattern({ cmd: 'communication.ticket.create' })
  async createTicket(
    @Payload() payload: { userId: string; dto: CreateTicketDTO },
  ) {
    return this.ticketService.createTicket(payload.userId, payload.dto);
  }

  @MessagePattern({ cmd: 'communication.ticket.findAll' })
  async getTickets(@Payload() query: TicketQueryDTO) {
    return this.ticketService.getTickets(query);
  }

  @MessagePattern({ cmd: 'communication.ticket.findById' })
  async getTicketById(@Payload() payload: { id: string }) {
    return this.ticketService.getTicketById(payload.id);
  }

  @MessagePattern({ cmd: 'communication.ticket.updateStatus' })
  async updateTicketStatus(
    @Payload()
    payload: {
      id: string;
      handlerId: string;
      dto: UpdateTicketStatusDTO;
    },
  ) {
    return this.ticketService.updateTicketStatus(
      payload.id,
      payload.handlerId,
      payload.dto,
    );
  }

  @MessagePattern({ cmd: 'communication.analytics.tickets' })
  async getTicketStats() {
    return this.ticketService.getTicketStats();
  }

  @MessagePattern({ cmd: 'communication.ticket.delete' })
  async deleteTicket(@Payload() payload: { id: string; userId: string }) {
    return this.ticketService.deleteTicket(payload.id, payload.userId);
  }
}
