import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Inject,
    ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import type {
    UserUpdateDTO,
    Requester,
    UserCreateDTO,
    PaginationOptionsDTO,
    PaginatedResponseDTO,
    AdminCreateInternalUserDTO,
} from '@workspace/schemas';
import {
    userUpdateDTOSchema,
    UserResponseDTO,
    UserRole,
    ErrEmailExisted,
    ErrUserNotFound,
} from '@workspace/schemas';
import type { IUsersRepository } from '../../interfaces/repositories';
import type { IUsersService, IRBACService, IEmailService } from '../../interfaces/services';
import { USERS_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { RBAC_SERVICE_TOKEN, EMAIL_SERVICE_TOKEN } from '../../interfaces/services';
import { REDIS_CLIENT } from '@server/shared';

@Injectable()
export class UsersService implements IUsersService {
    constructor(
        @Inject(USERS_REPOSITORY_TOKEN) private readonly usersRepository: IUsersRepository,
        @Inject(RBAC_SERVICE_TOKEN) private readonly rbacService: IRBACService,
        @Inject(EMAIL_SERVICE_TOKEN) private readonly emailService: IEmailService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
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
     * Create internal user (LECTURE/STAFF) with invite email
     * User is created in INVITED status (verifiedAt = null, password = null)
     */
    async createInternalUser(dto: AdminCreateInternalUserDTO, adminId: string): Promise<UserResponseDTO> {
        // Check email exists
        const emailExists = await this.usersRepository.emailExists(dto.email);
        if (emailExists) {
            throw new ConflictException(ErrEmailExisted.message);
        }

        // Create user in INVITED status (no password, not verified)
        const newId = uuidv4();
        const user = await this.usersRepository.create({
            id: newId,
            email: dto.email,
            displayName: dto.displayName,
            role: dto.role,
            password: null, // No password set - user will set it via invite link
            verifiedAt: null, // INVITED status
        } as any);

        // Generate invite token (valid for 7 days)
        const cryptoModule = await import('crypto');
        const inviteToken = cryptoModule.randomBytes(32).toString('hex');

        // Store invite token in Redis (7 days expiry)
        await this.redis.set(`invite-token:${inviteToken}`, user.id, 'EX', 604800); // 7 days

        // Send invite email
        const inviteUrl = `${process.env.FRONTEND_URL}/set-password?token=${inviteToken}`;
        await this.emailService.sendInviteEmail(
            user.email,
            user.displayName,
            inviteUrl
        );

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
