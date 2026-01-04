import { z } from 'zod';
import { BlogPostStatus, blogPostSchema } from '../models/blog.model';
import { paginatedResponseSchema } from '../interfaces/common.interface';

export const blogPostCreateDTOSchema = blogPostSchema
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

export type BlogPostCreateDTO = z.infer<typeof blogPostCreateDTOSchema>;

export const blogPostUpdateDTOSchema = blogPostCreateDTOSchema.partial().omit({ authorId: true });

export type BlogPostUpdateDTO = z.infer<typeof blogPostUpdateDTOSchema>;

export const blogPostQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.nativeEnum(BlogPostStatus).optional(),
    authorId: z.string().uuid().optional(),
    tagId: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type BlogPostQueryDTO = z.infer<typeof blogPostQueryDTOSchema>;

export const blogPostResponseDTOSchema = blogPostSchema.extend({
    author: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        avatarUrl: z.string().optional(),
    }).optional(),
});

export type BlogPostResponseDTO = z.infer<typeof blogPostResponseDTOSchema>;

export const blogPostPaginatedResponseSchema = paginatedResponseSchema(blogPostResponseDTOSchema);

export type BlogPostPaginatedResponse = z.infer<typeof blogPostPaginatedResponseSchema>;

export const uploadImageBase64DTOSchema = z.object({
    imageData: z.string().min(1),
    filename: z.string().optional(),
    contentType: z.string().optional(),
    ownerId: z.string().optional(),
});

export type UploadImageBase64DTO = z.infer<typeof uploadImageBase64DTOSchema>;
