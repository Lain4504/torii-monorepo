import { Ticket, TicketQueryDTO, CreateTicketDTO, UpdateTicketStatusDTO } from '@workspace/schemas';

export interface ITicketRepository {
    create(data: CreateTicketDTO & { userId: string }): Promise<Ticket>;
    findById(id: string): Promise<Ticket | null>;
    findAll(query: TicketQueryDTO): Promise<{ data: any[]; total: number }>;
    updateStatus(id: string, status: string, response?: string, handlerId?: string): Promise<Ticket>;
}
