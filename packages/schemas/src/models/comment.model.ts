import { z } from 'zod';

export const commentSchema = z.object({
    id: z.string().uuid(),
    postId: z.string().uuid().optional().nullable(),
    qaId: z.string().uuid().optional().nullable(),
    userId: z.string().uuid(),
    parentCommentId: z.string().uuid().optional().nullable(),
    content: z.string().min(1),
    status: z.string().default('approved'),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Comment = z.infer<typeof commentSchema>;

