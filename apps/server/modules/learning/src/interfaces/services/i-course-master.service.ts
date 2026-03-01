import type {
    CourseMasterResponseDTO,
    CourseMasterCreateDTO,
    CourseMasterUpdateDTO,
    PaginationOptionsDTO,
    PaginatedResponseDTO,
    Requester,
    CourseMasterStatus,
} from '@workspace/schemas';

/**
 * Course Master Service Interface
 * Defines the contract for course master business logic operations
 */
export interface ICourseMasterService {
    /**
     * Find all courses with pagination and search
     * @param options - Pagination options including page, limit, search, status, and jlptLevel
     * @returns Paginated response of courses
     */
    findAll(options: PaginationOptionsDTO & { status?: CourseMasterStatus; jlptLevel?: string; instructorId?: string }): Promise<PaginatedResponseDTO<CourseMasterResponseDTO>>;

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
    }): Promise<PaginatedResponseDTO<CourseMasterResponseDTO>>;

    /**
     * Find one course by ID
     * @param courseMasterId - The course's unique identifier
     * @returns The course data
     * @throws NotFoundException if course not found
     */
    findById(courseMasterId: string): Promise<CourseMasterResponseDTO>;

    /**
     * Find course by slug
     * @param slug - The course's slug
     * @returns The course data
     * @throws NotFoundException if course not found
     */
    findBySlug(slug: string): Promise<CourseMasterResponseDTO>;

    /**
     * Create a new course
     * @param requester - The user making the request
     * @param dto - Course creation data
     * @returns The created course
     * @throws BadRequestException if slug already exists
     * @throws ForbiddenException if requester doesn't have permission
     */
    create(requester: Requester, dto: CourseMasterCreateDTO): Promise<CourseMasterResponseDTO>;

    /**
     * Update course
     * @param requester - The user making the request
     * @param courseMasterId - The course's unique identifier
     * @param dto - Course update data
     * @returns The updated course
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    update(requester: Requester, courseMasterId: string, dto: CourseMasterUpdateDTO): Promise<CourseMasterResponseDTO>;

    /**
     * Delete course (soft or hard delete)
     * @param requester - The user making the request
     * @param courseMasterId - The course's unique identifier
     * @param hardDelete - Whether to permanently delete (default: false for soft delete)
     * @returns Success message
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    delete(requester: Requester, courseMasterId: string, hardDelete?: boolean): Promise<{ message: string }>;

    /**
     * Get featured courses
     * @returns Array of featured courses
     */
    getFeatured(): Promise<CourseMasterResponseDTO[]>;

    /**
     * Get courses by type (vod or live)
     * @param type - Course type filter
     * @returns Array of courses
     */
    getByType(type: 'vod' | 'live'): Promise<CourseMasterResponseDTO[]>;

    /**
     * Submit course for review
     * @param requester - The user making the request
     * @param courseMasterId - The course's unique identifier
     * @returns The updated course
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    submitForReview(requester: Requester, courseMasterId: string): Promise<CourseMasterResponseDTO>;

    /**
     * Update livestream configuration. Caller must have course.publish or be an instructor assigned to the course.
     */
    updateLiveConfig(requester: Requester, courseMasterId: string, config: any): Promise<CourseMasterResponseDTO>;

    /**
     * Publish a course
     * @param requester - The user making the request
     * @param courseMasterId - The course's unique identifier
     * @returns The updated course
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    publish(requester: Requester, courseMasterId: string): Promise<CourseMasterResponseDTO>;

    /**
     * Unpublish a course (set to draft)
     * @param requester - The user making the request
     * @param courseMasterId - The course's unique identifier
     * @returns The updated course
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    unpublish(requester: Requester, courseMasterId: string): Promise<CourseMasterResponseDTO>;

    /**
     * Reject a course (set to rejected and add reason)
     * @param requester - The user making the request
     * @param courseMasterId - The course's unique identifier
     * @param reason - Rejection reason
     * @returns The updated course
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if course not found
     */
    reject(requester: Requester, courseMasterId: string, reason: string): Promise<CourseMasterResponseDTO>;

    /**
     * Get course curriculum (modules with lessons)
     * @param courseMasterId - The course's unique identifier
     * @param requester - The user making the request
     * @returns The curriculum data with modules and lessons
     * @throws NotFoundException if course not found
     */
    getCurriculum(courseMasterId: string, requester?: Requester): Promise<{
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
     * @param courseMasterId - The course's unique identifier
     */
    recalculateStats(courseMasterId: string): Promise<void>;

    /**
     * Validate if a course is ready for scheduling
     * @param courseMasterId - The course's unique identifier
     * @returns Boolean indicating if course is ready and validation message
     */
    validateForScheduling(courseMasterId: string): Promise<{ isReady: boolean; message?: string }>;

    /**
     * Check if a user is an instructor for a course
     * @param userId - The user's unique identifier
     * @param courseMasterId - The course's unique identifier
     */
    isInstructor(userId: string, courseMasterId: string): Promise<boolean>;

    /**
     * Get the number of students enrolled in a course
     * @param courseMasterId - The course's unique identifier
     * @returns The number of students
     */
    getStudentCount(courseMasterId: string): Promise<{ count: number }>;
}
