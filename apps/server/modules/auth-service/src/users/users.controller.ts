import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { FindAllUsersParamsDto } from '@workspace/dtos';

@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @MessagePattern({ cmd: 'users.findAll' })
    findAll(@Payload() data: FindAllUsersParamsDto) {
        return this.usersService.findAll(data);
    }
}

