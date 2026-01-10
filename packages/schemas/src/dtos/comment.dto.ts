import { z } from 'zod';
import { commentSchema } from '../models/comment.model';
import { paginatedResponseSchema } from './common.dto';

export const commentCreateDTOSchema = commentSchema.pick({
    postId: true,
    userId: true,
    content: true,
    parentCommentId: true,
}).extend({
    authorId: z.string().uuid().optional(), // Alias for userId for backward compatibility
    parentId: z.string().uuid().optional(), // Alias for parentCommentId
});

export type CommentCreateDTO = z.infer<typeof commentCreateDTOSchema>;

export const commentUpdateDTOSchema = commentSchema.pick({
    content: true,
});

export type CommentUpdateDTO = z.infer<typeof commentUpdateDTOSchema>;

export const commentQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    postId: z.string().uuid().optional(),
    parentId: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CommentQueryDTO = z.infer<typeof commentQueryDTOSchema>;

// Use z.ZodType to handle circular referencing
export const commentResponseDTOSchema: z.ZodType<any> = commentSchema.extend({
    author: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        avatarUrl: z.string().optional(),
    }).optional(),
    replyCount: z.number().optional(),
    replies: z.array(z.lazy(() => commentResponseDTOSchema)).optional(),
});

export type CommentResponseDTO = z.infer<typeof commentResponseDTOSchema>;

export const commentPaginatedResponseSchema = paginatedResponseSchema(commentResponseDTOSchema);

export type CommentPaginatedResponse = z.infer<typeof commentPaginatedResponseSchema>;
