import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { ModuleItem, Prisma } from '@prisma/generated';
import type { IModuleItemRepository } from '@server/learning/interfaces/repositories';

/**
 * Module Item Repository
 * Handles all database operations for ModuleItem entity
 */
@Injectable()
export class ModuleItemRepository implements IModuleItemRepository {
    private readonly logger = new Logger(ModuleItemRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find item by ID
     */
    async findById(itemId: string): Promise<ModuleItem | null> {
        return this.prisma.moduleItem.findUnique({
            where: { id: itemId },
        });
    }

    /**
     * Find all items for a module
     */
    async findByModuleId(moduleId: string): Promise<ModuleItem[]> {
        return this.prisma.moduleItem.findMany({
            where: { moduleId },
            orderBy: { orderIndex: 'asc' },
        });
    }

    /**
     * Create new module item
     */
    async create(data: Prisma.ModuleItemCreateInput): Promise<ModuleItem> {
        return this.prisma.moduleItem.create({ data });
    }

    /**
     * Bulk create module items
     */
    async createMany(data: Prisma.ModuleItemCreateManyInput[]): Promise<void> {
        await this.prisma.moduleItem.createMany({ data });
    }

    /**
     * Update item by ID
     */
    async update(itemId: string, data: Prisma.ModuleItemUpdateInput): Promise<ModuleItem> {
        return this.prisma.moduleItem.update({
            where: { id: itemId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Delete item
     */
    async delete(itemId: string): Promise<void> {
        await this.prisma.moduleItem.delete({
            where: { id: itemId },
        });
    }

    /**
     * Reorder items in a module
     */
    async reorder(moduleId: string, itemOrders: { id: string; orderIndex: number }[]): Promise<void> {
        await this.prisma.$transaction(
            itemOrders.map(({ id, orderIndex }) =>
                this.prisma.moduleItem.update({
                    where: { id },
                    data: { orderIndex, updatedAt: new Date() },
                })
            )
        );
    }

    /**
     * Get max order index for module items
     */
    async getMaxOrderIndex(moduleId: string): Promise<number> {
        const result = await this.prisma.moduleItem.aggregate({
            where: { moduleId },
            _max: { orderIndex: true },
        });
        return result._max.orderIndex || 0;
    }

    /**
     * Find item by reference ID
     */
    async findByReferenceId(referenceId: string): Promise<ModuleItem | null> {
        return this.prisma.moduleItem.findFirst({
            where: { referenceId },
        });
    }

    /**
     * Delete item by reference ID
     */
    async deleteByReferenceId(referenceId: string): Promise<void> {
        await this.prisma.moduleItem.deleteMany({
            where: { referenceId },
        });
    }
}
