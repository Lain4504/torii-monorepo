import { z } from 'zod';

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        data: z.array(dataSchema),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
    });
