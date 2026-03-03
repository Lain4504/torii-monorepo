import type { Module as CourseMasterModule, Prisma } from '@prisma/generated';

/**
 * Module Repository Interface
 * Defines the contract for Module data access operations
 */
export interface IModuleRepository {
    /**
     * Find module by ID
     */
    findById(moduleId: string): Promise<CourseMasterModule | null>;

    /**
     * Find all modules for a course
     */
    findByCourseId(courseMasterId: string, includeDrafts?: boolean): Promise<CourseMasterModule[]>;

    /**
     * Find all modules with pagination and filtering
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.ModuleWhereInput;
        orderBy?: Prisma.ModuleOrderByWithRelationInput;
        include?: Prisma.ModuleInclude;
    }): Promise<CourseMasterModule[]>;

    /**
     * Count modules with optional filter
     */
    count(where?: Prisma.ModuleWhereInput): Promise<number>;

    /**
     * Create new module
     */
    create(data: Prisma.ModuleCreateInput): Promise<CourseMasterModule>;

    /**
     * Update module by ID
     */
    update(moduleId: string, data: Prisma.ModuleUpdateInput): Promise<CourseMasterModule>;

    /**
     * Delete module (hard delete)
     */
    delete(moduleId: string): Promise<void>;

    /**
     * Soft delete module
     */
    softDelete(moduleId: string): Promise<CourseMasterModule>;

    /**
     * Reorder modules in a course
     */
    reorder(courseMasterId: string, moduleOrders: { id: string; orderIndex: number }[]): Promise<void>;

    /**
     * Get max order index for a course
     */
    getMaxOrderIndex(courseMasterId: string): Promise<number>;
}
