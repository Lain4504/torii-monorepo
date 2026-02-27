import { Ticket, TicketQueryDTO, CreateTicketDTO } from '@workspace/schemas';

export interface ITicketRepository {
    create(data: CreateTicketDTO & { userId: string }): Promise<Ticket>;
    findById(id: string): Promise<Ticket | null>;
    findAll(query: TicketQueryDTO): Promise<{ data: any[]; total: number }>;
    updateStatus(id: string, status: string, response?: string, handlerId?: string): Promise<Ticket>;
    count(where: any): Promise<number>;
    delete(id: string): Promise<void>;
}
