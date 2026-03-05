import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Module as CourseMasterModule, Prisma } from '@prisma/generated';
import type { IModuleRepository } from '@server/learning/interfaces/repositories';

/**
 * Module Repository
 * Handles all database operations for Module entity
 */
@Injectable()
export class ModuleRepository implements IModuleRepository {
  private readonly logger = new Logger(ModuleRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find module by ID
   */
  async findById(moduleId: string): Promise<CourseMasterModule | null> {
    return this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  /**
   * Find all modules for a course
   */
  async findByCourseId(
    courseMasterId: string,
    includeDrafts: boolean = false,
  ): Promise<CourseMasterModule[]> {
    return this.prisma.module.findMany({
      where: {
        courseMasterId,
        deletedAt: null,
        ...(includeDrafts ? {} : { status: 'published' }),
      },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  /**
   * Find all modules for a specific version
   */
  async findByVersionId(versionId: string): Promise<CourseMasterModule[]> {
    return this.prisma.module.findMany({
      where: {
        versionId,
        deletedAt: null,
      },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  /**
   * Find all modules with pagination and filtering
   */
  async findMany(options: {
    skip: number;
    take: number;
    where?: Prisma.ModuleWhereInput;
    orderBy?: Prisma.ModuleOrderByWithRelationInput;
    include?: Prisma.ModuleInclude;
  }): Promise<CourseMasterModule[]> {
    return this.prisma.module.findMany({
      where: options.where,
      skip: Number(options.skip) || 0,
      take: Number(options.take) || 10,
      orderBy: options.orderBy || { orderIndex: 'asc' },
      include: options.include,
    });
  }

  /**
   * Count modules with optional filter
   */
  async count(where?: Prisma.ModuleWhereInput): Promise<number> {
    return this.prisma.module.count({ where });
  }

  /**
   * Create new module
   */
  async create(data: Prisma.ModuleCreateInput): Promise<CourseMasterModule> {
    return this.prisma.module.create({ data });
  }

  /**
   * Update module by ID
   */
  async update(
    moduleId: string,
    data: Prisma.ModuleUpdateInput,
  ): Promise<CourseMasterModule> {
    return this.prisma.module.update({
      where: { id: moduleId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete module (hard delete)
   */
  async delete(moduleId: string): Promise<void> {
    await this.prisma.module.delete({
      where: { id: moduleId },
    });
  }

  /**
   * Soft delete module
   */
  async softDelete(moduleId: string): Promise<CourseMasterModule> {
    return this.prisma.module.update({
      where: { id: moduleId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Reorder modules in a course
   */
  async reorder(
    courseMasterId: string,
    moduleOrders: { id: string; orderIndex: number }[],
  ): Promise<void> {
    // Use transaction to ensure atomicity
    await this.prisma.$transaction(
      moduleOrders.map(({ id, orderIndex }) =>
        this.prisma.module.update({
          where: { id },
          data: { orderIndex, updatedAt: new Date() },
        }),
      ),
    );
  }

  /**
   * Get max order index for a course
   */
  async getMaxOrderIndex(courseMasterId: string): Promise<number> {
    const result = await this.prisma.module.aggregate({
      where: { courseMasterId, deletedAt: null },
      _max: { orderIndex: true },
    });
    return result._max.orderIndex ?? 0;
  }
}
