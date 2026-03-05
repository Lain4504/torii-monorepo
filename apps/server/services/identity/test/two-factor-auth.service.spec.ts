import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorAuthService } from '../src/modules/two-factor-auth/two-factor-auth.service';
import {
  AppConfigService,
  EncryptionService,
  PrismaService,
} from '@server/shared';
import { TWO_FACTOR_AUTH_REPOSITORY_TOKEN } from '../src/interfaces/repositories';
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import * as argon2 from 'argon2';

// Mock external libraries
jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn(),
    keyuri: jest.fn(),
    verify: jest.fn(),
    options: {},
  },
}));
jest.mock('qrcode');
jest.mock('argon2');

describe('TwoFactorAuthService', () => {
  let service: TwoFactorAuthService;
  let prisma: any;
  let twoFactorAuthRepository: any;
  let encryptionService: any;
  let redis: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  const mockTwoFactorAuth = {
    userId: 'user-123',
    isEnabled: true,
    method: 'totp',
    totpSecret: 'encrypted-secret',
    totpBackupCodes: ['hashed-code-1', 'hashed-code-2'],
    enabledAt: new Date(),
    failedAttempts: 0,
    lockedUntil: null,
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
    };

    const mockTwoFactorAuthRepository = {
      findByUserId: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      updateLastUsed: jest.fn(),
      removeBackupCode: jest.fn(),
      resetFailedAttempts: jest.fn(),
      updateBackupCodes: jest.fn(),
    };

    const mockEncryptionService = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    };

    const mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
      ttl: jest.fn(),
    };

    const mockAppConfigService = {
      identity: {
        twoFactorIssuer: 'Torii',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorAuthService,
        { provide: AppConfigService, useValue: mockAppConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: TWO_FACTOR_AUTH_REPOSITORY_TOKEN,
          useValue: mockTwoFactorAuthRepository,
        },
        { provide: EncryptionService, useValue: mockEncryptionService },
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
      ],
    }).compile();

    service = module.get<TwoFactorAuthService>(TwoFactorAuthService);
    prisma = module.get(PrismaService);
    twoFactorAuthRepository = module.get(TWO_FACTOR_AUTH_REPOSITORY_TOKEN);
    encryptionService = module.get(EncryptionService);
    redis = module.get('REDIS_CLIENT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTotpSecret', () => {
    it('should generate secret and QR code for user', async () => {
      twoFactorAuthRepository.findByUserId.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (authenticator.generateSecret as jest.Mock).mockReturnValue('secret');
      (authenticator.keyuri as jest.Mock).mockReturnValue('otpauth://...');
      (QRCode.toDataURL as jest.Mock).mockResolvedValue(
        'data:image/png;base64,...',
      );

      const result = await service.generateTotpSecret(mockUser.id);

      expect(result.secret).toBe('secret');
      expect(result.qrCodeUrl).toBe('data:image/png;base64,...');
      expect(result.manualEntryKey).toBe('secret');
    });

    it('should throw BadRequestException if 2FA already enabled', async () => {
      twoFactorAuthRepository.findByUserId.mockResolvedValue({
        isEnabled: true,
      });
      await expect(service.generateTotpSecret(mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      twoFactorAuthRepository.findByUserId.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.generateTotpSecret(mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('enableTotp', () => {
    it('should enable TOTP 2FA successfully', async () => {
      const secret = 'secret';
      const code = '123456';

      twoFactorAuthRepository.findByUserId.mockResolvedValue(null);
      (authenticator.verify as jest.Mock).mockReturnValue(true);
      encryptionService.encrypt.mockReturnValue('encrypted-secret');
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-code');

      const result = await service.enableTotp(mockUser.id, secret, code);

      expect(result.success).toBe(true);
      expect(twoFactorAuthRepository.upsert).toHaveBeenCalled();
      expect(result.backupCodes).toHaveLength(10);
    });

    it('should throw BadRequestException for invalid code', async () => {
      twoFactorAuthRepository.findByUserId.mockResolvedValue(null);
      (authenticator.verify as jest.Mock).mockReturnValue(false);

      await expect(
        service.enableTotp(mockUser.id, 'secret', 'wrong-code'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyTotp', () => {
    it('should return true for valid code', async () => {
      redis.get.mockResolvedValue(null); // No rate limit
      twoFactorAuthRepository.findByUserId.mockResolvedValue(mockTwoFactorAuth);
      encryptionService.decrypt.mockReturnValue('secret');
      (authenticator.verify as jest.Mock).mockReturnValue(true);

      const result = await service.verifyTotp(mockUser.id, '123456');

      expect(result).toBe(true);
      expect(twoFactorAuthRepository.updateLastUsed).toHaveBeenCalled();
      expect(twoFactorAuthRepository.resetFailedAttempts).toHaveBeenCalled();
    });

    it('should return false for invalid code and increment attempts', async () => {
      redis.get.mockResolvedValue(null);
      twoFactorAuthRepository.findByUserId.mockResolvedValue(mockTwoFactorAuth);
      encryptionService.decrypt.mockReturnValue('secret');
      (authenticator.verify as jest.Mock).mockReturnValue(false);

      // redis.incr logic inside incrementFailedAttempts
      redis.incr.mockResolvedValue(1);

      const result = await service.verifyTotp(mockUser.id, 'wrong');

      expect(result).toBe(false);
      expect(redis.incr).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if account locked', async () => {
      const lockedAuth = {
        ...mockTwoFactorAuth,
        lockedUntil: new Date(Date.now() + 30000),
      };
      redis.get.mockResolvedValue(null); // passed rate limit check implementation nuance (or not checked if locked provided in DB?)
      // Wait, checkRateLimit logic uses Redis. If DB has lock, verifyTotp also checks logic.
      // verifyTotp line 173 checks DB lockedUntil.

      twoFactorAuthRepository.findByUserId.mockResolvedValue(lockedAuth);

      await expect(service.verifyTotp(mockUser.id, '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyBackupCode', () => {
    it('should return true for valid backup code', async () => {
      redis.get.mockResolvedValue(null);
      twoFactorAuthRepository.findByUserId.mockResolvedValue(mockTwoFactorAuth);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true); // First code matches

      const result = await service.verifyBackupCode(mockUser.id, 'code');

      expect(result).toBe(true);
      expect(twoFactorAuthRepository.removeBackupCode).toHaveBeenCalled();
    });

    it('should return false if no backup code matches', async () => {
      redis.get.mockResolvedValue(null);
      twoFactorAuthRepository.findByUserId.mockResolvedValue(mockTwoFactorAuth);
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      redis.incr.mockResolvedValue(1);

      const result = await service.verifyBackupCode(mockUser.id, 'wrong-code');

      expect(result).toBe(false);
      expect(redis.incr).toHaveBeenCalled();
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA', async () => {
      await service.disable2FA(mockUser.id);
      expect(twoFactorAuthRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ isEnabled: false }),
      );
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should regenerate backup codes', async () => {
      twoFactorAuthRepository.findByUserId.mockResolvedValue(mockTwoFactorAuth);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-code');

      const result = await service.regenerateBackupCodes(mockUser.id);

      expect(result).toHaveLength(10);
      expect(twoFactorAuthRepository.updateBackupCodes).toHaveBeenCalled();
    });
  });
});
