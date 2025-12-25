import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaginatedResponseDto } from '@workspace/dtos';

@Controller('admin/users')
export class UsersController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Get()
    async findAll(

        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ) {
        const pattern = { cmd: 'users.findAll' };
        const payload = { page: Number(page), limit: Number(limit), search };

        return await firstValueFrom<PaginatedResponseDto<any>>(this.natsClient.send(pattern, payload));
    }
}

