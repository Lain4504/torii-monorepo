import type { Course, Prisma } from '@prisma/generated';

/**
 * Course Repository Interface
 * Defines the contract for Course data access operations
 */
export interface ICourseRepository {
    /**
     * Find course by ID
     */
    findById(courseId: string): Promise<Course | null>;

    /**
     * Find course by slug
     */
    findBySlug(slug: string): Promise<Course | null>;

    /**
     * Find all courses with pagination and filtering
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.CourseWhereInput;
        orderBy?: Prisma.CourseOrderByWithRelationInput;
        include?: Prisma.CourseInclude;
    }): Promise<Course[]>;

    /**
     * Count courses with optional filter
     */
    count(where?: Prisma.CourseWhereInput): Promise<number>;

    /**
     * Create new course
     */
    create(data: Prisma.CourseCreateInput): Promise<Course>;

    /**
     * Update course by ID
     */
    update(courseId: string, data: Prisma.CourseUpdateInput): Promise<Course>;

    /**
     * Delete course (hard delete)
     */
    delete(courseId: string): Promise<void>;

    /**
     * Soft delete course
     */
    softDelete(courseId: string): Promise<Course>;

    /**
     * Check if slug exists
     */
    slugExists(slug: string, excludeId?: string): Promise<boolean>;

    /**
     * Find courses by type (vod or live)
     */
    findByType(type: 'vod' | 'live'): Promise<Course[]>;

    /**
     * Find featured courses
     */
    findFeatured(): Promise<Course[]>;

    /**
     * Update course statistics
     */
    updateStats(courseId: string, stats: {
        totalStudents?: number;
        totalLessons?: number;
        totalQuizzes?: number;
        averageRating?: number;
        totalReviews?: number;
    }): Promise<Course>;

    /**
     * Get instructors for a course
     */
    getInstructors(courseId: string): Promise<any[]>;

    /**
     * Count published quizzes for a course
     */
    countQuizzes(courseId: string): Promise<number>;

    /**
     * Count published lessons for a course
     */
    countLessons(courseId: string): Promise<number>;
}
