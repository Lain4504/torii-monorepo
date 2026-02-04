import { z } from 'zod';

export enum PostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

export const postSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    slug: z.string().min(1),
    excerpt: z.string().optional(),
    content: z.string().min(1),
    coverImageUrl: z.string().optional(),
    authorId: z.string().uuid(),
    status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
    publishedAt: z.coerce.date().optional(),
    viewCount: z.number().default(0),
    commentCount: z.number().default(0),
    tags: z.array(z.string()).default([]),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Post = z.infer<typeof postSchema>;
