import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { FindAllUsersParamsDto, UpdateUserDto, CreateUserDto } from '@workspace/dtos';

@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @MessagePattern({ cmd: 'users.findAll' })
    findAll(@Payload() data: FindAllUsersParamsDto) {
        return this.usersService.findAll(data);
    }

    @MessagePattern({ cmd: 'users.findOne' })
    findOne(@Payload() data: { id: string }) {
        return this.usersService.findOne(data.id);
    }

    @MessagePattern({ cmd: 'users.create' })
    create(@Payload() data: CreateUserDto) {
        return this.usersService.create(data);
    }

    @MessagePattern({ cmd: 'users.update' })
    update(@Payload() data: any) {
        const { id, ...updateUserDto } = data;
        return this.usersService.update(id, updateUserDto);
    }

    @MessagePattern({ cmd: 'users.delete' })
    delete(@Payload() data: { id: string; hardDelete?: boolean }) {
        return this.usersService.delete(data.id, data.hardDelete || false);
    }
}

