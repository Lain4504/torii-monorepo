import { z } from 'zod';

export const moduleSchema = z.object({
    id: z.string().uuid(),
    courseId: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().optional(),
    aiMetadata: z.record(z.any()).default({}), // JSONB
    orderIndex: z.number().default(0),
    durationMinutes: z.number().optional(),
    createdBy: z.string().uuid().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional(),
});

export type Module = z.infer<typeof moduleSchema>;
