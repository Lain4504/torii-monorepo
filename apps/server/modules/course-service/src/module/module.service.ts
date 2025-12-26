import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import { Module as ModuleEntity } from '@prisma/generated';
import { PaginatedResponseDto, ModuleResponseDto } from '@workspace/dtos';
import {
  CreateModuleDto,
  UpdateModuleDto,
  ModuleQueryDto,
  UpdateModuleRequestDto,
} from '@workspace/dtos';

@Injectable()
export class ModuleService {
  private readonly logger = new Logger(ModuleService.name);

  constructor(private readonly prisma: PrismaService) {}

  private toModuleResponseDto(m: ModuleEntity): ModuleResponseDto {
    return {
      id: m.id,
      courseId: m.courseId,
      title: m.title,
      description: m.description || undefined,
      order: m.order,
      durationMinutes: m.durationMinutes || undefined,
      createdBy: m.createdBy || undefined,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      deletedAt: m.deletedAt || undefined,
    };
  }

  async findAll(query: ModuleQueryDto): Promise<PaginatedResponseDto<ModuleResponseDto>> {
    try {
      const { page = 1, limit = 10, courseId, search } = query;
      const skip = (page - 1) * limit;

      const whereClause: Record<string, any> = { deletedAt: null };

      if (courseId) whereClause.courseId = courseId;

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, items] = await Promise.all([
        this.prisma.module.count({ where: whereClause }),
        this.prisma.module.findMany({
          where: whereClause,
          take: limit,
          skip,
          orderBy: { order: 'asc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: `${items.length} module(s) retrieved successfully`,
        error: '',
        data: items.map(m => this.toModuleResponseDto(m)),
        meta: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve modules', error);
      return {
        success: false,
        message: 'Failed to retrieve modules',
        error: error?.message,
        data: [],
        meta: { page: query.page || 1, limit: query.limit || 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }
  }

  async findOne(id: string): Promise<ModuleResponseDto | null> {
    const m = await this.prisma.module.findFirst({ where: { id, deletedAt: null } });
    return m ? this.toModuleResponseDto(m) : null;
  }

  async create(input: CreateModuleDto): Promise<ModuleResponseDto> {
    try {
      // Optionally set order to end of current modules in course if not provided
      let order = input.order;
      if (order === undefined) {
        const count = await this.prisma.module.count({ where: { courseId: input.courseId, deletedAt: null } });
        order = count + 1;
      }

      const data = {
        courseId: input.courseId,
        title: input.title,
        description: input.description || null,
        order,
        durationMinutes: input.durationMinutes || null,
        createdBy: input.createdBy || null,
      };

      const created = await this.prisma.module.create({ data });
      return this.toModuleResponseDto(created);
    } catch (error: any) {
      this.logger.error('Error creating module', error);
      throw new RpcException({ status: 400, message: `Failed to create module: ${error?.message || 'Unknown'}` });
    }
  }

  async update(id: string, input: UpdateModuleDto): Promise<ModuleResponseDto> {
    const existing = await this.prisma.module.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new RpcException({ status: 404, message: `Module with id ${id} not found` });
    }

    try {
      const updateData: Record<string, any> = {};

      if (input.title !== undefined && input.title !== existing.title) updateData.title = input.title;
      if (input.description !== undefined) {
        const existingDesc = existing.description || null;
        const newDesc = input.description || null;
        if (existingDesc !== newDesc) updateData.description = input.description;
      }
      if (input.order !== undefined && input.order !== existing.order) updateData.order = input.order;
      if (input.durationMinutes !== undefined) {
        const existingDur = existing.durationMinutes || null;
        const newDur = input.durationMinutes || null;
        if (existingDur !== newDur) updateData.durationMinutes = input.durationMinutes;
      }
      if (Object.keys(updateData).length === 0) return this.toModuleResponseDto(existing);

      const updated = await this.prisma.module.update({ where: { id }, data: updateData });
      return this.toModuleResponseDto(updated);
    } catch (error: any) {
      this.logger.error('Error updating module', error);
      throw new RpcException({ status: 400, message: `Failed to update module: ${error?.message || 'Unknown'}` });
    }
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.prisma.module.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new RpcException({ status: 404, message: `Module with id ${id} not found` });
    }

    try {
      await this.prisma.module.update({ where: { id }, data: { deletedAt: new Date() } });
      return true;
    } catch (error: any) {
      throw new RpcException({ status: 400, message: `Failed to delete module: ${error?.message || 'Unknown'}` });
    }
  }

  async restore(id: string): Promise<ModuleResponseDto> {
    const existing = await this.prisma.module.findUnique({ where: { id } });
    if (!existing) {
      throw new RpcException({ status: 404, message: `Module with id ${id} not found` });
    }
    if (!existing.deletedAt) {
      throw new RpcException({ status: 400, message: `Module with id ${id} is not deleted` });
    }

    try {
      const restored = await this.prisma.module.update({ where: { id }, data: { deletedAt: null } });
      return this.toModuleResponseDto(restored);
    } catch (error: any) {
      this.logger.error('Error restoring module', error);
      throw new RpcException({ status: 400, message: `Failed to restore module: ${error?.message || 'Unknown'}` });
    }
  }
}
