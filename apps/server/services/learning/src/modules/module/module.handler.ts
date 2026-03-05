import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  MODULE_SERVICE_TOKEN,
  IModuleService,
} from '@server/learning/interfaces/services';
import {
  ModuleCreateDTO,
  ModuleUpdateDTO,
  Requester,
  UserRole,
} from '@workspace/schemas';

@Controller()
export class ModuleHandler {
  constructor(
    @Inject(MODULE_SERVICE_TOKEN)
    private readonly moduleService: IModuleService,
  ) {}

  @MessagePattern({ cmd: 'learning.module.create' })
  async create(@Payload() data: ModuleCreateDTO & { requester: Requester }) {
    const { requester, ...dto } = data;
    return this.moduleService.create(requester, dto);
  }

  @MessagePattern({ cmd: 'learning.module.findAll' })
  async findAll(
    @Payload() query: { page?: number; limit?: number; search?: string },
  ) {
    return this.moduleService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      search: query.search,
    });
  }

  @MessagePattern({ cmd: 'learning.module.findByCourseId' })
  async findByCourseId(
    @Payload() data: { courseMasterId: string; requester: Requester },
  ) {
    return this.moduleService.findByCourseId(
      data.courseMasterId,
      data.requester,
    );
  }

  @MessagePattern({ cmd: 'learning.module.findById' })
  async findById(@Payload() data: { id: string }) {
    return this.moduleService.findById(data.id);
  }

  @MessagePattern({ cmd: 'learning.module.update' })
  async update(
    @Payload() data: ModuleUpdateDTO & { id: string; requester: Requester },
  ) {
    const { id, requester, ...dto } = data;
    return this.moduleService.update(requester, id, dto);
  }

  @MessagePattern({ cmd: 'learning.module.delete' })
  async delete(
    @Payload() data: { id: string; hardDelete?: boolean; requester: Requester },
  ) {
    const { id, requester, hardDelete } = data;
    return this.moduleService.delete(requester, id, hardDelete);
  }

  @MessagePattern({ cmd: 'learning.module.reorder' })
  async reorder(
    @Payload()
    data: {
      courseMasterId: string;
      moduleOrders: { id: string; orderIndex: number }[];
      requester: Requester;
    },
  ) {
    const { courseMasterId, moduleOrders, requester } = data;
    return this.moduleService.reorder(requester, courseMasterId, moduleOrders);
  }
}
