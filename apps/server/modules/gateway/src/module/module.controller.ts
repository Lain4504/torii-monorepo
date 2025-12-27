import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateModuleDto, UpdateModuleDto, ModuleQueryDto, ModuleResponseDto, UpdateModuleRequestDto } from '@workspace/dtos';

@Controller('api/admin/modules')
export class ModuleController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('courseId') courseId?: string,
    @Query('search') search?: string,
  ) {
    const payload: ModuleQueryDto = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      ...(courseId && { courseId }),
      ...(search && { search }),
    };

    const response = await lastValueFrom(this.natsClient.send({ cmd: 'module.findAll' }, payload));
    return response;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ModuleResponseDto | null> {
    return await lastValueFrom(this.natsClient.send({ cmd: 'module.findOne' }, id));
  }

  @Post()
  async create(@Body() input: CreateModuleDto): Promise<ModuleResponseDto> {
    try {
      return await lastValueFrom(this.natsClient.send({ cmd: 'module.create' }, input));
    } catch (error: any) {
      console.error('Gateway: Error in module.create:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() input: UpdateModuleDto): Promise<ModuleResponseDto> {
    try {
      return await lastValueFrom(this.natsClient.send({ cmd: 'module.update' }, { id, input } as UpdateModuleRequestDto));
    } catch (error: any) {
      console.error('Gateway: Error in module.update:', error);
      throw error;
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<boolean> {
    try {
      return lastValueFrom(this.natsClient.send({ cmd: 'module.delete' }, id));
    } catch (error: any) {
      console.error('Gateway: Error in module.delete:', error);
      throw error;
    }
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<ModuleResponseDto> {
    try {
      return await lastValueFrom(this.natsClient.send({ cmd: 'module.restore' }, id));
    } catch (error: any) {
      console.error('Gateway: Error in module.restore:', error);
      throw error;
    }
  }
}
