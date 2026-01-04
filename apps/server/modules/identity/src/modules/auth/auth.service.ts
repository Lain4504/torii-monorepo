import { Injectable, UnauthorizedException, ConflictException, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Redis from 'ioredis';
import * as argon2 from 'argon2';
import { PrismaService, REDIS_CLIENT } from '@server/shared';
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
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
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

        // Use email username as displayName if not provided
        const displayName = dto.displayName || dto.email.split('@')[0];

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                displayName,
                role: UserRole.LEARNER,
                status: UserStatus.PENDING,
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Generate Magic Link token
        const magicToken = await this.generateMagicToken(user.email);

        // Emit NATS event for notification service to send email
        this.natsClient.emit('auth.user.registered', {
            email: user.email,
            displayName: user.displayName,
            magicToken, // Send token instead of OTP
            verificationUrl: `${process.env.FRONTEND_URL}/verify?token=${magicToken}`,
        });

        return {
            ...user,
            emailVerified: false,
        } as UserResponseDTO;
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
        // Check if user is active or pending
        if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.PENDING) {
            throw new UnauthorizedException('Account is disabled or deleted');
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
                displayName: user.displayName,
                role: user.role,
                status: user.status,
                emailVerified: user.status === UserStatus.ACTIVE,
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
                displayName: true,
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
            emailVerified: user.status === UserStatus.ACTIVE,
            permissions,
        } as UserResponseDTO & { permissions: string[] };
    }

    /**
     * Generate 6-digit OTP and store in Redis (24h expiry)
     */
    private async generateAndSendOtp(email: string): Promise<void> {
        // Generate 6 digit code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in Redis with 24 hours (86400 seconds) expiry
        await this.redis.set(`otp:${email}`, otp, 'EX', 86400);

        // Emit NATS event for notification service
        this.natsClient.emit('auth.user.registered', {
            email,
            otp,
        });
    }

    /**
     * Generate Magic Link token for email verification
     * Returns the token to be used in verification URL
     */
    async generateMagicToken(email: string): Promise<string> {
        // Generate secure random token (32 bytes = 64 hex chars)
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');

        // Store email associated with token in Redis (24h expiry)
        await this.redis.set(`magic-link:${token}`, email, 'EX', 86400);

        return token;
    }

    /**
     * Verify Magic Link token and activate user
     */
    async verifyMagicToken(token: string): Promise<{ success: boolean; email?: string }> {
        const email = await this.redis.get(`magic-link:${token}`);

        if (!email) {
            return { success: false };
        }

        // Update user status to ACTIVE
        await this.prisma.user.update({
            where: { email },
            data: { status: UserStatus.ACTIVE }
        });

        // Delete token (one-time use)
        await this.redis.del(`magic-link:${token}`);

        return { success: true, email };
    }

    /**
     * Resend verification OTP
     * Rate limited: 3 requests per hour per email
     */
    async resendVerification(email: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Only allow resend for PENDING users (not yet verified)
        if (user.status !== UserStatus.PENDING) {
            throw new BadRequestException('Email already verified or account is not active');
        }

        // Rate limiting: 3 requests per hour
        const rateLimitKey = `resend-verification:${email}`;
        const attempts = await this.redis.get(rateLimitKey);
        const attemptsCount = attempts ? parseInt(attempts) : 0;

        if (attemptsCount >= 3) {
            const ttl = await this.redis.ttl(rateLimitKey);
            const minutesLeft = Math.ceil(ttl / 60);
            throw new BadRequestException(
                `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${minutesLeft} phút.`
            );
        }

        // Generate new Magic Link token
        const magicToken = await this.generateMagicToken(email);

        // Emit NATS event for notification service to send email
        this.natsClient.emit('auth.verification.resend', {
            email,
            displayName: user.displayName,
            magicToken,
            verificationUrl: `${process.env.FRONTEND_URL}/verify?token=${magicToken}`,
        });

        // Increment rate limit counter
        if (attemptsCount === 0) {
            await this.redis.set(rateLimitKey, '1', 'EX', 3600); // 1 hour
        } else {
            await this.redis.incr(rateLimitKey);
        }
    }

    /**
     * Verify email with OTP
     */
    async verifyEmail(email: string, otp: string): Promise<boolean> {
        const storedOtp = await this.redis.get(`otp:${email}`);

        if (!storedOtp || storedOtp !== otp) {
            return false;
        }

        // OTP valid - clear it
        await this.redis.del(`otp:${email}`);

        // Update user status to ACTIVE
        await this.prisma.user.update({
            where: { email },
            data: { status: UserStatus.ACTIVE }
        });

        return true;
    }

    /**
     * Update user profile
     */
    async updateProfile(
        userId: string,
        dto: { displayName?: string },
    ): Promise<UserResponseDTO & { permissions: string[] }> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                displayName: dto.displayName,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                displayName: true,
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
