import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MODULE_SERVICE_TOKEN, IModuleService } from '@server/learning/interfaces/services';
import { ModuleCreateDTO, ModuleUpdateDTO, Requester, UserRole } from '@workspace/schemas';

@Controller()
export class ModuleHandler {
    constructor(
        @Inject(MODULE_SERVICE_TOKEN) private readonly moduleService: IModuleService
    ) { }

    @MessagePattern({ cmd: 'learning.module.create' })
    async create(@Payload() data: ModuleCreateDTO & { userId: string }) {
        const { userId, ...dto } = data;
        const requester: Requester = { sub: userId, role: UserRole.STAFF, permissions: [] };
        return this.moduleService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.module.findAll' })
    async findAll(@Payload() query: { page?: number; limit?: number; search?: string }) {
        return this.moduleService.findAll({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            search: query.search
        });
    }

    @MessagePattern({ cmd: 'learning.module.findByCourseId' })
    async findByCourseId(@Payload() data: { courseId: string, userId: string, userRole?: UserRole, userPermissions?: string[] }) {
        const requester: Requester = { sub: data.userId, role: data.userRole || UserRole.LEARNER, permissions: data.userPermissions || [] };
        return this.moduleService.findByCourseId(data.courseId, requester);
    }

    @MessagePattern({ cmd: 'learning.module.findOne' })
    async findOne(@Payload() data: { id: string }) {
        return this.moduleService.findOne(data.id);
    }

    @MessagePattern({ cmd: 'learning.module.update' })
    async update(@Payload() data: ModuleUpdateDTO & { id: string, userId: string, userRole: UserRole, userPermissions?: string[] }) {
        const { id, userId, userRole, userPermissions, ...dto } = data;
        const requester: Requester = { sub: userId, role: userRole, permissions: userPermissions || [] };
        return this.moduleService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.module.delete' })
    async delete(@Payload() data: { id: string, userId: string, userRole: UserRole, hardDelete?: boolean, userPermissions?: string[] }) {
        const { id, userId, userRole, hardDelete, userPermissions } = data;
        const requester: Requester = { sub: userId, role: userRole, permissions: userPermissions || [] };
        return this.moduleService.delete(requester, id, hardDelete);
    }

    @MessagePattern({ cmd: 'learning.module.reorder' })
    async reorder(@Payload() data: { courseId: string, moduleOrders: { id: string; orderIndex: number }[], userId: string, userRole: UserRole, userPermissions?: string[] }) {
        const { courseId, moduleOrders, userId, userRole, userPermissions } = data;
        const requester: Requester = { sub: userId, role: userRole, permissions: userPermissions || [] };
        return this.moduleService.reorder(requester, courseId, moduleOrders);
    }
}

