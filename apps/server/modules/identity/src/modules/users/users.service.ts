import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type {
    UserUpdateDTO,
    Requester,
    UserCreateDTO,
    PaginationOptionsDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';
import {
    userUpdateDTOSchema,
    UserResponseDTO,
    UserRole,
    ErrEmailExisted,
    ErrUserNotFound,
} from '@workspace/schemas';
import type { IUsersRepository } from '../../interfaces/repositories';
import type { IUsersService, IRBACService } from '../../interfaces/services';
import { USERS_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { RBAC_SERVICE_TOKEN } from '../../interfaces/services';

@Injectable()
export class UsersService implements IUsersService {
    constructor(
        @Inject(USERS_REPOSITORY_TOKEN) private readonly usersRepository: IUsersRepository,
        @Inject(RBAC_SERVICE_TOKEN) private readonly rbacService: IRBACService,
    ) { }

    /**
     * Find all users with pagination and search
     */
    async findAll(options: PaginationOptionsDTO): Promise<PaginatedResponseDTO<UserResponseDTO>> {
        const { page = 1, limit = 10, search = '' } = options;
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { email: { contains: search, mode: 'insensitive' as any } },
                    { displayName: { contains: search, mode: 'insensitive' as any } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            this.usersRepository.findMany({
                where,
                skip,
                take: limit,
            }),
            this.usersRepository.count(where),
        ]);

        // No need to filter fields - password/salt removed from schema
        const data = users.map(user => user as any);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Find one user by ID
     */
    async findOne(userId: string): Promise<UserResponseDTO> {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user as any;
    }

    /**
     * Create new user (admin only)
     * Note: Firebase handles authentication, no password stored in DB
     */
    async create(dto: UserCreateDTO): Promise<UserResponseDTO> {
        // Check email exists
        const emailExists = await this.usersRepository.emailExists(dto.email);
        if (emailExists) {
            throw new BadRequestException(ErrEmailExisted.message);
        }

        // Create user (Firebase handles password authentication)
        const newId = uuidv4();
        const user = await this.usersRepository.create({
            id: newId,
            email: dto.email,
            displayName: dto.displayName,
            role: dto.role || UserRole.LEARNER,
            // emailVerifiedAt: null (default) = pending
        } as any);

        return user as any;
    }

    /**
     * Get user profile
     */
    async profile(userId: string): Promise<UserResponseDTO> {
        return this.findOne(userId);
    }

    /**
   * Get user profile with RBAC data
   * Returns user info along with computed role, permissions, and staff template
   */
    async getUserProfile(userId: string) {
        const user = await this.usersRepository.getProfile(userId);

        if (!user) {
            throw new NotFoundException(ErrUserNotFound.message);
        }

        // Get permissions from RBAC service
        const rbacData = await this.rbacService.getUserPermissions(user.id, user.role);

        return {
            ...user,
            permissions: rbacData.permissions,
        };
    }

    /**
     * Update user
     * Note: Password changes handled by Firebase, not stored in DB
     */
    async update(requester: Requester, userId: string, dto: UserUpdateDTO): Promise<UserResponseDTO> {
        if (requester.role !== UserRole.ADMIN && requester.sub !== userId) {
            throw new ForbiddenException('Forbidden');
        }

        const data = userUpdateDTOSchema.parse(dto);

        const user = await this.usersRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Update user data (password changes handled by Firebase)
        const updateData: any = { ...data };
        // Remove password field if present - Firebase handles auth
        delete updateData.password;

        const updatedUser = await this.usersRepository.update(userId, updateData);

        return updatedUser as any;
    }

    /**
     * Delete user (soft or hard delete)
     */
    async delete(requester: Requester, userId: string, hardDelete: boolean = false): Promise<{ message: string }> {
        if (requester.role !== UserRole.ADMIN && requester.sub !== userId) {
            throw new ForbiddenException('Forbidden');
        }

        const user = await this.usersRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (hardDelete) {
            // Hard delete - permanently remove from database
            await this.usersRepository.delete(userId);
            return { message: 'User permanently deleted' };
        } else {
            // Soft delete - mark as deleted
            await this.usersRepository.softDelete(userId);
            return { message: 'User soft deleted' };
        }
    }
}
