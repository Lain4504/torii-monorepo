import { z } from 'zod';
import { PostStatus, postSchema } from '../models/post.model';
import { paginatedResponseSchema } from './common.dto';

export const postCreateDTOSchema = postSchema
    .pick({
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImageUrl: true,
        authorId: true,
        status: true,
        publishedAt: true,
        seoTitle: true,
        seoDescription: true,
        tags: true,
    })
    .partial({
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        status: true,
        publishedAt: true,
        seoTitle: true,
        seoDescription: true,
        tags: true,
    });

export type PostCreateDTO = z.infer<typeof postCreateDTOSchema>;

export const postUpdateDTOSchema = postCreateDTOSchema.partial().omit({ authorId: true });

export type PostUpdateDTO = z.infer<typeof postUpdateDTOSchema>;

export const postQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.nativeEnum(PostStatus).optional(),
    authorId: z.string().uuid().optional(),
    tagId: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type PostQueryDTO = z.infer<typeof postQueryDTOSchema>;

export const postResponseDTOSchema = postSchema.extend({
    author: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        avatarUrl: z.string().optional(),
    }).optional(),
});

export type PostResponseDTO = z.infer<typeof postResponseDTOSchema>;

export const postPaginatedResponseSchema = paginatedResponseSchema(postResponseDTOSchema);

export type PostPaginatedResponse = z.infer<typeof postPaginatedResponseSchema>;

export const uploadImageBase64DTOSchema = z.object({
    imageData: z.string().min(1),
    filename: z.string().optional(),
    contentType: z.string().optional(),
    ownerId: z.string().optional(),
});

export type UploadImageBase64DTO = z.infer<typeof uploadImageBase64DTOSchema>;
