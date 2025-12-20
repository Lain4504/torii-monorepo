import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaginatedResponseDto } from '@workspace/dtos';

@ApiTags('admin/users')
@Controller('admin/users')
export class UsersController {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Return all users' })
    async findAll(

        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ) {
        const pattern = { cmd: 'users.findAll' };
        const payload = { page: Number(page), limit: Number(limit), search };

        return await firstValueFrom<PaginatedResponseDto<any>>(this.authClient.send(pattern, payload));
    }
}

