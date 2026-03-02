import type {
    EnrollmentCreateDTO,
    EnrollmentQueryDTO,
    EnrollmentResponseDTO,
    PaginatedResponseDTO,
    TrialEnrollmentCreateDTO,
    Requester,
} from '@workspace/schemas';

/**
 * Enrollment Service Interface
 * Defines the contract for enrollment business logic operations
 */
export interface IEnrollmentService {
    /**
     * Find all enrollments with pagination and filters
     */
    findAll(query: EnrollmentQueryDTO): Promise<PaginatedResponseDTO<EnrollmentResponseDTO>>;

    /**
     * Find enrollment by ID
     */
    findById(id: string): Promise<EnrollmentResponseDTO | null>;

    /**
     * Find enrollment by user and course run
     */
    findByUserAndCourseRun(userId: string, courseRunId: string): Promise<EnrollmentResponseDTO | null>;

    /**
     * Find any active enrollment by user and course master
     */
    findByUserAndCourseMaster(userId: string, courseMasterId: string): Promise<EnrollmentResponseDTO | null>;

    /**
     * Find all enrollments by user and course master
     */
    findAllByUserAndCourseMaster(userId: string, courseMasterId: string): Promise<EnrollmentResponseDTO[]>;

    /**
     * Check enrollment details including version update info
     */
    checkEnrollmentDetails(userId: string, courseRunId: string): Promise<{ isEnrolled: boolean; enrollment: EnrollmentResponseDTO | null; hasNewerVersion: boolean }>;

    /**
     * Create a new enrollment
     */
    create(userId: string, input: EnrollmentCreateDTO): Promise<EnrollmentResponseDTO>;

    /**
     * Create a new trial enrollment
     */
    createTrial(userId: string, input: TrialEnrollmentCreateDTO): Promise<EnrollmentResponseDTO>;

    /**
     * Check if user has access to a course or specific lesson (handling trial logic)
     */
    checkAccess(userId: string, courseMasterId: string, lessonId?: string): Promise<boolean>;

    /**
     * Get list of accessible lesson IDs for a user in a course
     * Returns 'ALL' if full access, or array of lesson IDs if limited (e.g. trial)
     */
    getAccessibleLessonIds(userId: string, courseMasterId: string): Promise<string[] | 'ALL'>;

    /**
     * Check if user is enrolled in a course
     */
    isEnrolled(userId: string, courseMasterId: string): Promise<boolean>;

    /**
     * Update enrollment progress
     */
    updateProgress(enrollmentId: string, completionPercentage: number): Promise<EnrollmentResponseDTO>;

    /**
     * Update enrollment order ID (internal use)
     */
    /**
     * Update enrollment order ID (internal use)
     */
    updateOrderId(enrollmentId: string, orderId: string): Promise<EnrollmentResponseDTO>;

    /**
     * Delete enrollment by user and course run
     */
    deleteByUserAndCourseRun(userId: string, courseRunId: string): Promise<EnrollmentResponseDTO>;

    /**
     * Activate enrollment (switch from PENDING_PAYMENT to IN_PROGRESS)
     */
    activateEnrollment(enrollmentId: string): Promise<EnrollmentResponseDTO>;

    /**
     * Upgrade enrollment to the latest course version
     */
    upgradeVersion(userId: string, courseMasterId: string): Promise<EnrollmentResponseDTO>;
}


