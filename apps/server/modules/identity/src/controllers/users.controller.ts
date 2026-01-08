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
import { ZodValidationPipe } from '@server/shared';
import { UserRole, userCreateDTOSchema, userAdminUpdateDTOSchema, adminCreateInternalUserDTOSchema } from '@workspace/schemas';
import type {
    UserResponseDTO,
    UserCreateDTO,
    UserAdminUpdateDTO,
    PaginatedResponseDTO,
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
    ): Promise<PaginatedResponseDTO<UserResponseDTO>> {
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
    async findOne(@Param('id') id: string): Promise<UserResponseDTO> {
        return this.usersService.findOne(id);
    }

    /**
     * Create new user (external user with password)
     */
    @Post()
    @UsePipes(new ZodValidationPipe(userCreateDTOSchema))
    async create(@Body() dto: UserCreateDTO): Promise<UserResponseDTO> {
        return this.usersService.create(dto);
    }

    /**
     * Create internal user (LECTURE/STAFF) with invite email
     */
    @Post('internal')
    @UsePipes(new ZodValidationPipe(adminCreateInternalUserDTOSchema))
    async createInternal(
        @Request() req: ReqWithRequester,
        @Body() dto: AdminCreateInternalUserDTO,
    ): Promise<UserResponseDTO> {
        return this.usersService.createInternalUser(dto, req.requester.sub);
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
    ): Promise<UserResponseDTO> {
        return this.usersService.update(req.requester, id, dto);
    }

    /**
     * Delete user
     */
    @Delete(':id')
    async delete(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string,
    ): Promise<{ message: string }> {
        const isHardDelete = hardDelete === 'true';
        return this.usersService.delete(req.requester, id, isHardDelete);
    }
}
