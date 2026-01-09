import type { Module as CourseModule, Prisma } from '@prisma/generated';

/**
 * Module Repository Interface
 * Defines the contract for Module data access operations
 */
export interface IModuleRepository {
    /**
     * Find module by ID
     */
    findById(moduleId: string): Promise<CourseModule | null>;

    /**
     * Find all modules for a course
     */
    findByCourseId(courseId: string): Promise<CourseModule[]>;

    /**
     * Find all modules with pagination and filtering
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.ModuleWhereInput;
        orderBy?: Prisma.ModuleOrderByWithRelationInput;
        include?: Prisma.ModuleInclude;
    }): Promise<CourseModule[]>;

    /**
     * Count modules with optional filter
     */
    count(where?: Prisma.ModuleWhereInput): Promise<number>;

    /**
     * Create new module
     */
    create(data: Prisma.ModuleCreateInput): Promise<CourseModule>;

    /**
     * Update module by ID
     */
    update(moduleId: string, data: Prisma.ModuleUpdateInput): Promise<CourseModule>;

    /**
     * Delete module (hard delete)
     */
    delete(moduleId: string): Promise<void>;

    /**
     * Soft delete module
     */
    softDelete(moduleId: string): Promise<CourseModule>;

    /**
     * Reorder modules in a course
     */
    reorder(courseId: string, moduleOrders: { id: string; orderIndex: number }[]): Promise<void>;

    /**
     * Get max order index for a course
     */
    getMaxOrderIndex(courseId: string): Promise<number>;
}
