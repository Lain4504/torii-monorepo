export class PaginationMetaDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export class ApiResponseDto<T> {
    success: boolean;
    message: string;
    error?: string;
    data: T;
}

export class PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
    meta: PaginationMetaDto;
}
