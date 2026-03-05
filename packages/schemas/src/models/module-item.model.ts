import { z } from 'zod';

export const moduleItemSchema = z.object({
    id: z.string().uuid(),
    moduleId: z.string().uuid(),
    title: z.string().min(1),
    type: z.enum(['lesson', 'quiz', 'assignment']),
    referenceId: z.string().uuid(),
    orderIndex: z.number().default(0),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type ModuleItem = z.infer<typeof moduleItemSchema>;
