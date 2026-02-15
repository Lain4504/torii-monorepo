import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException, forwardRef } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { Module as CourseModule } from '@prisma/generated';

import type {
  ModuleCreateDTO,
  ModuleUpdateDTO,
  ModuleResponseDTO,
  PaginationOptionsDTO,
  PaginatedResponseDTO,
  Requester,
} from '@workspace/schemas';

import type { IModuleService, ICourseService } from '../../interfaces/services';
import type { IModuleRepository } from '../../interfaces/repositories';
import { MODULE_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { COURSE_SERVICE_TOKEN } from '../../interfaces/services';

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
    @Inject(forwardRef(() => COURSE_SERVICE_TOKEN))
    private readonly courseService: ICourseService,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
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
  private toModuleResponseDTO(module: CourseModule): ModuleResponseDTO {
    return {
      id: module.id,
      courseId: module.courseId,
      title: module.title,
      description: module.description || undefined,
      aiMetadata: (module.aiMetadata as any) || undefined,
      orderIndex: module.orderIndex,
      status: (module as any).status || 'published',
      durationMinutes: module.durationMinutes || undefined,
      createdBy: module.createdBy || undefined,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      deletedAt: module.deletedAt || undefined,
    };
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
  async findOne(moduleId: string): Promise<ModuleResponseDTO> {
    const module = await this.moduleRepository.findById(moduleId);

    if (!module || module.deletedAt) {
      throw new NotFoundException(`Module with id ${moduleId} not found`);
    }

    return this.toModuleResponseDTO(module);
  }

  /**
   * Find all modules for a specific course
   */
  async findByCourseId(courseId: string, requester?: Requester): Promise<ModuleResponseDTO[]> {
    let includeDrafts = false;
    if (requester && (this.hasPermission(requester, 'module.create') || this.hasPermission(requester, 'module.update'))) {
      includeDrafts = true;
    }
    const modules = await this.moduleRepository.findByCourseId(courseId, includeDrafts);
    return modules.map(module => this.toModuleResponseDTO(module));
  }

  /**
   * Create a new module
   */
  async create(requester: Requester, dto: ModuleCreateDTO): Promise<ModuleResponseDTO> {
    try {
      // Get next order index if not provided
      let orderIndex = dto.orderIndex;
      if (orderIndex === undefined) {
        const maxOrder = await this.moduleRepository.getMaxOrderIndex(dto.courseId);
        orderIndex = maxOrder + 1;
      }

      const data: any = {
        course: { connect: { id: dto.courseId } },
        title: dto.title,
        description: dto.description || null,
        aiMetadata: (dto as any).aiMetadata || {},
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
      await this.courseService.recalculateStats(dto.courseId);

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

    // If user cannot publish courses (staff/admin only), check if they are assigned to the course
    if (!this.hasPermission(requester, 'course.publish')) {
      const isInstructor = await this.courseService.isInstructor(requester.sub, existing.courseId);
      if (!isInstructor) {
        throw new ForbiddenException('You are not assigned to this course');
      }
    }

    try {
      const updateData: any = {};

      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined) updateData.description = dto.description;
      if ((dto as any).aiMetadata !== undefined) updateData.aiMetadata = (dto as any).aiMetadata;
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
        await this.courseService.recalculateStats(existing.courseId);
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
    // Only authorized users can delete modules
    if (!this.hasPermission(requester, 'module.delete')) {
      throw new ForbiddenException('Only authorized staff can delete modules');
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
      await this.courseService.recalculateStats(existing.courseId);

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
    courseId: string,
    moduleOrders: { id: string; orderIndex: number }[]
  ): Promise<{ message: string }> {
    // Only authorized staff can reorder modules
    if (!this.hasPermission(requester, 'module.update')) {
      throw new ForbiddenException('Only authorized staff can reorder modules');
    }

    try {
      await this.moduleRepository.reorder(courseId, moduleOrders);

      await this.createAuditLog({
        userId: requester.sub,
        action: 'course_module.reorder',
        entity: 'course_module',
        entityId: courseId,
        description: `Reordered modules in course ${courseId}`,
        metadata: { moduleOrders },
      });

      return { message: 'Modules reordered successfully' };
    }
    catch (error: any) {
      this.logger.error('Error reordering modules', error);
      throw new BadRequestException(`Failed to reorder modules: ${error?.message || 'Unknown error'}`);
    }
  }
}
