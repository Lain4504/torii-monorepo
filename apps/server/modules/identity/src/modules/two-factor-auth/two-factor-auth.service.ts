import {
    Injectable,
    Logger,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';
import { PrismaService, REDIS_CLIENT, EncryptionService } from '@server/shared';
import { TwoFactorAuthRepository } from './two-factor-auth.repository';
import type {
    TwoFactorAuthStatus,
    TotpSetupResponse,
    EnableTotpResponse,
    TwoFactorMethod,
} from './interfaces/two-factor-auth.interface';

/**
 * Two-Factor Authentication Service
 * Handles TOTP, Email OTP, and SMS OTP authentication
 */
@Injectable()
export class TwoFactorAuthService {
    private readonly logger = new Logger(TwoFactorAuthService.name);
    private readonly issuer = process.env.TWO_FACTOR_ISSUER || 'Torii Nihongo';

    constructor(
        private readonly prisma: PrismaService, // Keep for user queries
        private readonly twoFactorAuthRepository: TwoFactorAuthRepository,
        private readonly encryptionService: EncryptionService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) {
        // Configure TOTP settings
        authenticator.options = {
            window: 1, // Allow 1 step before/after current time (30 seconds)
        };
    }

    // ========================================
    // TOTP Methods
    // ========================================

    /**
     * Generate TOTP secret and QR code for user
     */
    async generateTotpSecret(userId: string): Promise<TotpSetupResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, displayName: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Generate secret
        const secret = authenticator.generateSecret();

        // Create otpauth URL for QR code
        const otpauthUrl = authenticator.keyuri(
            user.email,
            this.issuer,
            secret
        );

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

        this.logger.log(`Generated TOTP secret for user ${userId}`);

        return {
            secret,
            qrCodeUrl,
            manualEntryKey: secret,
        };
    }

    /**
     * Enable TOTP 2FA for user
     * Verifies the code before enabling
     */
    async enableTotp(
        userId: string,
        secret: string,
        code: string,
    ): Promise<EnableTotpResponse> {
        // Verify the code with the secret
        const isValid = authenticator.verify({ token: code, secret });

        if (!isValid) {
            throw new BadRequestException('Invalid verification code');
        }

        // Encrypt secret before storing
        const encryptedSecret = this.encryptionService.encrypt(secret);

        // Generate backup codes
        const backupCodes = await this.generateBackupCodes(userId);

        // Save to database
        await this.twoFactorAuthRepository.upsert(
            userId,
            {
                user: { connect: { id: userId } },
                isEnabled: true,
                method: 'totp',
                totpSecret: encryptedSecret,
                totpBackupCodes: await this.hashBackupCodes(backupCodes),
                enabledAt: new Date(),
            },
            {
                isEnabled: true,
                method: 'totp',
                totpSecret: encryptedSecret,
                totpBackupCodes: await this.hashBackupCodes(backupCodes),
                enabledAt: new Date(),
                failedAttempts: 0,
                lockedUntil: null,
            },
        );

        this.logger.log(`TOTP 2FA enabled for user ${userId}`);

        return {
            success: true,
            backupCodes,
            message: 'TOTP 2FA enabled successfully. Please save your backup codes in a safe place.',
        };
    }

    /**
     * Verify TOTP code
     */
    async verifyTotp(userId: string, code: string): Promise<boolean> {
        // Check rate limiting
        await this.checkRateLimit(userId);

        const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
            where: { userId },
        });

        if (!twoFactorAuth || !twoFactorAuth.isEnabled || !twoFactorAuth.totpSecret) {
            throw new BadRequestException('TOTP 2FA is not enabled');
        }

        // Check if account is locked
        if (twoFactorAuth.lockedUntil && twoFactorAuth.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil(
                (twoFactorAuth.lockedUntil.getTime() - Date.now()) / 60000
            );
            throw new UnauthorizedException(
                `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`
            );
        }

        // Decrypt secret
        const secret = this.encryptionService.decrypt(twoFactorAuth.totpSecret);

        // Verify code
        const isValid = authenticator.verify({ token: code, secret });

        if (isValid) {
            // Reset failed attempts
            await this.resetFailedAttempts(userId);

            // Update last used
            await this.prisma.twoFactorAuth.update({
                where: { userId },
                data: { lastUsedAt: new Date() },
            });

            this.logger.log(`TOTP verification successful for user ${userId}`);
            return true;
        } else {
            // Increment failed attempts
            await this.incrementFailedAttempts(userId);
            return false;
        }
    }

    // ========================================
    // Backup Codes Methods
    // ========================================

    /**
     * Generate backup codes
     */
    private async generateBackupCodes(userId: string): Promise<string[]> {
        // Generate 10 random 8-character codes
        const codes = Array.from({ length: 10 }, () =>
            randomBytes(4).toString('hex').toUpperCase()
        );

        this.logger.log(`Generated ${codes.length} backup codes for user ${userId}`);
        return codes;
    }

    /**
     * Hash backup codes before storing
     */
    private async hashBackupCodes(codes: string[]): Promise<string[]> {
        return Promise.all(codes.map(code => argon2.hash(code)));
    }

    /**
     * Verify backup code
     */
    async verifyBackupCode(userId: string, code: string): Promise<boolean> {
        // Check rate limiting
        await this.checkRateLimit(userId);

        const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
            where: { userId },
        });

        if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
            throw new BadRequestException('2FA is not enabled');
        }

        // Try to match against all backup codes
        for (let i = 0; i < twoFactorAuth.totpBackupCodes.length; i++) {
            const isValid = await argon2.verify(
                twoFactorAuth.totpBackupCodes[i],
                code
            );

            if (isValid) {
                // Remove used code
                await this.twoFactorAuthRepository.removeBackupCode(userId, i);
                await this.twoFactorAuthRepository.updateLastUsed(userId);

                // Reset failed attempts
                await this.resetFailedAttempts(userId);

                const remaining = twoFactorAuth.totpBackupCodes.length - 1;
                this.logger.log(`Backup code used for user ${userId}. ${remaining} codes remaining.`);
                return true;
            }
        }

        // Increment failed attempts
        await this.incrementFailedAttempts(userId);
        return false;
    }

    /**
     * Regenerate backup codes
     */
    async regenerateBackupCodes(userId: string): Promise<string[]> {
        const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
            where: { userId },
        });

        if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
            throw new BadRequestException('2FA is not enabled');
        }

        // Generate new codes
        const newCodes = await this.generateBackupCodes(userId);

        // Update database
        await this.twoFactorAuthRepository.updateBackupCodes(
            userId,
            await this.hashBackupCodes(newCodes)
        );

        this.logger.log(`Regenerated backup codes for user ${userId}`);
        return newCodes;
    }

    // ========================================
    // Email/SMS OTP Methods
    // ========================================

    /**
     * Send Email OTP
     */
    async sendEmailOtp(userId: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, displayName: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in Redis with 5 minutes expiry
        await this.redis.set(`2fa:email:${userId}`, otp, 'EX', 300);

        // Emit NATS event for notification service
        this.natsClient.emit('auth.2fa.email', {
            email: user.email,
            displayName: user.displayName,
            otp,
        });

        this.logger.log(`Email OTP sent to user ${userId}`);
    }

    /**
     * Send SMS OTP
     */
    async sendSmsOtp(userId: string): Promise<void> {
        const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
            where: { userId },
        });

        if (!twoFactorAuth || !twoFactorAuth.phoneNumber || !twoFactorAuth.phoneVerified) {
            throw new BadRequestException('Phone number not verified');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in Redis with 5 minutes expiry
        await this.redis.set(`2fa:sms:${userId}`, otp, 'EX', 300);

        // Emit NATS event for SMS service
        this.natsClient.emit('auth.2fa.sms', {
            phoneNumber: twoFactorAuth.phoneNumber,
            otp,
        });

        this.logger.log(`SMS OTP sent to user ${userId}`);
    }

    /**
     * Verify Email/SMS OTP
     */
    async verifyOtp(
        userId: string,
        code: string,
        method: '2fa-email' | '2fa-sms',
    ): Promise<boolean> {
        // Check rate limiting
        await this.checkRateLimit(userId);

        const key = method === '2fa-email' ? `2fa:email:${userId}` : `2fa:sms:${userId}`;
        const storedOtp = await this.redis.get(key);

        if (!storedOtp) {
            throw new BadRequestException('OTP expired or not found');
        }

        if (storedOtp === code) {
            // Delete OTP
            await this.redis.del(key);

            // Reset failed attempts
            await this.resetFailedAttempts(userId);

            // Update last used
            await this.prisma.twoFactorAuth.update({
                where: { userId },
                data: { lastUsedAt: new Date() },
            });

            this.logger.log(`${method} OTP verification successful for user ${userId}`);
            return true;
        } else {
            // Increment failed attempts
            await this.incrementFailedAttempts(userId);
            return false;
        }
    }

    // ========================================
    // Management Methods
    // ========================================

    /**
     * Enable Email 2FA
     */
    async enableEmailOtp(userId: string): Promise<void> {
        await this.prisma.twoFactorAuth.upsert({
            where: { userId },
            create: {
                userId,
                isEnabled: true,
                method: 'email',
                enabledAt: new Date(),
            },
            update: {
                isEnabled: true,
                method: 'email',
                enabledAt: new Date(),
                failedAttempts: 0,
                lockedUntil: null,
            },
        });

        this.logger.log(`Email 2FA enabled for user ${userId}`);
    }

    /**
     * Enable SMS 2FA (requires phone verification first)
     */
    async enableSmsOtp(userId: string, phoneNumber: string): Promise<void> {
        // Generate verification OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in Redis with 10 minutes expiry
        await this.redis.set(`2fa:phone-verify:${userId}`, otp, 'EX', 600);

        // Save phone number (not verified yet)
        await this.prisma.twoFactorAuth.upsert({
            where: { userId },
            create: {
                userId,
                phoneNumber,
                phoneVerified: false,
            },
            update: {
                phoneNumber,
                phoneVerified: false,
            },
        });

        // Emit NATS event for SMS service
        this.natsClient.emit('auth.2fa.phone-verify', {
            phoneNumber,
            otp,
        });

        this.logger.log(`Phone verification OTP sent to user ${userId}`);
    }

    /**
     * Verify phone number
     */
    async verifyPhone(userId: string, code: string): Promise<void> {
        const storedOtp = await this.redis.get(`2fa:phone-verify:${userId}`);

        if (!storedOtp || storedOtp !== code) {
            throw new BadRequestException('Invalid or expired verification code');
        }

        // Delete OTP
        await this.redis.del(`2fa:phone-verify:${userId}`);

        // Update phone as verified and enable SMS 2FA
        await this.prisma.twoFactorAuth.update({
            where: { userId },
            data: {
                phoneVerified: true,
                isEnabled: true,
                method: 'sms',
                enabledAt: new Date(),
            },
        });

        this.logger.log(`Phone verified and SMS 2FA enabled for user ${userId}`);
    }

    /**
     * Disable 2FA
     */
    async disable2FA(userId: string): Promise<void> {
        await this.prisma.twoFactorAuth.update({
            where: { userId },
            data: {
                isEnabled: false,
                totpSecret: null,
                totpBackupCodes: [],
                failedAttempts: 0,
                lockedUntil: null,
            },
        });

        this.logger.log(`2FA disabled for user ${userId}`);
    }

    /**
     * Get 2FA status
     */
    async get2FAStatus(userId: string): Promise<TwoFactorAuthStatus> {
        const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
            where: { userId },
        });

        if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
            return { isEnabled: false };
        }

        // Mask phone number
        let maskedPhone: string | undefined;
        if (twoFactorAuth.phoneNumber) {
            const phone = twoFactorAuth.phoneNumber;
            maskedPhone = phone.slice(0, 3) + '***' + phone.slice(-4);
        }

        return {
            isEnabled: true,
            method: twoFactorAuth.method as TwoFactorMethod,
            phoneNumber: maskedPhone,
            backupCodesRemaining: twoFactorAuth.totpBackupCodes.length,
            enabledAt: twoFactorAuth.enabledAt || undefined,
            lastUsedAt: twoFactorAuth.lastUsedAt || undefined,
        };
    }

    // ========================================
    // Security Methods
    // ========================================

    /**
     * Check rate limiting
     */
    async checkRateLimit(userId: string): Promise<void> {
        const key = `2fa:attempts:${userId}`;
        const attempts = await this.redis.get(key);

        if (attempts && parseInt(attempts) >= 5) {
            // Check if account is locked
            const lockKey = `2fa:locked:${userId}`;
            const locked = await this.redis.get(lockKey);

            if (locked) {
                const ttl = await this.redis.ttl(lockKey);
                throw new UnauthorizedException(
                    `Account locked. Try again in ${Math.ceil(ttl / 60)} minutes.`
                );
            }
        }
    }

    /**
     * Increment failed attempts
     */
    async incrementFailedAttempts(userId: string): Promise<void> {
        const key = `2fa:attempts:${userId}`;
        const attempts = await this.redis.incr(key);

        if (attempts === 1) {
            await this.redis.expire(key, 900); // 15 minutes
        }

        if (attempts >= 5) {
            // Lock account for 30 minutes
            await this.redis.set(`2fa:locked:${userId}`, '1', 'EX', 1800);

            // Update database
            await this.prisma.twoFactorAuth.update({
                where: { userId },
                data: {
                    lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
                    failedAttempts: attempts,
                },
            });

            this.logger.warn(`User ${userId} locked due to ${attempts} failed 2FA attempts`);
        }
    }

    /**
     * Reset failed attempts
     */
    async resetFailedAttempts(userId: string): Promise<void> {
        await this.redis.del(`2fa:attempts:${userId}`);
        await this.redis.del(`2fa:locked:${userId}`);

        await this.prisma.twoFactorAuth.update({
            where: { userId },
            data: {
                failedAttempts: 0,
                lockedUntil: null,
            },
        });
    }
}
