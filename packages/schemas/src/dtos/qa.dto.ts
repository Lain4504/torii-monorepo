import { z } from 'zod';
import { qaSchema } from '../models/qa.model';
import { paginatedResponseSchema } from './common.dto';

export const qaCreateDTOSchema = qaSchema.pick({
    title: true,
    content: true,
    tags: true,
}).extend({
    tags: z.array(z.string()).optional().default([]),
});

export type QACreateDTO = z.infer<typeof qaCreateDTOSchema>;

export const qaUpdateDTOSchema = qaSchema.pick({
    title: true,
    content: true,
    tags: true,
}).partial();

export type QAUpdateDTO = z.infer<typeof qaUpdateDTOSchema>;

export const qaQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    authorId: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type QAQueryDTO = z.infer<typeof qaQueryDTOSchema>;

export const qaResponseDTOSchema = qaSchema.extend({
    author: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        avatarUrl: z.string().nullable().optional(),
    }).optional(),
    likes: z.number().optional().default(0),
    comments: z.number().optional().default(0), // Count
    isLiked: z.boolean().optional().default(false),
});

export type QAResponseDTO = z.infer<typeof qaResponseDTOSchema>;

export const qaPaginatedResponseSchema = paginatedResponseSchema(qaResponseDTOSchema);

export type QAPaginatedResponse = z.infer<typeof qaPaginatedResponseSchema>;
