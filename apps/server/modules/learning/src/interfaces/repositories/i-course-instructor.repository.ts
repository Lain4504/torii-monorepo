import type { CourseInstructor, Prisma } from '@prisma/generated';

/**
 * Course Instructor Repository Interface
 * Defines the contract for Course Instructor data access operations
 */
export interface ICourseInstructorRepository {
    /**
     * Find course instructor assignment by ID
     */
    findById(id: string): Promise<CourseInstructor | null>;

    /**
     * Find all instructors for a course
     */
    findByCourseId(courseId: string): Promise<CourseInstructor[]>;

    /**
     * Find all courses for a lecturer
     */
    findByLecturerId(lecturerId: string): Promise<CourseInstructor[]>;

    /**
     * Check if lecturer is assigned to a course
     */
    checkAssignment(courseId: string, lecturerId: string): Promise<boolean>;

    /**
     * Assign lecturer to course
     */
    assign(data: Prisma.CourseInstructorCreateInput): Promise<CourseInstructor>;

    /**
     * Update primary instructor flag
     */
    updatePrimary(id: string, isPrimary: boolean): Promise<CourseInstructor>;

    /**
     * Update instructor assignment
     */
    update(id: string, data: Prisma.CourseInstructorUpdateInput): Promise<CourseInstructor>;

    /**
     * Unassign lecturer from course
     */
    unassign(id: string): Promise<void>;

    /**
     * Count unique lecturers in the system
     */
    countUniqueLecturers(): Promise<number>;
}
