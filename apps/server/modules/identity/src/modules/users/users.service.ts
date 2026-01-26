import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Inject,
    ConflictException,
} from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
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
import type { User, Prisma } from '@prisma/generated';
import type { IUsersRepository } from '../../interfaces/repositories';
import type { IUsersService, IAuthorizationService, IEmailService, UserWithPermissions } from '../../interfaces/services';
import { USERS_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { AUTHORIZATION_SERVICE_TOKEN, EMAIL_SERVICE_TOKEN } from '../../interfaces/services';
import { REDIS_CLIENT, generateSecureRandomString } from '@server/shared';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService implements IUsersService {
    constructor(
        @Inject(USERS_REPOSITORY_TOKEN) private readonly usersRepository: IUsersRepository,
        @Inject(AUTHORIZATION_SERVICE_TOKEN) private readonly authorizationService: IAuthorizationService,
        @Inject(EMAIL_SERVICE_TOKEN) private readonly emailService: IEmailService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        @InjectMapper() private readonly mapper: Mapper,
    ) { }

    /**
     * Helper to check if requester has a specific permission
     */
    private hasPermission(requester: Requester, permission: string): boolean {
        if (!requester.permissions) return false;
        return requester.permissions.includes('*') || requester.permissions.includes(permission);
    }

    /**
     * Find all users with pagination and search
     */
    async findAll(options: PaginationOptionsDTO): Promise<PaginatedResponseDTO<UserResponseDTO>> {
        const { page = 1, limit = 10, search = '' } = options;

        const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
        const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const where: Prisma.UserWhereInput = search
            ? {
                OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { displayName: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            this.usersRepository.findMany({
                where,
                skip,
                take: limitNum,
            }),
            this.usersRepository.count(where),
        ]);

        // Map Prisma User to UserResponseDTO using AutoMapper
        const data: UserResponseDTO[] = users.map(user =>
            this.mapper.map<User, UserResponseDTO>(user, 'User', 'UserResponseDTO')
        );

        return {
            data,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
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

        // Map Prisma User to UserResponseDTO using AutoMapper
        return this.mapper.map<User, UserResponseDTO>(user, 'User', 'UserResponseDTO');
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
            password: dto.password || null,
            // verifiedAt: null (default) = pending
        });

        // Map Prisma User to UserResponseDTO using AutoMapper
        return this.mapper.map<User, UserResponseDTO>(user, 'User', 'UserResponseDTO');
    }

    /**
     * Create internal user (LECTURE/STAFF) with invite email
     * Auto-generates random password, hashes it, and sends via email
     */
    async createInternalUser(dto: AdminCreateInternalUserDTO, adminId: string): Promise<UserResponseDTO> {
        // Check email exists
        const emailExists = await this.usersRepository.emailExists(dto.email);
        if (emailExists) {
            throw new ConflictException(ErrEmailExisted.message);
        }

        // Generate random password (12 characters, mixed case + numbers)
        const randomPassword = generateSecureRandomString(12);

        // Hash password using Argon2
        const hashedPassword = await argon2.hash(randomPassword);

        // Create user with hashed password and auto-verify email
        const newId = uuidv4();
        const user = await this.usersRepository.create({
            id: newId,
            email: dto.email,
            displayName: dto.displayName,
            role: dto.role,
            password: hashedPassword, // Store hashed password
            verifiedAt: new Date(), // Auto-verify email when account is created
        });

        // Generate invite token (valid for 7 days) - for email verification if needed
        const cryptoModule = await import('crypto');
        const inviteToken = cryptoModule.randomBytes(32).toString('hex');

        // Store invite token in Redis (7 days expiry) - kept for potential future use
        await this.redis.set(`invite-token:${inviteToken}`, user.id, 'EX', 604800); // 7 days

        // Send invite email with password - link to login page
        // Internal users (staff/lecturer) use web-admin, so use WEB_ADMIN_URL or default to port 5173
        const loginUrl = `${(process.env.WEB_ADMIN_URL || 'https://app.torii.sbs').replace(/\/+$/, '')}/login`;
        await this.emailService.sendInviteEmail(
            user.email,
            user.displayName,
            loginUrl,
            randomPassword // Send plain password in email (only time it's exposed)
        );

        // Map Prisma User to UserResponseDTO using AutoMapper
        return this.mapper.map<User, UserResponseDTO>(user, 'User', 'UserResponseDTO');
    }

    /**
     * Get user by ID (alias for findOne)
     */
    async getUser(userId: string): Promise<UserResponseDTO> {
        return this.findOne(userId);
    }

    /**
     * Get user with authorization permissions
     * Returns user info along with computed role, permissions, and staff template
     */
    async getUserWithPermissions(userId: string): Promise<UserWithPermissions> {
        const user = await this.usersRepository.getUserBasicInfo(userId);

        if (!user) {
            throw new NotFoundException(ErrUserNotFound.message);
        }

        // Get permissions from authorization service
        const authorizationData = await this.authorizationService.getUserPermissions(user.id, user.role);

        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role as UserRole,
            verifiedAt: user.verifiedAt,
            bannedUntil: null,
            lastSignInAt: null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deletedAt: null,
            permissions: authorizationData.permissions,
        };
    }

    /**
     * Update user
     * Note: Password changes handled by Firebase, not stored in DB
     */
    async update(requester: Requester, userId: string, dto: UserUpdateDTO): Promise<UserResponseDTO> {
        // Can edit self, or has user.manage permission
        if (requester.sub !== userId && !this.hasPermission(requester, 'user.manage')) {
            throw new ForbiddenException('Forbidden');
        }

        const data = userUpdateDTOSchema.parse(dto);

        const user = await this.usersRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Update user data (password changes handled by Firebase)
        const updateData: Prisma.UserUpdateInput = { ...data };
        // Remove password field if present - Firebase handles auth
        if ('password' in updateData) {
            delete (updateData as { password?: unknown }).password;
        }

        const updatedUser = await this.usersRepository.update(userId, updateData);

        // Map Prisma User to UserResponseDTO using AutoMapper
        return this.mapper.map<User, UserResponseDTO>(updatedUser, 'User', 'UserResponseDTO');
    }

    /**
     * Delete user (soft or hard delete)
     */
    async delete(requester: Requester, userId: string, hardDelete: boolean = false): Promise<{ message: string }> {
        // Can delete self, or has user.manage permission
        if (requester.sub !== userId && !this.hasPermission(requester, 'user.manage')) {
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
