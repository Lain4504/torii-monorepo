import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { UserUpdateDTO, Requester } from '@workspace/schemas';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @MessagePattern({ cmd: 'users.findAll' })
    async findAll(@Payload() payload: { page: number; limit: number; search?: string }) {
        const result = await this.usersService.findAll(payload);
        return { success: true, data: result };
    }

    @MessagePattern({ cmd: 'users.findOne' })
    async findOne(@Payload() payload: { id: string }) {
        const user = await this.usersService.findOne(payload.id);
        return { success: true, data: user };
    }

    @MessagePattern({ cmd: 'users.create' })
    async create(@Payload() payload: { email: string; fullName: string; password: string; role?: string; status?: string }) {
        const user = await this.usersService.create(payload as any);
        return { success: true, data: user };
    }

    @MessagePattern({ cmd: 'user.profile' })
    async profile(@Payload() userId: string) {
        const user = await this.usersService.profile(userId);
        return { success: true, data: user };
    }

    @MessagePattern({ cmd: 'users.update' })
    async update(@Payload() payload: { id: string; requester?: Requester } & UserUpdateDTO) {
        const { id, requester, ...dto } = payload;
        // For now, if no requester is provided, assume it's an admin operation
        const req = requester || { sub: id, role: 'admin' as any };
        const user = await this.usersService.update(req, id, dto);
        return { success: true, data: user };
    }



    @MessagePattern({ cmd: 'users.delete' })
    async delete(@Payload() payload: { id: string; requester?: Requester; hardDelete?: boolean }) {
        const { id, requester, hardDelete = false } = payload;
        // For now, if no requester is provided, assume it's an admin operation
        const req = requester || { sub: id, role: 'admin' as any };
        const result = await this.usersService.delete(req, id, hardDelete);
        return { success: true, ...result };
    }


}
