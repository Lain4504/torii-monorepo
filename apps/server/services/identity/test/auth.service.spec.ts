// @ts-nocheck

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import {
  AppConfigService,
  BlacklistService,
  JwtTokenProvider,
} from '@server/shared';
import { of } from 'rxjs';
import {
  USERS_REPOSITORY_TOKEN,
  USER_IDENTITY_REPOSITORY_TOKEN,
} from '../src/interfaces/repositories';
import {
  SESSION_SERVICE_TOKEN,
  GOOGLE_AUTH_SERVICE_TOKEN,
  FACEBOOK_AUTH_SERVICE_TOKEN,
  AUTHORIZATION_SERVICE_TOKEN,
  TWO_FACTOR_AUTH_SERVICE_TOKEN,
  NOTIFICATION_SERVICE_TOKEN,
} from '../src/interfaces/services';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserRole } from '@workspace/schemas';

// Mock argon2
jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: any;
  let jwtTokenProvider: any;
  let sessionService: any;
  let twoFactorAuthService: any;
  let authorizationService: any;
  let redis: any;
  let natsClient: any;
  let blacklistService: any;
  let googleAuthService: any;
  let facebookAuthService: any;
  let notificationService: any;
  let userIdentityRepository: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed-password',
    displayName: 'Test User',
    role: UserRole.LEARNER,
    verifiedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: [],
  };

  beforeEach(async () => {
    // Create mocks
    const mockUsersRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updateByEmail: jest.fn(),
      getUserBasicInfo: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockUserIdentityRepository = {
      create: jest.fn(),
      findByProvider: jest.fn(),
      hasProvider: jest.fn(),
      countByUserId: jest.fn(),
      findByUserId: jest.fn(),
      updateLastSignIn: jest.fn(),
      delete: jest.fn(),
    };

    const mockJwtTokenProvider = {
      verifyRefreshToken: jest.fn(),
      generate2FATempToken: jest.fn(),
      verify2FATempToken: jest.fn(),
      generateToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    };

    const mockAuthorizationService = {
      getUserPermissions: jest.fn(),
    };

    const mockTwoFactorAuthService = {
      get2FAStatus: jest.fn(),
      verifyTotp: jest.fn(),
      verifyBackupCode: jest.fn(),
    };

    const mockSessionService = {
      createSession: jest.fn(),
      revokeSession: jest.fn(),
      hashTokenPublic: jest.fn(),
      revokeAllUserSessions: jest.fn(),
    };

    const mockGoogleAuthService = {
      verifyIdToken: jest.fn(),
    };

    const mockFacebookAuthService = {
      verifyAccessToken: jest.fn(),
    };

    const mockNotificationService = {
      send: jest.fn(),
      sendEmail: jest.fn(),
    };

    const mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      incr: jest.fn(),
      ttl: jest.fn(),
    };

    const mockNatsClient = {
      send: jest.fn(),
      emit: jest.fn(),
    };

    const mockBlacklistService = {
      blacklist: jest.fn(),
    };

    const mockAppConfigService = {
      identity: {
        frontendUrl: 'http://localhost:3000',
        twoFactorTempTokenExpiry: 300,
      },
      security: {
        wajlc: { apiKey: 'key', apiSecret: 'secret' },
      },
      livekit: { apiKey: 'key', apiSecret: 'secret' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AppConfigService, useValue: mockAppConfigService },
        { provide: USERS_REPOSITORY_TOKEN, useValue: mockUsersRepository },
        {
          provide: USER_IDENTITY_REPOSITORY_TOKEN,
          useValue: mockUserIdentityRepository,
        },
        { provide: JwtTokenProvider, useValue: mockJwtTokenProvider },
        {
          provide: AUTHORIZATION_SERVICE_TOKEN,
          useValue: mockAuthorizationService,
        },
        {
          provide: TWO_FACTOR_AUTH_SERVICE_TOKEN,
          useValue: mockTwoFactorAuthService,
        },
        { provide: SESSION_SERVICE_TOKEN, useValue: mockSessionService },
        { provide: GOOGLE_AUTH_SERVICE_TOKEN, useValue: mockGoogleAuthService },
        {
          provide: FACEBOOK_AUTH_SERVICE_TOKEN,
          useValue: mockFacebookAuthService,
        },
        {
          provide: NOTIFICATION_SERVICE_TOKEN,
          useValue: mockNotificationService,
        },
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
        { provide: 'NATS_SERVICE', useValue: mockNatsClient },
        { provide: BlacklistService, useValue: mockBlacklistService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(USERS_REPOSITORY_TOKEN);
    jwtTokenProvider = module.get(JwtTokenProvider);
    sessionService = module.get(SESSION_SERVICE_TOKEN);
    twoFactorAuthService = module.get(TWO_FACTOR_AUTH_SERVICE_TOKEN);
    authorizationService = module.get(AUTHORIZATION_SERVICE_TOKEN);
    redis = module.get('REDIS_CLIENT');
    natsClient = module.get('NATS_SERVICE');
    blacklistService = module.get(BlacklistService);
    googleAuthService = module.get(GOOGLE_AUTH_SERVICE_TOKEN);
    facebookAuthService = module.get(FACEBOOK_AUTH_SERVICE_TOKEN);
    notificationService = module.get(NOTIFICATION_SERVICE_TOKEN);
    userIdentityRepository = module.get(USER_IDENTITY_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test',
      platform: 'web',
      clientType: 'learner',
      clientType: 'learner' as const,
    };

    it('should register a new user successfully', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersRepository.create.mockResolvedValue(mockUser);

      // Mock generateVerificationToken behavior inside register
      // It calls redis.set
      redis.set.mockResolvedValue('OK');

      const result = await service.register(registerDto);

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(argon2.hash).toHaveBeenCalledWith(registerDto.password);
      expect(usersRepository.create).toHaveBeenCalled();
      expect(natsClient.emit).toHaveBeenCalledWith(
        { cmd: 'send_email' },
        expect.objectContaining({ type: 'verification' }),
      );
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw ConflictException if email exists', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      twoFactorAuthService.get2FAStatus.mockResolvedValue({ isEnabled: false });
      sessionService.createSession.mockResolvedValue({
        sessionId: 'session-123',
        refreshToken: 'refresh-token',
      });
      authorizationService.getUserPermissions.mockResolvedValue({
        permissions: [],
      });

      // Mock generateAccessToken (private method calls jwtTokenProvider.generateToken)
      jwtTokenProvider.generateToken.mockResolvedValue('access-token');

      const result = await service.login(loginDto);

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(argon2.verify).toHaveBeenCalledWith(
        mockUser.password,
        loginDto.password,
      );
      expect(result.accessToken).toBe('access-token');
      expect(result.requiresTwoFactor).toBe(false);
    });

    it('should verify 2FA if enabled', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      twoFactorAuthService.get2FAStatus.mockResolvedValue({ isEnabled: true });

      // It calls generate2FATempToken -> jwtTokenProvider.generate2FATempToken
      jwtTokenProvider.generate2FATempToken.mockResolvedValue('temp-token');
      redis.set.mockResolvedValue('OK');

      const result = await service.login(loginDto);

      expect(result.requiresTwoFactor).toBe(true);
      expect(result.tempToken).toBe('temp-token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('adminLogin', () => {
    const loginDto = { email: 'admin@test.com', password: 'password123' };

    it('should login admin successfully if they have permissions', async () => {
      usersRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        role: UserRole.ADMIN,
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      authorizationService.getUserPermissions.mockResolvedValue({
        permissions: ['*'],
      });
      twoFactorAuthService.get2FAStatus.mockResolvedValue({ isEnabled: false });
      sessionService.createSession.mockResolvedValue({
        sessionId: 's1',
        refreshToken: 'r1',
      });
      jwtTokenProvider.generateToken.mockResolvedValue('access-token');

      const result = await service.adminLogin(loginDto);

      expect(result.user?.role).toBe(UserRole.ADMIN);
      expect(result.accessToken).toBe('access-token');
    });

    it('should throw UnauthorizedException if user has no permissions', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      authorizationService.getUserPermissions.mockResolvedValue({
        permissions: [],
      });

      await expect(service.adminLogin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should blacklist access token and revoke session', async () => {
      const accessToken = 'access.token.jwt';
      const refreshToken = 'refresh.token.jwt';

      // Mock jwt.decode for blacklist logic inside logout
      jest.spyOn(require('jsonwebtoken'), 'decode').mockReturnValue({
        jti: 'jti-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      jwtTokenProvider.verifyRefreshToken.mockResolvedValue({
        sid: 'session-123',
      });
      sessionService.hashTokenPublic.mockReturnValue('hashed-refresh-token');

      await service.logout(accessToken, refreshToken);

      expect(blacklistService.blacklist).toHaveBeenCalled();
      expect(sessionService.revokeSession).toHaveBeenCalledWith(
        'hashed-refresh-token',
      );
      expect(redis.del).toHaveBeenCalledWith('session:session-123:permissions');
    });
  });

  describe('verify2FA', () => {
    it('should verify TOTP and return tokens', async () => {
      const tempToken = 'temp-token';
      const code = '123456';

      jwtTokenProvider.verify2FATempToken.mockResolvedValue({
        userId: mockUser.id,
        sub: mockUser.id,
      });
      redis.get.mockResolvedValue(tempToken); // Stored token matches
      twoFactorAuthService.verifyTotp.mockResolvedValue(true);
      usersRepository.findById.mockResolvedValue(mockUser);

      sessionService.createSession.mockResolvedValue({
        sessionId: 'session-123',
        refreshToken: 'refresh-token',
      });
      authorizationService.getUserPermissions.mockResolvedValue({
        permissions: [],
      });
      jwtTokenProvider.generateToken.mockResolvedValue('access-token');

      const result = await service.verify2FA(tempToken, code);

      expect(twoFactorAuthService.verifyTotp).toHaveBeenCalledWith(
        mockUser.id,
        code,
      );
      expect(redis.del).toHaveBeenCalledWith(`2fa:temp:${mockUser.id}`);
      expect(result.accessToken).toBe('access-token');
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email for web platform', async () => {
      const dto = {
        email: 'test@example.com',
        platform: 'web',
        clientType: 'learner',
        clientType: 'learner' as const,
      };
      usersRepository.findByEmail.mockResolvedValue(mockUser); // User exists
      redis.get.mockResolvedValue(null); // No rate limit
      redis.set.mockResolvedValue('OK');

      await service.forgotPassword(dto);

      expect(natsClient.emit).toHaveBeenCalledWith(
        { cmd: 'send_email' },
        expect.objectContaining({ type: 'password_reset' }),
      );
      expect(redis.set).toHaveBeenCalledTimes(2); // One for token, one for rate limit
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP successfully', async () => {
      const dto = {
        email: 'test@example.com',
        otp: '123456',
        type: 'registration' as const,
      };
      redis.get.mockResolvedValue('123456');

      const result = await service.verifyOTP(dto);

      expect(result.success).toBe(true);
      expect(redis.del).toHaveBeenCalledWith(`otp:registration:${dto.email}`);
      expect(usersRepository.updateByEmail).toHaveBeenCalledWith(
        dto.email,
        expect.anything(),
      );
    });
  });

  describe('updateUser', () => {
    it('should update user display name and metadata', async () => {
      const dto = { displayName: 'New Name', userMetadata: { theme: 'dark' } };
      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.update.mockResolvedValue({ ...mockUser, ...dto });
      authorizationService.getUserPermissions.mockResolvedValue({
        permissions: [],
      });

      const result = await service.updateUser(mockUser.id, dto);

      expect(result.displayName).toBe(dto.displayName);
      expect(result.userMetadata).toEqual({ theme: 'dark' });
      expect(usersRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          displayName: dto.displayName,
        }),
      );
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar and delete old one', async () => {
      const fileId = 'new-file-id';
      const oldAvatarUrl = 'http://storage.test/old-avatar.png';
      usersRepository.findById.mockResolvedValue({
        ...mockUser,
        avatarUrl: oldAvatarUrl,
      });

      // Mock NATS send using RxJS of()
      natsClient.send.mockImplementation((pattern) => {
        if (pattern.cmd === 'academy.storage.findById') {
          return of({
            status: 'uploaded',
            fileUrl: 'http://storage.test/new-avatar.png',
          });
        }
        if (pattern.cmd === 'academy.storage.deleteFile') {
          return of({ success: true });
        }
        return of(null);
      });

      usersRepository.update.mockResolvedValue({
        ...mockUser,
        avatarUrl: 'http://storage.test/new-avatar.png',
      });
      authorizationService.getUserPermissions.mockResolvedValue({
        permissions: [],
      });

      const result = await service.updateAvatar(mockUser.id, fileId);

      expect(result.avatarUrl).toBe('http://storage.test/new-avatar.png');
      expect(natsClient.send).toHaveBeenCalledWith(
        { cmd: 'academy.storage.deleteFile' },
        expect.any(Object),
      );
    });
  });

  describe('invited user flow', () => {
    const token = 'invite-token';

    it('should verify invite token', async () => {
      redis.get.mockResolvedValue(mockUser.id);
      usersRepository.findById.mockResolvedValue({
        ...mockUser,
        password: null,
      });

      const result = await service.verifyInviteToken(token);

      expect(result.success).toBe(true);
      expect(result.email).toBe(mockUser.email);
    });

    it('should set password for invited user', async () => {
      redis.get.mockResolvedValue(mockUser.id);
      usersRepository.findById.mockResolvedValue({
        ...mockUser,
        password: null,
      });
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      usersRepository.update.mockResolvedValue({
        ...mockUser,
        password: 'new-hashed-password',
      });

      await service.setPassword(token, 'newPassword123');

      expect(usersRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          password: 'new-hashed-password',
        }),
      );
      expect(redis.del).toHaveBeenCalledWith(`invite-token:${token}`);
      expect(natsClient.emit).toHaveBeenCalledWith(
        { cmd: 'send_email' },
        expect.objectContaining({ type: 'welcome' }),
      );
    });
  });

  describe('OAuth and Providers', () => {
    const idToken = 'google-id-token';
    const googleUser = {
      sub: 'google-sub-123',
      email: 'google@test.com',
      name: 'Google User',
      picture: 'http://photo.test',
      email_verified: true,
    };

    it('should register/login with Google successfully', async () => {
      googleAuthService.verifyIdToken.mockResolvedValue(googleUser);
      userIdentityRepository.findByProvider.mockResolvedValue(null); // New user
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue({
        ...mockUser,
        email: googleUser.email,
      });
      authorizationService.getUserPermissions.mockResolvedValue({
        permissions: [],
      });
      sessionService.createSession.mockResolvedValue({
        sessionId: 's1',
        refreshToken: 'r1',
      });
      jwtTokenProvider.generateToken.mockResolvedValue('access-token');

      const result = await service.registerWithGoogle(idToken);

      expect(result.user?.email).toBe(googleUser.email);
      expect(userIdentityRepository.create).toHaveBeenCalled();
    });

    it('should link Google account if not already linked', async () => {
      googleAuthService.verifyIdToken.mockResolvedValue(googleUser);
      userIdentityRepository.findByProvider.mockResolvedValue(null);
      userIdentityRepository.hasProvider.mockResolvedValue(false);
      usersRepository.findById.mockResolvedValue(mockUser);

      await service.linkGoogleAccount(mockUser.id, idToken);

      expect(userIdentityRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          providerId: googleUser.sub,
        }),
      );
    });

    it('should link Facebook account if not already linked', async () => {
      facebookAuthService.verifyAccessToken.mockResolvedValue({
        id: 'fb-123',
        name: 'FB User',
        picture: { data: { url: 'fb-photo' } },
      });
      userIdentityRepository.findByProvider.mockResolvedValue(null);
      userIdentityRepository.hasProvider.mockResolvedValue(false);
      usersRepository.findById.mockResolvedValue(mockUser);

      await service.linkProvider(mockUser.id, 'facebook', 'fb-token');

      expect(userIdentityRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'facebook',
          providerId: 'fb-123',
        }),
      );
    });

    it('should unlink provider if multiple exist', async () => {
      userIdentityRepository.countByUserId.mockResolvedValue(2);
      userIdentityRepository.findByUserId.mockResolvedValue([
        { id: '1', provider: 'email' },
        { id: '2', provider: 'google' },
      ]);
      usersRepository.findById.mockResolvedValue(mockUser);

      await service.unlinkProvider(mockUser.id, 'google');

      expect(userIdentityRepository.delete).toHaveBeenCalledWith('2');
    });

    it('should throw error when unlinking last provider', async () => {
      userIdentityRepository.countByUserId.mockResolvedValue(1);

      await expect(
        service.unlinkProvider(mockUser.id, 'email'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return linked providers', async () => {
      userIdentityRepository.findByUserId.mockResolvedValue([
        { provider: 'google', createdAt: new Date() },
      ]);
      usersRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getLinkedProviders(mockUser.id);
      expect(result.providers[0].provider).toBe('google');
    });
  });

  describe('Account Management', () => {
    it('should get current user with permissions', async () => {
      usersRepository.getUserBasicInfo.mockResolvedValue(mockUser);
      authorizationService.getUserPermissions.mockResolvedValue({
        permissions: ['read:all'],
      });

      const result = await service.getCurrentUser(mockUser.id);
      expect(result.id).toBe(mockUser.id);
      expect(result.permissions).toEqual(['read:all']);
    });

    it('should reset password and revoke all sessions', async () => {
      const token = 'reset-token';
      redis.get.mockResolvedValue(mockUser.email);
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hash');

      await service.resetPassword(token, 'newPassword123');

      expect(usersRepository.update).toHaveBeenCalled();
      expect(sessionService.revokeAllUserSessions).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(redis.del).toHaveBeenCalledWith(`reset-token:${token}`);
    });

    it('should soft delete user', async () => {
      await service.deleteUser(mockUser.id);
      expect(usersRepository.softDelete).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('Verification and OTP Resend', () => {
    it('should verify verification token', async () => {
      redis.get.mockResolvedValue(mockUser.email);
      const result = await service.verifyVerificationToken('token');
      expect(result.success).toBe(true);
      expect(usersRepository.updateByEmail).toHaveBeenCalled();
    });

    it('should resend verification email', async () => {
      usersRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        verifiedAt: null,
      });
      redis.get.mockResolvedValue(null); // Rate limit check

      await service.resendVerification(mockUser.email);

      expect(natsClient.emit).toHaveBeenCalledWith(
        { cmd: 'send_email' },
        expect.objectContaining({ type: 'verification' }),
      );
    });

    it('should resend OTP', async () => {
      usersRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        verifiedAt: null,
      });
      redis.get.mockResolvedValue(null); // Rate limit

      await service.resendOTP({ email: mockUser.email, type: 'registration' });

      expect(natsClient.emit).toHaveBeenCalledWith(
        { cmd: 'send_email' },
        expect.objectContaining({ type: 'otp' }),
      );
    });
  });
});
