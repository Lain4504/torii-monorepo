import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException, forwardRef } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import type { Module as CourseMasterModule } from '@prisma/generated';

import type {
  ModuleCreateDTO,
  ModuleUpdateDTO,
  ModuleResponseDTO,
  PaginationOptionsDTO,
  PaginatedResponseDTO,
  Requester,
} from '@workspace/schemas';

import type { IModuleService, ICourseMasterService } from '@server/learning/interfaces/services';
import type { IModuleRepository } from '@server/learning/interfaces/repositories';
import { MODULE_REPOSITORY_TOKEN, IModuleItemRepository, MODULE_ITEM_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { COURSE_MASTER_SERVICE_TOKEN } from '@server/learning/interfaces/services';

/**
 * Module Service
 * Handles module business logic operations
 */
@Injectable()
export class ModuleService implements IModuleService {
  private readonly logger = new Logger(ModuleService.name);

  constructor(
    @Inject(MODULE_REPOSITORY_TOKEN)
    private readonly moduleRepository: IModuleRepository,
    @Inject(MODULE_ITEM_REPOSITORY_TOKEN)
    private readonly moduleItemRepository: IModuleItemRepository,
    @Inject(forwardRef(() => COURSE_MASTER_SERVICE_TOKEN))
    private readonly courseMasterService: ICourseMasterService,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
    @InjectMapper() private readonly mapper: Mapper,
  ) { }

  /**
   * Helper to emit audit log event
   */
  private async createAuditLog(entry: {
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    description: string;
    metadata?: any;
    oldValues?: any;
    newValues?: any;
  }) {
    try {
      this.natsClient.emit({ cmd: 'identity.audit.log' }, entry);
    } catch (error) {
      this.logger.error(`Failed to emit audit log: ${error.message}`);
    }
  }

  /**
   * Helper to check if requester has a specific permission
   */
  private hasPermission(requester: Requester, permission: string): boolean {
    if (!requester.permissions) return false;
    return requester.permissions.includes('*') || requester.permissions.includes(permission);
  }

  /**
   * Map Module entity to ModuleResponseDTO
   */
  /**
   * Map Module entity to ModuleResponseDTO
   */
  private toModuleResponseDTO(module: CourseMasterModule): ModuleResponseDTO {
    return this.mapper.map<CourseMasterModule, ModuleResponseDTO>(module, 'Module', 'ModuleResponseDTO');
  }

  /**
   * Find all modules with pagination and search
   */
  async findAll(options: PaginationOptionsDTO): Promise<PaginatedResponseDTO<ModuleResponseDTO>> {
    try {
      const { page = 1, limit = 10, search } = options;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, modules] = await Promise.all([
        this.moduleRepository.count(where),
        this.moduleRepository.findMany({
          skip,
          take: limit,
          where,
          orderBy: { orderIndex: 'asc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: modules.map(module => this.toModuleResponseDTO(module)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve modules', error);
      throw new BadRequestException('Failed to retrieve modules');
    }
  }

  /**
   * Find one module by ID
   */
  async findById(moduleId: string): Promise<ModuleResponseDTO> {
    const module = await this.moduleRepository.findById(moduleId);

    if (!module || module.deletedAt) {
      throw new NotFoundException(`Module with id ${moduleId} not found`);
    }

    return this.toModuleResponseDTO(module);
  }

  /**
   * Find all modules for a specific course
   */
  async findByCourseId(courseMasterId: string, requester?: Requester): Promise<ModuleResponseDTO[]> {
    let includeDrafts = false;
    if (requester && (this.hasPermission(requester, 'module.create') || this.hasPermission(requester, 'module.update'))) {
      includeDrafts = true;
    }
    const modules = await this.moduleRepository.findByCourseId(courseMasterId, includeDrafts);
    return modules.map(module => this.toModuleResponseDTO(module));
  }

  /**
   * Create a new module
   */
  async create(requester: Requester, dto: ModuleCreateDTO): Promise<ModuleResponseDTO> {
    // Only Admin/Staff-LMS can create modules in Master Syllabus
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can create Master syllabus modules.');
    }
    try {
      // Get next order index if not provided
      let orderIndex = dto.orderIndex;
      if (orderIndex === undefined) {
        const maxOrder = await this.moduleRepository.getMaxOrderIndex(dto.courseMasterId);
        orderIndex = maxOrder + 1;
      }

      const data: any = {
        courseMaster: { connect: { id: dto.courseMasterId } },
        title: dto.title,
        description: dto.description || null,
        orderIndex,
        status: (dto as any).status || 'published',
        durationMinutes: dto.durationMinutes || null,
        createdBy: requester.sub,
      };

      const module = await this.moduleRepository.create(data);

      await this.createAuditLog({
        userId: requester.sub,
        action: 'course_module.create',
        entity: 'course_module',
        entityId: module.id,
        description: `Created module: ${module.title}`,
        newValues: module,
      });

      // Update course stats
      await this.courseMasterService.recalculateStats(dto.courseMasterId);

      return this.toModuleResponseDTO(module);
    } catch (error: any) {
      this.logger.error('Error creating module', error);
      throw new BadRequestException(`Failed to create module: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Update module
   */
  async update(requester: Requester, moduleId: string, dto: ModuleUpdateDTO): Promise<ModuleResponseDTO> {
    // Check permissions
    if (!this.hasPermission(requester, 'module.update')) {
      throw new ForbiddenException('Only authorized users can update modules');
    }

    const existing = await this.moduleRepository.findById(moduleId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Module with id ${moduleId} not found`);
    }

    // Business Rule: ONLY Admin or Staff-LMS (Academic) can update modules in the Master Syllabus.
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can update Master syllabus modules.');
    }

    try {
      const updateData: any = {};

      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.orderIndex !== undefined) updateData.orderIndex = dto.orderIndex;
      if (dto.durationMinutes !== undefined) updateData.durationMinutes = dto.durationMinutes;
      if ((dto as any).status !== undefined) updateData.status = (dto as any).status;

      if (Object.keys(updateData).length === 0) {
        return this.toModuleResponseDTO(existing);
      }

      const module = await this.moduleRepository.update(moduleId, updateData);

      await this.createAuditLog({
        userId: requester.sub,
        action: 'course_module.update',
        entity: 'course_module',
        entityId: moduleId,
        description: `Updated module: ${module.title}`,
        oldValues: existing,
        newValues: module,
      });

      // Update course stats if status changed
      if ((dto as any).status !== undefined && (dto as any).status !== (existing as any).status) {
        await this.courseMasterService.recalculateStats(existing.courseMasterId);
      }

      return this.toModuleResponseDTO(module);
    } catch (error: any) {
      this.logger.error('Error updating module', error);
      throw new BadRequestException(`Failed to update module: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete module
   */
  async delete(requester: Requester, moduleId: string, hardDelete = false): Promise<{ message: string }> {
    // Only Academic Staff can delete modules in Syllabus
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can delete Master syllabus modules.');
    }

    const existing = await this.moduleRepository.findById(moduleId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Module with id ${moduleId} not found`);
    }

    try {
      if (hardDelete) {
        await this.moduleRepository.delete(moduleId);
      }
      else {
        await this.moduleRepository.softDelete(moduleId);
      }

      await this.createAuditLog({
        userId: requester.sub,
        action: hardDelete ? 'course_module.hard_delete' : 'course_module.delete',
        entity: 'course_module',
        entityId: moduleId,
        description: `${hardDelete ? 'Hard deleted' : 'Soft deleted'} module: ${existing.title}`,
        oldValues: existing,
      });

      // Update course stats
      await this.courseMasterService.recalculateStats(existing.courseMasterId);

      return { message: 'Module deleted successfully' };
    }
    catch (error: any) {
      throw new BadRequestException(`Failed to delete module: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Reorder modules within a course
   */
  async reorder(
    requester: Requester,
    courseMasterId: string,
    moduleOrders: { id: string; orderIndex: number }[]
  ): Promise<{ message: string }> {
    // Only authorized staff can reorder modules
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can reorder Master syllabus modules.');
    }

    try {
      await this.moduleRepository.reorder(courseMasterId, moduleOrders);

      await this.createAuditLog({
        userId: requester.sub,
        action: 'course_module.reorder',
        entity: 'course_module',
        entityId: courseMasterId,
        description: `Reordered modules in course ${courseMasterId}`,
        metadata: { moduleOrders },
      });

      return { message: 'Modules reordered successfully' };
    }
    catch (error: any) {
      this.logger.error('Error reordering modules', error);
      throw new BadRequestException(`Failed to reorder modules: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Add an item to a module
   */
  async addModuleItem(requester: Requester, moduleId: string, dto: { title: string; type: string; referenceId: string; orderIndex?: number }): Promise<any> {
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can add module items.');
    }

    const module = await this.moduleRepository.findById(moduleId);
    if (!module) throw new NotFoundException(`Module ${moduleId} not found`);

    let orderIndex = dto.orderIndex;
    if (orderIndex === undefined) {
      const maxOrder = await this.moduleItemRepository.getMaxOrderIndex(moduleId);
      orderIndex = maxOrder + 1;
    }

    const item = await this.moduleItemRepository.create({
      module: { connect: { id: moduleId } },
      title: dto.title,
      type: dto.type,
      referenceId: dto.referenceId,
      orderIndex,
    });

    await this.createAuditLog({
      userId: requester.sub,
      action: 'module_item.add',
      entity: 'module_item',
      entityId: item.id,
      description: `Added ${dto.type} to module ${module.title}`,
      newValues: item,
    });

    return item;
  }

  /**
   * Remove an item from a module
   */
  async removeModuleItem(requester: Requester, itemId: string): Promise<void> {
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can remove module items.');
    }

    const item = await this.moduleItemRepository.findById(itemId);
    if (!item) throw new NotFoundException(`Module item ${itemId} not found`);

    await this.moduleItemRepository.delete(itemId);

    await this.createAuditLog({
      userId: requester.sub,
      action: 'module_item.remove',
      entity: 'module_item',
      entityId: itemId,
      description: `Removed item ${item.title} from module ${item.moduleId}`,
      oldValues: item,
    });
  }

  /**
   * Update an item in a module
   */
  async updateModuleItem(requester: Requester, itemId: string, dto: { title?: string; orderIndex?: number }): Promise<any> {
    if (!this.hasPermission(requester, 'module.update')) {
      throw new ForbiddenException('Only authorized users can update module items');
    }

    const existing = await this.moduleItemRepository.findById(itemId);
    if (!existing) throw new NotFoundException(`Module item ${itemId} not found`);

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.orderIndex !== undefined) updateData.orderIndex = dto.orderIndex;

    const updated = await this.moduleItemRepository.update(itemId, updateData);

    await this.createAuditLog({
      userId: requester.sub,
      action: 'module_item.update',
      entity: 'module_item',
      entityId: itemId,
      description: `Updated module item: ${updated.title}`,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }

  /**
   * Reorder items within a module
   */
  async reorderModuleItems(requester: Requester, moduleId: string, itemOrders: { id: string; orderIndex: number }[]): Promise<void> {
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can reorder module items.');
    }

    try {
      await this.moduleItemRepository.reorder(moduleId, itemOrders);

      await this.createAuditLog({
        userId: requester.sub,
        action: 'module_item.reorder',
        entity: 'module_item',
        entityId: moduleId,
        description: `Reordered items in module ${moduleId}`,
        metadata: { itemOrders },
      });
    } catch (error: any) {
      this.logger.error('Error reordering module items', error);
      throw new BadRequestException(`Failed to reorder module items: ${error?.message || 'Unknown error'}`);
    }
  }
}

