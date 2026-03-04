import type { CourseRun, CourseRunLesson, CourseRunReview, Prisma } from '@prisma/generated';

export interface ICourseRunRepository {
    /**
     * Find by id.
     */
    findById(id: string): Promise<CourseRun | null>;
    /**
     * Find by slug.
     */
    findBySlug(slug: string): Promise<CourseRun | null>;
    /**
     * Find many.
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.CourseRunWhereInput;
        orderBy?: Prisma.CourseRunOrderByWithRelationInput;
        include?: Prisma.CourseRunInclude;
    }): Promise<CourseRun[]>;
    /**
     * Count data.
     */
    count(where?: Prisma.CourseRunWhereInput): Promise<number>;
    /**
     * Create data.
     */
    create(data: Prisma.CourseRunCreateInput): Promise<CourseRun>;
    /**
     * Update data.
     */
    update(id: string, data: Prisma.CourseRunUpdateInput): Promise<CourseRun>;
    /**
     * Delete data.
     */
    delete(id: string): Promise<void>;
    /**
     * Execute slug exists operation.
     */
    slugExists(slug: string, excludeId?: string): Promise<boolean>;
    /**
     * Find expired enrollment course runs.
     */
    findExpiredEnrollmentCourseRuns(): Promise<CourseRun[]>;

    /**
     * Create a new content review record for a course run.
     */
    createRunReview(data: Prisma.CourseRunReviewCreateInput): Promise<CourseRunReview>;

    /**
     * Update an existing content review record for a course run.
     */
    updateRunReview(id: string, data: Prisma.CourseRunReviewUpdateInput): Promise<CourseRunReview>;

    /**
     * Find course run reviews with optional filtering.
     */
    findRunReviews(where: Prisma.CourseRunReviewWhereInput, orderBy?: Prisma.CourseRunReviewOrderByWithRelationInput): Promise<CourseRunReview[]>;

    /**
     * Bulk-create CourseRunLesson records when initializing a new run.
     */
    createRunLessons(data: Prisma.CourseRunLessonCreateManyInput[]): Promise<void>;

    /**
     * Find all CourseRunLesson records for a given course run.
     */
    findRunLessonsByRun(courseRunId: string): Promise<CourseRunLesson[]>;

    /**
     * Find a specific CourseRunLesson by composite key (courseRunId, lessonId).
     */
    findRunLesson(courseRunId: string, lessonId: string): Promise<CourseRunLesson | null>;

    /**
     * Update a CourseRunLesson identified by (courseRunId, lessonId).
     */
    updateRunLesson(courseRunId: string, lessonId: string, data: Prisma.CourseRunLessonUpdateInput): Promise<CourseRunLesson>;
}
