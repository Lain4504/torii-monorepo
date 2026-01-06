import { z } from 'zod';
import { blogCommentSchema } from '../models/blog-comment.model';
import { paginatedResponseSchema } from './common.dto';

export const blogCommentCreateDTOSchema = blogCommentSchema.pick({
    postId: true,
    authorId: true,
    content: true,
    parentId: true,
});

export type BlogCommentCreateDTO = z.infer<typeof blogCommentCreateDTOSchema>;

export const blogCommentUpdateDTOSchema = blogCommentSchema.pick({
    content: true,
});

export type BlogCommentUpdateDTO = z.infer<typeof blogCommentUpdateDTOSchema>;

export const blogCommentQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    postId: z.string().uuid().optional(),
    parentId: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type BlogCommentQueryDTO = z.infer<typeof blogCommentQueryDTOSchema>;

// Use z.ZodType to handle circular referencing
export const blogCommentResponseDTOSchema: z.ZodType<any> = blogCommentSchema.extend({
    author: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        avatarUrl: z.string().optional(),
    }).optional(),
    replyCount: z.number().optional(),
    replies: z.array(z.lazy(() => blogCommentResponseDTOSchema)).optional(),
});

export type BlogCommentResponseDTO = z.infer<typeof blogCommentResponseDTOSchema>;

export const blogCommentPaginatedResponseSchema = paginatedResponseSchema(blogCommentResponseDTOSchema);

export type BlogCommentPaginatedResponse = z.infer<typeof blogCommentPaginatedResponseSchema>;
