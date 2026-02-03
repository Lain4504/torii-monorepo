import { z } from 'zod';

export const qaSchema = z.object({
    id: z.string().uuid(),
    title: z.string().max(255).optional().nullable(),
    content: z.string().min(1),
    authorId: z.string().uuid(),
    tags: z.array(z.string()).default([]),
    viewCount: z.number().int().default(0),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type QA = z.infer<typeof qaSchema>;
