import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FindAllUsersRequest, FindAllUsersResponse } from '@workspace/protocol';

@ApiTags('admin/users')
@Controller('admin/users')
export class UsersController {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ) {
        const pattern = { cmd: 'users.findAll' }; // Must match UsersService
        const payload: FindAllUsersRequest = { page, limit, search };

        // Call Microservice and return directly
        // The Microservice returns FindAllUsersResponse which already matches { data, meta }
        return await firstValueFrom<FindAllUsersResponse>(this.authClient.send(pattern, payload));
    }
}

