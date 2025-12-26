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
    return await lastValueFrom(this.natsClient.send({ cmd: 'module.create' }, input));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() input: UpdateModuleDto): Promise<ModuleResponseDto> {
    return await lastValueFrom(this.natsClient.send({ cmd: 'module.update' }, { id, input } as UpdateModuleRequestDto));
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<boolean> {
    return lastValueFrom(this.natsClient.send({ cmd: 'module.delete' }, id));
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string): Promise<ModuleResponseDto> {
    return await lastValueFrom(this.natsClient.send({ cmd: 'module.restore' }, id));
  }
}
