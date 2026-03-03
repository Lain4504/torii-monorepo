import { z } from 'zod';
import { reviewSchema } from '../models/review.model';

// Review with user info for response
export const reviewResponseDTOSchema = reviewSchema.extend({
    user: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        avatarUrl: z.string().optional().nullable(),
    }),
});

export type ReviewResponseDTO = z.infer<typeof reviewResponseDTOSchema>;

// Create Review DTO
export const reviewCreateDTOSchema = z.object({
    courseRunId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
});

export type ReviewCreateDTO = z.infer<typeof reviewCreateDTOSchema>;

// Query Reviews DTO
export const reviewQueryDTOSchema = z.object({
    courseMasterId: z.string().uuid().optional(),
    courseRunId: z.string().uuid().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
});

export type ReviewQueryDTO = z.infer<typeof reviewQueryDTOSchema>;

// Paginated Review Response
export const paginatedReviewResponseDTOSchema = z.object({
    data: z.array(reviewResponseDTOSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export type PaginatedReviewResponseDTO = z.infer<typeof paginatedReviewResponseDTOSchema>;

// Rating Distribution Response
export const ratingDistributionDTOSchema = z.object({
    courseMasterId: z.string().uuid(),
    courseRunId: z.string().uuid().optional(),
    distribution: z.array(z.object({
        stars: z.number().int().min(1).max(5),
        count: z.number(),
        percent: z.number(),
    })),
    averageRating: z.number(),
    totalReviews: z.number(),
});

export type RatingDistributionDTO = z.infer<typeof ratingDistributionDTOSchema>;




