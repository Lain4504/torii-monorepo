import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MODULE_SERVICE_TOKEN, IModuleService } from '../../interfaces/services';
import { ModuleCreateDTO, ModuleUpdateDTO } from '@workspace/schemas';

@Controller()
export class ModuleHandler {
    constructor(
        @Inject(MODULE_SERVICE_TOKEN) private readonly moduleService: IModuleService
    ) { }

    @MessagePattern({ cmd: 'learning.module.create' })
    async create(@Payload() data: ModuleCreateDTO & { userId: string, userRole: string }) {
        const { userId, userRole, ...dto } = data;
        const requester = { sub: userId, role: userRole as any, permissions: [] };
        return this.moduleService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.module.findAll' })
    async findAll(@Payload() query: any) {
        return this.moduleService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.module.findByCourseId' })
    async findByCourseId(@Payload() data: { courseId: string, userId: string, userRole?: string }) {
        const requester = { sub: data.userId, role: (data.userRole || 'LEARNER') as any, permissions: [] };
        return this.moduleService.findByCourseId(data.courseId, requester);
    }

    @MessagePattern({ cmd: 'learning.module.findOne' })
    async findOne(@Payload() data: { id: string }) {
        return this.moduleService.findOne(data.id);
    }

    @MessagePattern({ cmd: 'learning.module.update' })
    async update(@Payload() data: ModuleUpdateDTO & { id: string, userId: string, userRole: string }) {
        const { id, userId, userRole, ...dto } = data;
        const requester = { sub: userId, role: userRole as any, permissions: [] };
        return this.moduleService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.module.delete' })
    async delete(@Payload() data: { id: string, userId: string, userRole: string, hardDelete?: boolean }) {
        const { id, userId, userRole, hardDelete } = data;
        const requester = { sub: userId, role: userRole as any, permissions: [] };
        return this.moduleService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.module.reorder' })
    async reorder(@Payload() data: { courseId: string, moduleOrders: { id: string; orderIndex: number }[], userId: string, userRole: string }) {
        const { courseId, moduleOrders, userId, userRole } = data;
        const requester = { sub: userId, role: userRole as any, permissions: [] };
        return this.moduleService.reorder(requester, courseId, moduleOrders);
    }
}
