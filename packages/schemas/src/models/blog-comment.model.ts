import { z } from 'zod';

export const blogCommentSchema = z.object({
    id: z.string().uuid(),
    postId: z.string().uuid(),
    authorId: z.string().uuid(),
    content: z.string().min(1),
    parentId: z.string().uuid().optional(),
    likeCount: z.number().default(0),
    isEdited: z.boolean().default(false),
    isDeleted: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type BlogComment = z.infer<typeof blogCommentSchema>;
