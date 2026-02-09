import { z } from 'zod';
import { feedSchema } from '../models/feed.model';
import { paginatedResponseSchema } from './common.dto';

export const feedCreateDTOSchema = feedSchema.pick({
    title: true,
    content: true,
    tags: true,
}).extend({
    tags: z.array(z.string()).optional().default([]),
});

export type FeedCreateDTO = z.infer<typeof feedCreateDTOSchema>;

export const feedUpdateDTOSchema = feedSchema.pick({
    title: true,
    content: true,
    tags: true,
}).partial();

export type FeedUpdateDTO = z.infer<typeof feedUpdateDTOSchema>;

export const feedQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    authorId: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type FeedQueryDTO = z.infer<typeof feedQueryDTOSchema>;

export const feedResponseDTOSchema = feedSchema.extend({
    author: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        avatarUrl: z.string().nullable().optional(),
    }).optional(),
    likes: z.number().optional().default(0),
    comments: z.number().optional().default(0), // Count
    isLiked: z.boolean().optional().default(false),
    isFollowingAuthor: z.boolean().optional(),
});

export type FeedResponseDTO = z.infer<typeof feedResponseDTOSchema>;

export const feedPaginatedResponseSchema = paginatedResponseSchema(feedResponseDTOSchema);

export type FeedPaginatedResponse = z.infer<typeof feedPaginatedResponseSchema>;
