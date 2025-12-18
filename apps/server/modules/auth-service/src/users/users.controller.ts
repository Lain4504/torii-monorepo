import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { FindAllUsersRequest } from '@workspace/protocol';

@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @MessagePattern({ cmd: 'users.findAll' })
    findAll(@Payload() data: FindAllUsersRequest) {
        return this.usersService.findAll(data);
    }
}

