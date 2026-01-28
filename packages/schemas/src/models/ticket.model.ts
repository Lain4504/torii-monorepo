import { z } from 'zod';

export enum TicketType {
    REFUND = 'REFUND',
    SUPPORT = 'SUPPORT',
    ERROR_REPORT = 'ERROR_REPORT',
}

export enum TicketStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export const ticketSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    handlerId: z.string().uuid().optional().nullable(),
    type: z.nativeEnum(TicketType),
    status: z.nativeEnum(TicketStatus),
    subject: z.string().min(1).max(255),
    description: z.string().min(1),
    metadata: z.record(z.any()).optional().nullable(),
    response: z.string().optional().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Ticket = z.infer<typeof ticketSchema>;
