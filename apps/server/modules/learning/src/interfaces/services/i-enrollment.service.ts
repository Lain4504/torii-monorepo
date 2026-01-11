import type {
    EnrollmentCreateDTO,
    EnrollmentQueryDTO,
    EnrollmentResponseDTO,
    PaginatedResponseDTO,
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
    findOne(id: string): Promise<EnrollmentResponseDTO | null>;

    /**
     * Find enrollment by user and course
     */
    findByUserAndCourse(userId: string, courseId: string): Promise<EnrollmentResponseDTO | null>;

    /**
     * Create a new enrollment
     */
    create(userId: string, input: EnrollmentCreateDTO): Promise<EnrollmentResponseDTO>;

    /**
     * Check if user is enrolled in a course
     */
    isEnrolled(userId: string, courseId: string): Promise<boolean>;

    /**
     * Update enrollment progress
     */
    updateProgress(enrollmentId: string, completionPercentage: number): Promise<EnrollmentResponseDTO>;

    /**
     * Update enrollment order ID (internal use)
     */
    updateOrderId(enrollmentId: string, orderId: string): Promise<void>;
}


