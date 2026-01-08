import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type { Module as CourseModule } from '@prisma/generated';

import type {
  ModuleCreateDTO,
  ModuleUpdateDTO,
  ModuleResponseDTO,
  PaginationOptionsDTO,
  PaginatedResponseDTO,
  Requester,
} from '@workspace/schemas';

import type { IModuleService } from '../../interfaces/services';
import type { IModuleRepository } from '../../interfaces/repositories';
import { MODULE_REPOSITORY_TOKEN } from '../../interfaces/repositories';

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
  ) { }

  /**
   * Map Module entity to ModuleResponseDTO
   */
  private toModuleResponseDTO(module: CourseModule): ModuleResponseDTO {
    return {
      id: module.id,
      courseId: module.courseId,
      title: module.title,
      description: module.description || undefined,
      aiMetadata: module.aiMetadata || undefined,
      orderIndex: module.orderIndex,
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
  async findByCourseId(courseId: string): Promise<ModuleResponseDTO[]> {
    const modules = await this.moduleRepository.findByCourseId(courseId);
    return modules.map(module => this.toModuleResponseDTO(module));
  }

  /**
   * Create a new module
   */
  async create(requester: Requester, dto: ModuleCreateDTO): Promise<ModuleResponseDTO> {
    // Check permissions
    if (!['ADMIN', 'LECTURER'].includes(requester.role)) {
      throw new ForbiddenException('Only admins and lecturers can create modules');
    }

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
        aiMetadata: dto.aiMetadata || {},
        orderIndex,
        durationMinutes: dto.durationMinutes || null,
        createdBy: requester.userId,
      };

      const module = await this.moduleRepository.create(data);
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
    if (!['ADMIN', 'LECTURER'].includes(requester.role)) {
      throw new ForbiddenException('Only admins and lecturers can update modules');
    }

    const existing = await this.moduleRepository.findById(moduleId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Module with id ${moduleId} not found`);
    }

    try {
      const updateData: any = {};

      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.aiMetadata !== undefined) updateData.aiMetadata = dto.aiMetadata;
      if (dto.orderIndex !== undefined) updateData.orderIndex = dto.orderIndex;
      if (dto.durationMinutes !== undefined) updateData.durationMinutes = dto.durationMinutes;

      if (Object.keys(updateData).length === 0) {
        return this.toModuleResponseDTO(existing);
      }

      const module = await this.moduleRepository.update(moduleId, updateData);
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
    if (requester.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete modules');
    }

    const existing = await this.moduleRepository.findById(moduleId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Module with id ${moduleId} not found`);
    }

    try {
      if (hardDelete) {
        await this.moduleRepository.delete(moduleId);
      } else {
        await this.moduleRepository.softDelete(moduleId);
      }

      return { message: 'Module deleted successfully' };
    } catch (error: any) {
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
    if (!['ADMIN', 'LECTURER'].includes(requester.role)) {
      throw new ForbiddenException('Only admins and lecturers can reorder modules');
    }

    try {
      await this.moduleRepository.reorder(courseId, moduleOrders);
      return { message: 'Modules reordered successfully' };
    } catch (error: any) {
      this.logger.error('Error reordering modules', error);
      throw new BadRequestException(`Failed to reorder modules: ${error?.message || 'Unknown error'}`);
    }
  }
}
