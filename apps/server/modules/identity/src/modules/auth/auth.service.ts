import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '@server/shared';
import { JwtTokenProvider } from '@server/shared';
import { RBACService } from '../rbac/rbac.service';
import { UserRole, UserStatus } from '@workspace/schemas';
import type {
    UserRegistrationDTO,
    UserLoginDTO,
    UserResponseDTO,
} from '@workspace/schemas';

export interface AuthResponse {
    user: UserResponseDTO;
    accessToken: string;
}

export interface AuthResult {
    success: boolean;
    data?: AuthResponse | { user: UserResponseDTO };
    message?: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtTokenProvider: JwtTokenProvider,
        private readonly rbacService: RBACService,
    ) { }

    /**
     * Register a new user
     */
    async register(dto: UserRegistrationDTO): Promise<UserResponseDTO> {
        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const hashedPassword = await argon2.hash(dto.password);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                fullName: dto.fullName,
                role: UserRole.LEARNER,
                status: UserStatus.ACTIVE,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user as UserResponseDTO;
    }

    /**
     * Login user and generate JWT token
     */
    async login(dto: UserLoginDTO): Promise<AuthResponse> {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isValid = await argon2.verify(user.password, dto.password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException('Account is not active');
        }

        // Generate JWT token
        const accessToken = await this.jwtTokenProvider.generateToken({
            sub: user.id,
            role: user.role as UserRole,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                status: user.status,
                emailVerified: false, // TODO: Implement email verification
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            } as UserResponseDTO,
            accessToken,
        };
    }

    /**
     * Get user profile with permissions
     */
    async getProfile(userId: string): Promise<UserResponseDTO & { permissions: string[] }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Get permissions
        const { permissions } = await this.rbacService.getUserPermissions(user.id, user.role);

        return {
            ...user,
            emailVerified: false, // TODO: Add emailVerified to Prisma schema
            permissions,
        } as UserResponseDTO & { permissions: string[] };
    }

    /**
     * Update user profile
     */
    async updateProfile(
        userId: string,
        dto: { fullName?: string },
    ): Promise<UserResponseDTO & { permissions: string[] }> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                fullName: dto.fullName,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Get permissions
        const { permissions } = await this.rbacService.getUserPermissions(user.id, user.role);

        return {
            ...user,
            emailVerified: false,
            permissions,
        } as UserResponseDTO & { permissions: string[] };
    }

    /**
     * Delete user profile (soft delete)
     */
    async deleteProfile(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                status: UserStatus.DELETED,
                deletedAt: new Date(),
            },
        });
    }
}
