import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  type ModuleCreateDTO,
  type ModuleUpdateDTO,
  type ModuleQueryDTO,
  type ModuleResponseDTO,
  type PaginatedResponse,
  moduleCreateDTOSchema,
  moduleUpdateDTOSchema,
} from '@workspace/schemas';
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@server/shared/pipes/zod-validation.pipe';

@Controller('api/admin/modules')
export class ModuleController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('courseId') courseId?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedResponse<ModuleResponseDTO>> {
    const payload: ModuleQueryDTO = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      ...(courseId && { courseId }),
      ...(search && { search }),
    };

    return await lastValueFrom(this.natsClient.send<PaginatedResponse<ModuleResponseDTO>>({ cmd: 'module.findAll' }, payload));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ModuleResponseDTO | null> {
    return await lastValueFrom(this.natsClient.send<ModuleResponseDTO | null>({ cmd: 'module.findOne' }, id));
  }

  @Post()
  @UsePipes(new ZodValidationPipe(moduleCreateDTOSchema))
  async create(@Body() input: ModuleCreateDTO): Promise<ModuleResponseDTO> {
    try {
      return await lastValueFrom(this.natsClient.send<ModuleResponseDTO>({ cmd: 'module.create' }, input));
    } catch (error: any) {
      console.error('Gateway: Error in module.create:', error);
      throw error;
    }
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(moduleUpdateDTOSchema))
  async update(@Param('id') id: string, @Body() input: ModuleUpdateDTO): Promise<ModuleResponseDTO> {
    try {
      return await lastValueFrom(this.natsClient.send<ModuleResponseDTO>({ cmd: 'module.update' }, { id, input }));
    } catch (error: any) {
      console.error('Gateway: Error in module.update:', error);
      throw error;
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<boolean> {
    try {
      return lastValueFrom(this.natsClient.send<boolean>({ cmd: 'module.delete' }, id));
    } catch (error: any) {
      console.error('Gateway: Error in module.delete:', error);
      throw error;
    }
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<ModuleResponseDTO> {
    try {
      return await lastValueFrom(this.natsClient.send<ModuleResponseDTO>({ cmd: 'module.restore' }, id));
    } catch (error: any) {
      console.error('Gateway: Error in module.restore:', error);
      throw error;
    }
  }
}
