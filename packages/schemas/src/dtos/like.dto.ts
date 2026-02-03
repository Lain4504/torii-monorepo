import { z } from 'zod';

// Post Like DTOs
export const postLikeDTOSchema = z.object({
    postId: z.string().uuid(),
    userId: z.string().uuid(),
});

export type PostLikeDTO = z.infer<typeof postLikeDTOSchema>;

export const postLikeResponseDTOSchema = z.object({
    id: z.string().uuid(),
    postId: z.string().uuid(),
    userId: z.string().uuid(),
    createdAt: z.date(),
});

export type PostLikeResponseDTO = z.infer<typeof postLikeResponseDTOSchema>;

// Comment Like DTOs
export const commentLikeDTOSchema = z.object({
    commentId: z.string().uuid(),
    userId: z.string().uuid(),
});

export type CommentLikeDTO = z.infer<typeof commentLikeDTOSchema>;

export const commentLikeResponseDTOSchema = z.object({
    id: z.string().uuid(),
    commentId: z.string().uuid(),
    userId: z.string().uuid(),
    createdAt: z.date(),
});

export type CommentLikeResponseDTO = z.infer<typeof commentLikeResponseDTOSchema>;
