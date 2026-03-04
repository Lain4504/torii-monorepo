import type { CourseMaster, CourseMasterReview, CourseVersion, Prisma } from '@prisma/generated';

/**
 * Course Master Repository Interface
 * Defines the contract for Course Master data access operations
 */
export interface ICourseMasterRepository {
    /**
     * Find course master by ID
     */
    findById(courseMasterId: string): Promise<CourseMaster | null>;

    /**
     * Find course master by slug
     */
    findBySlug(slug: string): Promise<CourseMaster | null>;

    /**
     * Find all course masters with pagination and filtering
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.CourseMasterWhereInput;
        orderBy?: Prisma.CourseMasterOrderByWithRelationInput;
        include?: Prisma.CourseMasterInclude;
    }): Promise<CourseMaster[]>;

    /**
     * Count course masters with optional filter
     */
    count(where?: Prisma.CourseMasterWhereInput): Promise<number>;

    /**
     * Create new course master
     */
    create(data: Prisma.CourseMasterCreateInput): Promise<CourseMaster>;

    /**
     * Update course master by ID
     */
    update(courseMasterId: string, data: Prisma.CourseMasterUpdateInput): Promise<CourseMaster>;

    /**
     * Delete course master (hard delete)
     */
    delete(courseMasterId: string): Promise<void>;

    /**
     * Soft delete course master
     */
    softDelete(courseMasterId: string): Promise<CourseMaster>;

    /**
     * Check if slug exists
     */
    slugExists(slug: string, excludeId?: string): Promise<boolean>;

    /**
     * Find course masters by type (vod or live)
     */
    findByType(type: 'vod' | 'live'): Promise<CourseMaster[]>;

    /**
     * Find featured course masters
     */
    findFeatured(): Promise<CourseMaster[]>;



    /**
     * Get lecturer for a course master
     */
    getLecturer(courseMasterId: string): Promise<any | null>;

    /**
     * Create a new course version snapshot
     */
    createVersion(data: Prisma.CourseVersionCreateInput): Promise<CourseVersion>;

    /**
     * Get the latest published version for a course master
     */
    getLatestVersion(courseMasterId: string): Promise<CourseVersion | null>;

    /**
     * Get all versions for a course master
     */
    getVersions(courseMasterId: string): Promise<CourseVersion[]>;

    /**
     * Get a specific course version by ID
     */
    getVersionById(versionId: string): Promise<CourseVersion | null>;



    /**
     * Count published modules for a course master
     */
    countModules(courseMasterId: string): Promise<number>;

    /**
     * Update course master statistics
     */
    updateStats(courseMasterId: string, stats: { totalLessons: number; totalModules: number; totalQuizzes?: number }): Promise<void>;

    /**
     * Count published lessons for a course master
     */
    countLessons(courseMasterId: string): Promise<number>;

    /**
     * Increment total students for a course master
     */
    incrementTotalStudents(courseMasterId: string): Promise<void>;

    /**
     * Create a new review record for a course master syllabus
     */
    createMasterReview(data: Prisma.CourseMasterReviewCreateInput): Promise<CourseMasterReview>;

    /**
     * Update an existing course master review
     */
    updateMasterReview(id: string, data: Prisma.CourseMasterReviewUpdateInput): Promise<CourseMasterReview>;

    /**
     * List course master reviews with optional filtering and pagination
     */
    findMasterReviews(options: {
        where?: Prisma.CourseMasterReviewWhereInput;
        orderBy?: Prisma.CourseMasterReviewOrderByWithRelationInput;
        skip?: number;
        take?: number;
    }): Promise<CourseMasterReview[]>;

    /**
     * Get the latest review entry for a course master
     */
    getLatestMasterReview(courseMasterId: string): Promise<CourseMasterReview | null>;
}
