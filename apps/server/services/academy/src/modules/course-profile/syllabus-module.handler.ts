import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  SyllabusModuleCreateDto,
  SyllabusModuleService,
  SyllabusModuleUpdateDto,
} from './syllabus-module.service';

@Controller()
export class SyllabusModuleHandler {
  constructor(private readonly modules: SyllabusModuleService) {}

  @MessagePattern({ cmd: 'academy.module.create' })
  create(
    @Payload()
    data: SyllabusModuleCreateDto & { requesterId?: string },
  ) {
    const { requesterId, ...input } = data;
    return this.modules.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.module.update' })
  update(
    @Payload()
    data: {
      id: string;
      input: SyllabusModuleUpdateDto;
      requesterId?: string;
    },
  ) {
    return this.modules.update(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.module.delete' })
  delete(@Payload() data: { id: string; requesterId?: string }) {
    return this.modules.delete(data.id, data.requesterId);
  }
}
