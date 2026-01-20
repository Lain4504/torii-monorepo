import type {
    CourseResponseDTO,
    CourseCreateDTO,
    CourseUpdateDTO,
    PaginationOptionsDTO,
    PaginatedResponseDTO,
    Requester,
    CourseStatus,
} from '@workspace/schemas';

/**
 * Course Service Interface
 * Defines the contract for course business logic operations
 */
export interface ICourseService {
    /**
     * Find all courses with pagination and search
     * @param options - Pagination options including page, limit, search, status, and jlptLevel
     * @returns Paginated response of courses
     */
    findAll(options: PaginationOptionsDTO & { status?: CourseStatus; jlptLevel?: string; instructorId?: string }): Promise<PaginatedResponseDTO<CourseResponseDTO>>;

    /**
     * Advanced search for clients
     */
    advancedSearch(options: {
        page?: number;
        limit?: number;
        search?: string;
        levels?: string[];
        priceMin?: number;
        priceMax?: number;
        ratingMin?: number;
        sortBy?: string;
    }): Promise<PaginatedResponseDTO<CourseResponseDTO>>;

    /**
     * Find one course by ID
     * @param courseId - The course's unique identifier
     * @returns The course data
     * @throws NotFoundException if course not found
     */
    findOne(courseId: string): Promise<CourseResponseDTO>;

    /**
     * Find course by slug
     * @param slug - The course's slug
     * @returns The course data
     * @throws NotFoundException if course not found
     */
    findBySlug(slug: string): Promise<CourseResponseDTO>;

    /**
     * Create a new course
     * @param requester - The user making the request
     * @param dto - Course creation data
     * @returns The created course
     * @throws BadRequestException if slug already exists
     * @throws ForbiddenException if requester doesn't have permission
     */
    create(requester: Requester, dto: CourseCreateDTO): Promise<CourseResponseDTO>;

    /**
     * Update course
     * @param requester - The user making the request
     * @param courseId - The course's unique identifier
     * @param dto - Course update data
     * @returns The updated course
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    update(requester: Requester, courseId: string, dto: CourseUpdateDTO): Promise<CourseResponseDTO>;

    /**
     * Delete course (soft or hard delete)
     * @param requester - The user making the request
     * @param courseId - The course's unique identifier
     * @param hardDelete - Whether to permanently delete (default: false for soft delete)
     * @returns Success message
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    delete(requester: Requester, courseId: string, hardDelete?: boolean): Promise<{ message: string }>;

    /**
     * Get featured courses
     * @returns Array of featured courses
     */
    getFeatured(): Promise<CourseResponseDTO[]>;

    /**
     * Get courses by type (vod or live)
     * @param type - Course type filter
     * @returns Array of courses
     */
    getByType(type: 'vod' | 'live'): Promise<CourseResponseDTO[]>;

    /**
     * Submit course for review
     * @param requester - The user making the request
     * @param courseId - The course's unique identifier
     * @returns The updated course
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    submitForReview(requester: Requester, courseId: string): Promise<CourseResponseDTO>;
    updateLiveConfig(courseId: string, config: any): Promise<CourseResponseDTO>;

    /**
     * Publish a course
     * @param requester - The user making the request
     * @param courseId - The course's unique identifier
     * @returns The updated course
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    publish(requester: Requester, courseId: string): Promise<CourseResponseDTO>;

    /**
     * Unpublish a course (set to draft)
     * @param requester - The user making the request
     * @param courseId - The course's unique identifier
     * @returns The updated course
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    unpublish(requester: Requester, courseId: string): Promise<CourseResponseDTO>;

    /**
     * Reject a course (set to rejected and add reason)
     * @param requester - The user making the request
     * @param courseId - The course's unique identifier
     * @param reason - Rejection reason
     * @returns The updated course
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    reject(requester: Requester, courseId: string, reason: string): Promise<CourseResponseDTO>;

    /**
     * Get course curriculum (modules with lessons)
     * @param courseId - The course's unique identifier
     * @returns The curriculum data with modules and lessons
     * @throws NotFoundException if course not found
     */
    getCurriculum(courseId: string, userId?: string): Promise<{
        modules: Array<{
            id: string;
            title: string;
            description?: string;
            order: number;
            durationMinutes?: number;
            lessons: Array<{
                id: string;
                title: string;
                contentType: string;
                videoDuration?: number;
                videoUrl?: string; // Add videoUrl here
                order: number;
                isPreview: boolean;
                isUnlocked: boolean;
            }>;
        }>;
    }>;

    /**
     * Recalculate course statistics (totalLessons, totalQuizzes, etc.)
     * @param courseId - The course's unique identifier
     */
    recalculateStats(courseId: string): Promise<void>;

    /**
     * Check if a user is an instructor for a course
     * @param userId - The user's unique identifier
     * @param courseId - The course's unique identifier
     */
    isInstructor(userId: string, courseId: string): Promise<boolean>;

}
