import { Controller, Get, Query, Inject, Post, Body, Patch, Param, Delete, UseGuards, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    userCreateDTOSchema,
    userAdminUpdateDTOSchema,
} from '@workspace/schemas';
import type {
    UserResponseDTO,
    UserAdminUpdateDTO,
    UserCreateDTO,
    PaginatedResponse,
} from '@workspace/schemas';
import { UserRole } from '@workspace/schemas';
import { FirebaseAuthGuard, RolesGuard, Roles, ZodValidationPipe } from '@server/shared';

@Controller('admin/users')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class UsersController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all users' })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ): Promise<PaginatedResponse<UserResponseDTO>> {
        const pattern = { cmd: 'users.findAll' };
        const payload = { page: Number(page), limit: Number(limit), search };

        return await firstValueFrom<PaginatedResponse<UserResponseDTO>>(
            this.natsClient.send(pattern, payload)
        );
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get user by ID' })
    async findOne(@Param('id') id: string): Promise<UserResponseDTO> {
        const pattern = { cmd: 'users.findOne' };
        const payload = { id };

        return await firstValueFrom<UserResponseDTO>(
            this.natsClient.send(pattern, payload)
        );
    }

    /**
     * Create new user
     */
    @Post()
    @Roles(UserRole.ADMIN)
    @UsePipes(new ZodValidationPipe(userCreateDTOSchema))
    @ApiOperation({ summary: 'Create new user' })
    async create(@Body() createUserDto: UserCreateDTO): Promise<UserResponseDTO> {
        const pattern = { cmd: 'users.create' };
        const payload = createUserDto;

        return await firstValueFrom<UserResponseDTO>(
            this.natsClient.send(pattern, payload)
        );
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @UsePipes(new ZodValidationPipe(userAdminUpdateDTOSchema))
    @ApiOperation({ summary: 'Update user' })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UserAdminUpdateDTO,
    ): Promise<UserResponseDTO> {
        const pattern = { cmd: 'users.update' };
        const payload = { id, ...updateUserDto };

        return await firstValueFrom<UserResponseDTO>(
            this.natsClient.send(pattern, payload)
        );
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async delete(
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string,
    ) {
        const pattern = { cmd: 'users.delete' };
        const payload = {
            id,
            hardDelete: hardDelete === 'true' ? true : false,
        };

        return await firstValueFrom<{ message: string }>(
            this.natsClient.send(pattern, payload)
        );
    }
}

