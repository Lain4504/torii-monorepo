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
    Request,
    Inject,
} from '@nestjs/common';
import { ZodValidationPipe, successResponse, errorResponse, successPaginatedResponse } from '@server/shared';
import { UserRole, userCreateDTOSchema, userAdminUpdateDTOSchema, adminCreateInternalUserDTOSchema } from '@workspace/schemas';
import type {
    UserResponseDTO,
    UserCreateDTO,
    UserAdminUpdateDTO,
    ReqWithRequester,
    AdminCreateInternalUserDTO,
} from '@workspace/schemas';
import type { IUsersService } from '../interfaces/services';
import { USERS_SERVICE_TOKEN } from '../interfaces/services';
import { GatewayAuthGuard } from '@server/shared';

/**
 * Users HTTP Controller (Admin)
 * Handles user management operations
 */
@Controller('admin/users')
@UseGuards(GatewayAuthGuard)
export class UsersController {
    constructor(@Inject(USERS_SERVICE_TOKEN) private readonly usersService: IUsersService) { }

    /**
     * Get all users with pagination
     */
    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ) {
        try {
            const result = await this.usersService.findAll({
                page: Number(page),
                limit: Number(limit),
                search,
            });
            return successPaginatedResponse(
                result.data,
                result.total,
                result.page,
                result.limit,
                result.totalPages
            );
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch users');
        }
    }

    /**
     * Get user by ID
     */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const user = await this.usersService.findOne(id);
            return successResponse({ user });
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch user');
        }
    }

    /**
     * Create new user (external user with password)
     */
    @Post()
    @UsePipes(new ZodValidationPipe(userCreateDTOSchema))
    async create(@Body() dto: UserCreateDTO) {
        try {
            const user = await this.usersService.create(dto);
            return successResponse({ user }, 'User created successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to create user');
        }
    }

    /**
     * Create internal user (LECTURE/STAFF) with invite email
     */
    @Post('internal')
    @UsePipes(new ZodValidationPipe(adminCreateInternalUserDTOSchema))
    async createInternal(
        @Request() req: ReqWithRequester,
        @Body() dto: AdminCreateInternalUserDTO,
    ) {
        try {
            const user = await this.usersService.createInternalUser(dto, req.requester.sub);
            return successResponse({ user }, 'Invitation sent successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to create user');
        }
    }

    /**
     * Update user
     */
    @Patch(':id')
    @UsePipes(new ZodValidationPipe(userAdminUpdateDTOSchema))
    async update(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Body() dto: UserAdminUpdateDTO,
    ) {
        try {
            const user = await this.usersService.update(req.requester, id, dto);
            return successResponse({ user }, 'User updated successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to update user');
        }
    }

    /**
     * Delete user
     */
    @Delete(':id')
    async delete(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string,
    ) {
        try {
            const isHardDelete = hardDelete === 'true';
            await this.usersService.delete(req.requester, id, isHardDelete);
            return successResponse(null, 'User deleted successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to delete user');
        }
    }
}
