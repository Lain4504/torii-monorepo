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
 * Standard API Response Format
 * All API responses should follow this format for consistency
 */
export interface StandardApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any[];
}

/**
 * Paginated API Response Format
 * Standard response for paginated endpoints with flattened structure
 * Combines StandardApiResponse with pagination metadata at top level
 */
export interface PaginatedApiResponse<T> extends StandardApiResponse<T[]> {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Paginated Response DTO (for service layer)
 * Service returns data without success field, controller wraps it
 * Data is required (not optional) for service layer
 */
export interface PaginatedResponseDTO<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}