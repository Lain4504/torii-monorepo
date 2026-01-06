import { z } from 'zod';

/**
 * Generic Pagination Options
 * Used across all modules for paginated queries
 */
export const paginationOptionsDTOSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
});

export type PaginationOptionsDTO = z.infer<typeof paginationOptionsDTOSchema>;

/**
 * Generic Paginated Response
 * Standard response structure for all paginated endpoints
 */
export const paginatedResponseDTOSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        data: z.array(itemSchema),
        total: z.number().int(),
        page: z.number().int(),
        limit: z.number().int(),
        totalPages: z.number().int(),
    });

// Alias for backward compatibility
export const paginatedResponseSchema = paginatedResponseDTOSchema;

export type PaginatedResponseDTO<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};
