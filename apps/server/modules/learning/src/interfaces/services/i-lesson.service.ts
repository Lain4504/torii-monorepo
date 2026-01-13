import type {
    LessonResponseDTO,
    LessonCreateDTO,
    LessonUpdateDTO,
    PaginationOptionsDTO,
    PaginatedResponseDTO,
    Requester,
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
     * Find one lesson by ID
     * @param lessonId - The lesson's unique identifier
     * @returns The lesson data
     * @throws NotFoundException if lesson not found
     */
    findOne(lessonId: string): Promise<LessonResponseDTO>;

    /**
     * Find all lessons for a specific module
     * @param moduleId - The module's unique identifier
     * @returns Array of lessons ordered by orderIndex
     */
    findByModuleId(moduleId: string, requester?: Requester): Promise<LessonResponseDTO[]>;

    /**
     * Find preview lessons for a course
     * @param courseId - The course's unique identifier
     * @returns Array of preview lessons
     */
    findPreviewLessonsByCourseId(courseId: string): Promise<LessonResponseDTO[]>;

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

    /**
     * Reorder lessons within a module
     * @param requester - The user making the request
     * @param moduleId - The module's unique identifier
     * @param lessonOrders - Array of lesson IDs with their new order indices
     * @returns Success message
     * @throws ForbiddenException if requester doesn't have permission
     */
    reorder(
        requester: Requester,
        moduleId: string,
        lessonOrders: { id: string; orderIndex: number }[]
    ): Promise<{ message: string }>;
}
