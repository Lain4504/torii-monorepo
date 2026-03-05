import type { ModuleItem, Prisma } from '@prisma/generated';

/**
 * Module Item Repository Interface
 * Defines the contract for ModuleItem data access operations
 */
export interface IModuleItemRepository {
    /**
     * Find item by ID
     */
    findById(itemId: string): Promise<ModuleItem | null>;

    /**
     * Find all items for a module
     */
    findByModuleId(moduleId: string): Promise<ModuleItem[]>;

    /**
     * Create new module item
     */
    create(data: Prisma.ModuleItemCreateInput): Promise<ModuleItem>;

    /**
     * Bulk create module items
     */
    createMany(data: Prisma.ModuleItemCreateManyInput[]): Promise<void>;

    /**
     * Update item by ID
     */
    update(itemId: string, data: Prisma.ModuleItemUpdateInput): Promise<ModuleItem>;

    /**
     * Delete item
     */
    delete(itemId: string): Promise<void>;

    /**
     * Reorder items in a module
     */
    reorder(moduleId: string, itemOrders: { id: string; orderIndex: number }[]): Promise<void>;

    /**
     * Get max order index for module items
     */
    getMaxOrderIndex(moduleId: string): Promise<number>;
}
