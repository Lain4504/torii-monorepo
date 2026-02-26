import { Ticket, TicketQueryDTO, CreateTicketDTO, UpdateTicketStatusDTO, PaginatedResponseDTO } from '@workspace/schemas';

export interface ITicketService {
    createTicket(userId: string, dto: CreateTicketDTO): Promise<Ticket>;
    getTicketById(id: string): Promise<Ticket>;
    getTickets(query: TicketQueryDTO): Promise<PaginatedResponseDTO<Ticket>>;
    updateTicketStatus(id: string, handlerId: string, dto: UpdateTicketStatusDTO): Promise<Ticket>;
    getTicketStats(): Promise<{ pendingCount: number; refundCount: number; totalCount: number }>;
}
