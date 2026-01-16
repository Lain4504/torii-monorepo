import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UsePipes,
    UseGuards,
    Req,
    Inject,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ZodValidationPipe, successResponse, errorResponse, successPaginatedResponse, GatewayAuthGuard } from '@server/shared';
import {
    userCreateDTOSchema,
    userAdminUpdateDTOSchema,
    adminCreateInternalUserDTOSchema,
} from '@workspace/schemas';
import type {
    UserCreateDTO,
    UserAdminUpdateDTO,
    AdminCreateInternalUserDTO,
} from '@workspace/schemas';
import { Request } from 'express';

@Controller('api/admin/users')
@UseGuards(GatewayAuthGuard)
export class UsersController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.users.findAll' },
                    { page: Number(page), limit: Number(limit), search },
                ),
            );
            return successPaginatedResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch users');
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const user = await firstValueFrom(
                this.natsClient.send({ cmd: 'identity.users.findOne' }, { id }),
            );
            return successResponse({ user });
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'User not found');
        }
    }

    @Post()
    @UsePipes(new ZodValidationPipe(userCreateDTOSchema))
    async create(@Body() dto: UserCreateDTO) {
        try {
            const user = await firstValueFrom(this.natsClient.send({ cmd: 'identity.users.create' }, dto));
            return successResponse({ user }, 'User created successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to create user');
        }
    }

    @Post('internal')
    @UsePipes(new ZodValidationPipe(adminCreateInternalUserDTOSchema))
    async createInternal(
        @Req() req: Request,
        @Body() dto: AdminCreateInternalUserDTO,
    ) {
        try {
            const user = req.user as any;
            const newUser = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.users.createInternal' },
                    { dto, requesterId: user.sub },
                ),
            );
            return successResponse({ user: newUser }, 'Internal user created successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to create internal user');
        }
    }

    @Patch(':id')
    @UsePipes(new ZodValidationPipe(userAdminUpdateDTOSchema))
    async update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() dto: UserAdminUpdateDTO,
    ) {
        try {
            const user = req.user as any;
            const updatedUser = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.users.update' },
                    { id, dto, requester: { sub: user.sub, roles: user.roles || [] } },
                ),
            );
            return successResponse({ user: updatedUser }, 'User updated successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to update user');
        }
    }

    @Delete(':id')
    async delete(
        @Req() req: Request,
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string,
    ) {
        try {
            const user = req.user as any;
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.users.delete' },
                    {
                        id,
                        hardDelete: hardDelete === 'true',
                        requester: { sub: user.sub, roles: user.roles || [] },
                    },
                ),
            );
            return successResponse(null, 'User deleted successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to delete user');
        }
    }
}
