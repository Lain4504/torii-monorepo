import type { CourseRun, Prisma } from '@prisma/generated';

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
}
