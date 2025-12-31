import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
    UsePipes,
    Request,
} from '@nestjs/common';
import { FirebaseAuthGuard, RolesGuard, Roles, ZodValidationPipe } from '@server/shared';
import { UserRole, userCreateDTOSchema, userAdminUpdateDTOSchema } from '@workspace/schemas';
import type {
    UserResponseDTO,
    UserCreateDTO,
    UserAdminUpdateDTO,
    PaginatedResponse,
    ReqWithRequester,
} from '@workspace/schemas';
import { UsersService } from '../../modules/users/users.service';

/**
 * Users HTTP Controller (Admin)
 * Handles user management operations
 */
@Controller('api/admin/users')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * Get all users with pagination
     */
    @Get()
    @Roles(UserRole.ADMIN)
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ): Promise<PaginatedResponse<UserResponseDTO>> {
        return this.usersService.findAll({
            page: Number(page),
            limit: Number(limit),
            search,
        });
    }

    /**
     * Get user by ID
     */
    @Get(':id')
    @Roles(UserRole.ADMIN)
    async findOne(@Param('id') id: string): Promise<UserResponseDTO> {
        return this.usersService.findOne(id);
    }

    /**
     * Create new user
     */
    @Post()
    @Roles(UserRole.ADMIN)
    @UsePipes(new ZodValidationPipe(userCreateDTOSchema))
    async create(@Body() dto: UserCreateDTO): Promise<UserResponseDTO> {
        return this.usersService.create(dto);
    }

    /**
     * Update user
     */
    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @UsePipes(new ZodValidationPipe(userAdminUpdateDTOSchema))
    async update(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Body() dto: UserAdminUpdateDTO,
    ): Promise<UserResponseDTO> {
        return this.usersService.update(req.requester, id, dto as any);
    }

    /**
     * Delete user
     */
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async delete(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string,
    ): Promise<{ message: string }> {
        const isHardDelete = hardDelete === 'true';
        return this.usersService.delete(req.requester, id, isHardDelete);
    }
}
