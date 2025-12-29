import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ModuleService } from './module.service';
import {
  type ModuleCreateDTO,
  type ModuleUpdateDTO,
  type ModuleQueryDTO,
} from '@workspace/schemas';

@Controller()
export class ModuleController {
  private readonly logger = new Logger(ModuleController.name);

  constructor(private readonly moduleService: ModuleService) {
    this.logger.log('ModuleController initialized and listening for events');
  }

  @MessagePattern({ cmd: 'module.findAll' })
  async findAll(@Payload() query: ModuleQueryDTO) {
    return await this.moduleService.findAll(query);
  }

  @MessagePattern({ cmd: 'module.findOne' })
  async findOne(@Payload() id: string) {
    return await this.moduleService.findOne(id);
  }

  @MessagePattern({ cmd: 'module.create' })
  async create(@Payload() input: ModuleCreateDTO) {
    this.logger.log('Received module.create request');
    return await this.moduleService.create(input);
  }

  @MessagePattern({ cmd: 'module.update' })
  async update(@Payload() data: { id: string; input: ModuleUpdateDTO }) {
    return await this.moduleService.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'module.delete' })
  async delete(@Payload() id: string) {
    return await this.moduleService.delete(id);
  }

  @MessagePattern({ cmd: 'module.restore' })
  async restore(@Payload() id: string) {
    return await this.moduleService.restore(id);
  }
}
