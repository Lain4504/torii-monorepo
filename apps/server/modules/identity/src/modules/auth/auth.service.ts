import { Injectable, UnauthorizedException, ConflictException, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Redis from 'ioredis';
import * as argon2 from 'argon2';
import { REDIS_CLIENT } from '@server/shared';
import { JwtTokenProvider } from '@server/shared';
import { RBACService } from '../rbac/rbac.service';
import { TwoFactorAuthService } from '../two-factor-auth/two-factor-auth.service';
import { GoogleAuthService } from './google-auth.service';
import { UserIdentityRepository } from './user-identity.repository';
import { UsersRepository } from '../users/users.repository';

import { UserRole } from '@workspace/schemas';
import type {
    UserRegistrationDTO,
    UserLoginDTO,
    UserResponseDTO,
} from '@workspace/schemas';

export interface AuthResponse {
    user: UserResponseDTO;
    accessToken: string;
}

export interface LoginResponse {
    requiresTwoFactor: boolean;
    twoFactorMethod?: 'totp';
    tempToken?: string;
    user?: UserResponseDTO;
    accessToken?: string;
}

export interface AuthResult {
    success: boolean;
    data?: AuthResponse | { user: UserResponseDTO };
    message?: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersRepository: UsersRepository,

        private readonly jwtTokenProvider: JwtTokenProvider,
        private readonly rbacService: RBACService,
        private readonly twoFactorAuthService: TwoFactorAuthService,
        private readonly googleAuthService: GoogleAuthService,
        private readonly userIdentityRepository: UserIdentityRepository,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Register a new user
     */
    async register(dto: UserRegistrationDTO): Promise<UserResponseDTO> {
        // Check if email already exists
        const existingUser = await this.usersRepository.findByEmail(dto.email);

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const hashedPassword = await argon2.hash(dto.password);

        // Use email username as displayName if not provided
        const displayName = dto.displayName || dto.email.split('@')[0];

        // Create user
        const fullUser = await this.usersRepository.create({
            email: dto.email,
            password: hashedPassword,
            displayName,
            role: UserRole.LEARNER,
            // emailVerifiedAt: null (default) = pending verification
        });

        // Exclude password from response
        const { password, ...user } = fullUser;

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

        } as UserResponseDTO;
    }

    /**
     * Login user and generate JWT token
     * Now supports 2FA - returns requiresTwoFactor if 2FA is enabled
     */
    async login(dto: UserLoginDTO): Promise<LoginResponse> {
        // Find user
        const user = await this.usersRepository.findByEmail(dto.email);

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isValid = await argon2.verify(user.password, dto.password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active or pending
        // Check if user is banned or deleted
        if (user.deletedAt || (user.bannedUntil && user.bannedUntil > new Date())) {
            throw new UnauthorizedException('Account is disabled or deleted');
        }

        // Check if email is verified
        if (!user.verifiedAt) {
            throw new UnauthorizedException('Email not verified. Please check your email.');
        }

        // Check if 2FA is enabled
        const twoFactorStatus = await this.twoFactorAuthService.get2FAStatus(user.id);

        if (twoFactorStatus.isEnabled) {
            // Generate temporary token (valid for 5 minutes)
            // Defaulting to 'totp' since it's the only supported method now
            const tempToken = await this.generate2FATempToken(user.id, user.email, 'totp');

            return {
                requiresTwoFactor: true,
                twoFactorMethod: 'totp',
                tempToken,
            };
        }

        // No 2FA - proceed with normal login
        const accessToken = await this.jwtTokenProvider.generateToken({
            sub: user.id,
            role: user.role as UserRole,
        });

        return {
            requiresTwoFactor: false,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                verifiedAt: user.verifiedAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            } as UserResponseDTO,
            accessToken,
        };
    }

    /**
     * Generate temporary token for 2FA verification
     * Valid for 5 minutes
     */
    private async generate2FATempToken(userId: string, email: string, method: string): Promise<string> {
        const tempTokenExpiry = parseInt(process.env.TWO_FACTOR_TEMP_TOKEN_EXPIRY || '300'); // 5 minutes

        const payload = {
            userId,
            email,
            method,
            type: '2fa-temp',
        };

        // Generate token using JwtTokenProvider
        const token = await this.jwtTokenProvider.generateToken(
            payload as any,
            `${tempTokenExpiry}s` // Convert to seconds format (e.g., "300s")
        );

        // Store in Redis with expiry
        await this.redis.set(`2fa:temp:${userId}`, token, 'EX', tempTokenExpiry);

        return token;
    }

    /**
     * Verify 2FA code and complete login
     */
    async verify2FA(tempToken: string, code: string, isBackupCode: boolean = false): Promise<AuthResponse> {
        // Verify temp token
        let payload: any;
        try {
            payload = await this.jwtTokenProvider.verifyToken(tempToken);
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired temporary token');
        }

        if (payload.type !== '2fa-temp') {
            throw new UnauthorizedException('Invalid token type');
        }

        const userId = payload.userId;

        // Check if temp token exists in Redis
        const storedToken = await this.redis.get(`2fa:temp:${userId}`);
        if (!storedToken || storedToken !== tempToken) {
            throw new UnauthorizedException('Temporary token expired or already used');
        }

        // Verify 2FA code
        let isValid = false;
        if (isBackupCode) {
            isValid = await this.twoFactorAuthService.verifyBackupCode(userId, code);
        } else {
            // Only TOTP is supported now
            isValid = await this.twoFactorAuthService.verifyTotp(userId, code);
        }

        if (!isValid) {
            throw new UnauthorizedException('Invalid 2FA code');
        }

        // Delete temp token
        await this.redis.del(`2fa:temp:${userId}`);

        // Get user
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Generate access token
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
                verifiedAt: user.verifiedAt,
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
        const user = await this.usersRepository.getProfile(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Get permissions
        const { permissions } = await this.rbacService.getUserPermissions(user.id, user.role);

        return {
            ...user,
            verifiedAt: user.verifiedAt,
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
        await this.usersRepository.updateByEmail(email, { verifiedAt: new Date() });

        // Delete token (one-time use)
        await this.redis.del(`magic-link:${token}`);

        return { success: true, email };
    }

    /**
     * Resend verification OTP
     * Rate limited: 3 requests per hour per email
     */
    async resendVerification(email: string): Promise<void> {
        const user = await this.usersRepository.findByEmail(email);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Only allow resend for PENDING users (not yet verified)
        if (user.verifiedAt) {
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
        // Update user status to ACTIVE
        await this.usersRepository.updateByEmail(email, { verifiedAt: new Date() });

        return true;
    }

    /**
     * Update user profile
     */
    async updateProfile(
        userId: string,
        dto: { displayName?: string },
    ): Promise<UserResponseDTO & { permissions: string[] }> {
        const fullUser = await this.usersRepository.update(userId, {
            displayName: dto.displayName,
        });

        // Exclude password
        const { password, ...user } = fullUser;

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
        await this.usersRepository.softDelete(userId);
    }

    // ========================================
    // OAuth Methods
    // ========================================

    /**
     * Register or login with Google OAuth
     */
    async registerWithGoogle(idToken: string): Promise<AuthResponse> {
        // Verify Google ID token
        const googleUser = await this.googleAuthService.verifyIdToken(idToken);

        // Check if user exists by Google provider ID
        const existingIdentity = await this.userIdentityRepository.findByProvider(
            'google',
            googleUser.sub
        );

        if (existingIdentity) {
            // User exists - login
            // User exists - login
            const user = await this.usersRepository.findById(existingIdentity.userId);

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Update last sign in
            await this.usersRepository.update(user.id, { lastSignInAt: new Date() });

            await this.userIdentityRepository.updateLastSignIn(existingIdentity.id);

            // Generate token
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
                    verifiedAt: user.verifiedAt,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                } as UserResponseDTO,
                accessToken,
            };
        }

        // Check if email already exists
        const existingUser = await this.usersRepository.findByEmail(googleUser.email);

        if (existingUser) {
            // Link Google to existing account
            await this.userIdentityRepository.create({
                user: { connect: { id: existingUser.id } },
                provider: 'google',
                providerId: googleUser.sub,
                providerData: googleUser as any,
            });

            // Update user metadata
            const currentMetadata = (existingUser.appMetadata as any) || {};
            const providers = currentMetadata.providers || ['email'];

            await this.usersRepository.update(existingUser.id, {
                avatarUrl: googleUser.picture,
                appMetadata: {
                    ...currentMetadata,
                    providers: [...new Set([...providers, 'google'])],
                },
                userMetadata: googleUser as any,
                verifiedAt: googleUser.email_verified ? new Date() : existingUser.verifiedAt,
                lastSignInAt: new Date(),
            });

            const accessToken = await this.jwtTokenProvider.generateToken({
                sub: existingUser.id,
                role: existingUser.role as UserRole,
            });

            return {
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    displayName: existingUser.displayName,
                    role: existingUser.role,
                    emailVerified: true,
                    createdAt: existingUser.createdAt,
                    updatedAt: existingUser.updatedAt,
                } as UserResponseDTO,
                accessToken,
            };
        }

        // Create new user
        // Create new user
        const newUser = await this.usersRepository.create({
            email: googleUser.email,
            displayName: googleUser.name,
            avatarUrl: googleUser.picture,
            role: UserRole.LEARNER,
            verifiedAt: googleUser.email_verified ? new Date() : null,
            lastSignInAt: new Date(),
            appMetadata: {
                provider: 'google',
                providers: ['google'],
            },
            userMetadata: googleUser as any,
        });

        // Create Google identity
        await this.userIdentityRepository.create({
            user: { connect: { id: newUser.id } },
            provider: 'google',
            providerId: googleUser.sub,
            providerData: googleUser as any,
        });

        const accessToken = await this.jwtTokenProvider.generateToken({
            sub: newUser.id,
            role: newUser.role as UserRole,
        });

        return {
            user: {
                id: newUser.id,
                email: newUser.email,
                displayName: newUser.displayName,
                role: newUser.role,
                verifiedAt: newUser.verifiedAt,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
            } as UserResponseDTO,
            accessToken,
        };
    }

    /**
     * Link Google account to existing user
     */
    async linkGoogleAccount(userId: string, idToken: string): Promise<void> {
        // Verify Google ID token
        const googleUser = await this.googleAuthService.verifyIdToken(idToken);

        // Check if Google account already linked to another user
        const existingIdentity = await this.userIdentityRepository.findByProvider(
            'google',
            googleUser.sub
        );

        if (existingIdentity) {
            throw new ConflictException('This Google account is already linked to another user');
        }

        // Check if already linked to this user
        const hasGoogle = await this.userIdentityRepository.hasProvider(userId, 'google');
        if (hasGoogle) {
            throw new ConflictException('Google account already linked to this user');
        }

        // Create Google identity
        await this.userIdentityRepository.create({
            user: { connect: { id: userId } },
            provider: 'google',
            providerId: googleUser.sub,
            providerData: googleUser as any,
        });

        // Update user metadata
        const user = await this.usersRepository.findById(userId);
        const currentMetadata = (user?.appMetadata as any) || {};
        const providers = currentMetadata.providers || ['email'];

        await this.usersRepository.update(userId, {
            avatarUrl: user?.avatarUrl || googleUser.picture,
            appMetadata: {
                ...currentMetadata,
                providers: [...new Set([...providers, 'google'])],
            },
            userMetadata: googleUser as any,
        });
    }

    /**
     * Unlink OAuth provider from user
     */
    async unlinkProvider(userId: string, provider: string): Promise<void> {
        // Check if user has multiple providers
        const identityCount = await this.userIdentityRepository.countByUserId(userId);

        if (identityCount <= 1) {
            throw new BadRequestException('Cannot unlink last authentication method');
        }

        // Find and delete identity
        const identities = await this.userIdentityRepository.findByUserId(userId);
        const identity = identities.find(i => i.provider === provider);

        if (!identity) {
            throw new NotFoundException('Provider not linked to this account');
        }

        await this.userIdentityRepository.delete(identity.id);

        // Update user metadata
        const user = await this.usersRepository.findById(userId);
        const currentMetadata = (user?.appMetadata as any) || {};
        const providers = (currentMetadata.providers || []).filter((p: string) => p !== provider);

        await this.usersRepository.update(userId, {
            appMetadata: {
                ...currentMetadata,
                provider: providers[0] || 'email',
                providers,
            },
        });
    }

    /**
     * Get linked providers for user
     */
    async getLinkedProviders(userId: string) {
        const identities = await this.userIdentityRepository.findByUserId(userId);

        return identities.map(identity => ({
            provider: identity.provider,
            providerId: identity.providerId,
            linkedAt: identity.createdAt,
            lastSignInAt: identity.lastSignInAt,
        }));
    }
}
