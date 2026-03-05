import type {
    LessonResponseDTO,
    LessonCreateDTO,
    LessonUpdateDTO,
    PaginationOptionsDTO,
    PaginatedResponseDTO,
    Requester,
    LessonQueryDTO,
} from '@workspace/schemas';

/**
 * Lesson Service Interface
 * Defines the contract for lesson business logic operations
 */
export interface ILessonService {
    /**
     * Find all lessons with pagination and search
     * @param options - Pagination options including page, limit, and search
     * @returns Paginated response of lessons
     */
    findAll(options: PaginationOptionsDTO): Promise<PaginatedResponseDTO<LessonResponseDTO>>;

    /**
     * Search lessons with complex filters
     * @param options - Search filters and pagination
     * @returns Paginated response of lessons
     */
    search(options: LessonQueryDTO): Promise<PaginatedResponseDTO<LessonResponseDTO>>;

    /**
     * Find one lesson by ID
     * @param lessonId - The lesson's unique identifier
     * @returns The lesson data
     * @throws NotFoundException if lesson not found
     */
    findById(lessonId: string, requester?: Requester): Promise<LessonResponseDTO>;

    /**
     * Find all lessons for a specific module
     * @param moduleId - The module's unique identifier
     * @returns Array of lessons
     */
    findByModuleId(moduleId: string, requester?: Requester): Promise<LessonResponseDTO[]>;

    /**
     * Find preview lessons for a course
     * @param courseMasterId - The course's unique identifier
     * @returns Array of preview lessons
     */
    findPreviewLessonsByCourseId(courseMasterId: string): Promise<LessonResponseDTO[]>;

    /**
     * Create a new lesson
     * @param requester - The user making the request
     * @param dto - Lesson creation data
     * @returns The created lesson
     * @throws ForbiddenException if requester doesn't have permission
     */
    create(requester: Requester, dto: LessonCreateDTO): Promise<LessonResponseDTO>;

    /**
     * Update lesson
     * @param requester - The user making the request
     * @param lessonId - The lesson's unique identifier
     * @param dto - Lesson update data
     * @returns The updated lesson
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if lesson not found
     */
    update(requester: Requester, lessonId: string, dto: LessonUpdateDTO): Promise<LessonResponseDTO>;

    /**
     * Delete lesson (soft or hard delete)
     * @param requester - The user making the request
     * @param lessonId - The lesson's unique identifier
     * @param hardDelete - Whether to permanently delete (default: false for soft delete)
     * @returns Success message
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if lesson not found
     */
    delete(requester: Requester, lessonId: string, hardDelete?: boolean): Promise<{ message: string }>;
}
