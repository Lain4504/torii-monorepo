import { z } from 'zod';
import { ticketSchema, TicketType, TicketStatus } from '../models/ticket.model';
import { paginationOptionsDTOSchema } from './common.dto';

// Create Ticket DTO
export const createTicketDTOSchema = ticketSchema.pick({
    type: true,
    subject: true,
    description: true,
    courseRunId: true,
    metadata: true,
}).extend({
    courseRunId: z.string().uuid().optional(),
    // For REFUND type, we expect originalOrderId in metadata
    metadata: z.object({
        orderId: z.string().uuid().optional(),
    }).catchall(z.any()).optional(),
});

export type CreateTicketDTO = z.infer<typeof createTicketDTOSchema>;

// Update Ticket Status DTO (for Admin)
export const updateTicketStatusDTOSchema = z.object({
    status: z.nativeEnum(TicketStatus),
    response: z.string().optional(),
});

export type UpdateTicketStatusDTO = z.infer<typeof updateTicketStatusDTOSchema>;

// Ticket Query DTO
export const ticketQueryDTOSchema = paginationOptionsDTOSchema.extend({
    type: z.nativeEnum(TicketType).optional(),
    status: z.nativeEnum(TicketStatus).optional(),
    userId: z.string().uuid().optional(),
    courseRunId: z.string().uuid().optional(),
});

export type TicketQueryDTO = z.infer<typeof ticketQueryDTOSchema>;

// Ticket Response DTO
export const ticketResponseDTOSchema = ticketSchema.extend({
    user: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        email: z.string(),
        avatarUrl: z.string().nullable(),
    }).optional(),
    handler: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
    }).optional().nullable(),
});

export type TicketResponseDTO = z.infer<typeof ticketResponseDTOSchema>;
