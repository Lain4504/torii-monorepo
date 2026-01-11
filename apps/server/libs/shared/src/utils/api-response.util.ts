/**
 * Standard API Response Format
 * 
 * All API responses should follow this format for consistency
 */

export interface StandardApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any[];
}

/**
 * Create a success response
 * @param data - Response data
 * @param message - Optional success message
 */
export function successResponse<T>(data: T, message?: string): StandardApiResponse<T> {
    const response: StandardApiResponse<T> = {
        success: true,
        data,
    };

    if (message) {
        response.message = message;
    }

    return response;
}

/**
 * Create an error response
 * @param message - Error message
 * @param errors - Optional detailed errors (for validation)
 */
export function errorResponse(message: string, errors?: any[]): StandardApiResponse {
    const response: StandardApiResponse = {
        success: false,
        message,
    };

    if (errors && errors.length > 0) {
        response.errors = errors;
    }

    return response;
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
 * Create a success response for paginated data
 * Flattens pagination fields to top level to avoid nested data structure
 * @param data - Array of items
 * @param total - Total count
 * @param page - Current page
 * @param limit - Items per page
 * @param totalPages - Total pages
 * @param message - Optional success message
 */
export function successPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    message?: string
): PaginatedApiResponse<T> {
    const response: PaginatedApiResponse<T> = {
        success: true,
        data,
        total,
        page,
        limit,
        totalPages,
    };

    if (message) {
        response.message = message;
    }

    return response;
}