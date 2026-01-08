import type {
    CourseInstructorResponseDTO,
    CourseInstructorAssignDTO,
    CourseInstructorUpdateDTO,
    Requester,
} from '@workspace/schemas';

/**
 * Course Instructor Service Interface
 * Defines the contract for course instructor business logic operations
 */
export interface ICourseInstructorService {
    /**
     * Assign a lecturer to a course
     * @param requester - The user making the request (must be ADMIN or STAFF)
     * @param dto - Assignment data including courseId, lecturerId, and isPrimary flag
     * @returns The created course instructor assignment
     * @throws ForbiddenException if requester doesn't have permission
     * @throws BadRequestException if lecturer is already assigned or doesn't have LECTURER role
     * @throws NotFoundException if course or lecturer not found
     */
    assignLecturer(requester: Requester, dto: CourseInstructorAssignDTO): Promise<CourseInstructorResponseDTO>;

    /**
     * Get all instructors for a course
     * @param courseId - The course' unique identifier
     * @returns Array of course instructor assignments
     * @throws NotFoundException if course not found
     */
    getInstructorsByCourse(courseId: string): Promise<CourseInstructorResponseDTO[]>;

    /**
     * Get all courses assigned to a lecturer
     * @param lecturerId - The lecturer's unique identifier
     * @returns Array of course instructor assignments with course details
     */
    getCoursesByLecturer(lecturerId: string): Promise<CourseInstructorResponseDTO[]>;

    /**
     * Update the primary instructor flag for an assignment
     * @param requester - The user making the request (must be ADMIN or STAFF)
     * @param instructorId - The course instructor assignment ID
     * @param dto - Update data with isPrimary flag
     * @returns The updated course instructor assignment
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if assignment not found
     */
    updatePrimaryInstructor(requester: Requester, instructorId: string, dto: CourseInstructorUpdateDTO): Promise<CourseInstructorResponseDTO>;

    /**
     * Unassign a lecturer from a course
     * @param requester - The user making the request (must be ADMIN or STAFF)
     * @param instructorId - The course instructor assignment ID
     * @returns Success message
     * @throws ForbiddenException if requester doesn't have permission
     * @throws NotFoundException if assignment not found
     */
    unassignLecturer(requester: Requester, instructorId: string): Promise<{ message: string }>;
}
