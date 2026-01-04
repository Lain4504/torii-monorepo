import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { ModuleService } from '../../modules/module/module.service';
import {
  type ModuleCreateDTO,
  type ModuleUpdateDTO,
  type ModuleQueryDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';

@Controller('modules')
export class ModuleController {
  private readonly logger = new Logger(ModuleController.name);

  constructor(private readonly moduleService: ModuleService) {
  }

  @Get()
  async findAll(@Query() query: ModuleQueryDTO) {
    return await this.moduleService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.moduleService.findOne(id);
  }

  @Post()
  async create(@Body() input: ModuleCreateDTO) {
    this.logger.log('Received module.create request');
    return await this.moduleService.create(input);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() input: ModuleUpdateDTO) {
    return await this.moduleService.update(id, input);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.moduleService.delete(id);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.moduleService.restore(id);
  }
}
