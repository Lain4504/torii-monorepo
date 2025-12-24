import { Controller, Get, Query, Inject, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaginatedResponseDto, UserResponseDto, UpdateUserDto, CreateUserDto } from '@workspace/dtos';
import { JwtGuard, RoleGuard } from '@server/shared';
import { Roles } from '@server/shared';

@ApiTags('admin/users')
@Controller('admin/users')
@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth('access-token')
export class UsersController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Return all users' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ) {
        const pattern = { cmd: 'users.findAll' };
        const payload = { page: Number(page), limit: Number(limit), search };

        return await firstValueFrom<PaginatedResponseDto<UserResponseDto>>(
            this.natsClient.send(pattern, payload)
        );
    }

    @Get(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    async findOne(@Param('id') id: string) {
        const pattern = { cmd: 'users.findOne' };
        const payload = { id };

        return await firstValueFrom<UserResponseDto>(
            this.natsClient.send(pattern, payload)
        );
    }

    /**
     * Create new user
     */
    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Create new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    async create(@Body() createUserDto: CreateUserDto) {
        const pattern = { cmd: 'users.create' };
        const payload = createUserDto;

        return await firstValueFrom<UserResponseDto>(
            this.natsClient.send(pattern, payload)
        );
    }

    @Patch(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const pattern = { cmd: 'users.update' };
        const payload = { id, ...updateUserDto };

        return await firstValueFrom<UserResponseDto>(
            this.natsClient.send(pattern, payload)
        );
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Delete user (soft delete by default)' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
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

