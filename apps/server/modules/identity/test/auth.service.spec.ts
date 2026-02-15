
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { AppConfigService, BlacklistService, JwtTokenProvider } from '@server/shared';
import {
    USERS_REPOSITORY_TOKEN,
    USER_IDENTITY_REPOSITORY_TOKEN,
} from '../src/interfaces/repositories';
import {
    SESSION_SERVICE_TOKEN,
    GOOGLE_AUTH_SERVICE_TOKEN,
    AUTHORIZATION_SERVICE_TOKEN,
    TWO_FACTOR_AUTH_SERVICE_TOKEN,
    EMAIL_SERVICE_TOKEN,
} from '../src/interfaces/services';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
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
    let emailService: any;
    let redis: any;
    let natsClient: any;
    let blacklistService: any;

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
        };

        const mockUserIdentityRepository = {
            create: jest.fn(),
            findByProvider: jest.fn(),
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

        const mockEmailService = {
            sendVerificationEmail: jest.fn(),
            sendOTPEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
            sendPasswordResetConfirmationEmail: jest.fn(),
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
                { provide: USER_IDENTITY_REPOSITORY_TOKEN, useValue: mockUserIdentityRepository },
                { provide: JwtTokenProvider, useValue: mockJwtTokenProvider },
                { provide: AUTHORIZATION_SERVICE_TOKEN, useValue: mockAuthorizationService },
                { provide: TWO_FACTOR_AUTH_SERVICE_TOKEN, useValue: mockTwoFactorAuthService },
                { provide: SESSION_SERVICE_TOKEN, useValue: mockSessionService },
                { provide: GOOGLE_AUTH_SERVICE_TOKEN, useValue: mockGoogleAuthService },
                { provide: 'REDIS_CLIENT', useValue: mockRedis },
                { provide: EMAIL_SERVICE_TOKEN, useValue: mockEmailService },
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
        emailService = module.get(EMAIL_SERVICE_TOKEN);
        redis = module.get('REDIS_CLIENT');
        natsClient = module.get('NATS_SERVICE');
        blacklistService = module.get(BlacklistService);
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
            platform: 'web' as const,
        };

        it('should register a new user successfully', async () => {
            usersRepository.findByEmail.mockResolvedValue(null);
            (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
            usersRepository.create.mockResolvedValue(mockUser);

            // Mock generateVerificationToken behavior inside register
            // It calls redis.set
            redis.set.mockResolvedValue('OK');

            const result = await service.register(registerDto);

            expect(usersRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
            expect(argon2.hash).toHaveBeenCalledWith(registerDto.password);
            expect(usersRepository.create).toHaveBeenCalled();
            expect(emailService.sendVerificationEmail).toHaveBeenCalled();
            expect(result.email).toBe(mockUser.email);
        });

        it('should throw ConflictException if email exists', async () => {
            usersRepository.findByEmail.mockResolvedValue(mockUser);

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
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
            authorizationService.getUserPermissions.mockResolvedValue({ permissions: [] });

            // Mock generateAccessToken (private method calls jwtTokenProvider.generateToken)
            jwtTokenProvider.generateToken.mockResolvedValue('access-token');

            const result = await service.login(loginDto);

            expect(usersRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
            expect(argon2.verify).toHaveBeenCalledWith(mockUser.password, loginDto.password);
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

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('logout', () => {
        it('should blacklist access token and revoke session', async () => {
            const accessToken = 'access.token.jwt';
            const refreshToken = 'refresh.token.jwt';

            // Mock jwt.decode for blacklist logic inside logout
            jest.spyOn(require('jsonwebtoken'), 'decode').mockReturnValue({
                jti: 'jti-123',
                exp: Math.floor(Date.now() / 1000) + 3600
            });

            jwtTokenProvider.verifyRefreshToken.mockResolvedValue({ sid: 'session-123' });
            sessionService.hashTokenPublic.mockReturnValue('hashed-refresh-token');

            await service.logout(accessToken, refreshToken);

            expect(blacklistService.blacklist).toHaveBeenCalled();
            expect(sessionService.revokeSession).toHaveBeenCalledWith('hashed-refresh-token');
            expect(redis.del).toHaveBeenCalledWith('session:session-123:permissions');
        });
    });

    describe('verify2FA', () => {
        it('should verify TOTP and return tokens', async () => {
            const tempToken = 'temp-token';
            const code = '123456';

            jwtTokenProvider.verify2FATempToken.mockResolvedValue({
                userId: mockUser.id,
                sub: mockUser.id
            });
            redis.get.mockResolvedValue(tempToken); // Stored token matches
            twoFactorAuthService.verifyTotp.mockResolvedValue(true);
            usersRepository.findById.mockResolvedValue(mockUser);

            sessionService.createSession.mockResolvedValue({
                sessionId: 'session-123',
                refreshToken: 'refresh-token',
            });
            authorizationService.getUserPermissions.mockResolvedValue({ permissions: [] });
            jwtTokenProvider.generateToken.mockResolvedValue('access-token');

            const result = await service.verify2FA(tempToken, code);

            expect(twoFactorAuthService.verifyTotp).toHaveBeenCalledWith(mockUser.id, code);
            expect(redis.del).toHaveBeenCalledWith(`2fa:temp:${mockUser.id}`);
            expect(result.accessToken).toBe('access-token');
        });
    });

    describe('forgotPassword', () => {
        it('should send reset email for web platform', async () => {
            const dto = { email: 'test@example.com', platform: 'web' as const };
            usersRepository.findByEmail.mockResolvedValue(mockUser); // User exists
            redis.get.mockResolvedValue(null); // No rate limit
            redis.set.mockResolvedValue('OK');

            await service.forgotPassword(dto);

            expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
            expect(redis.set).toHaveBeenCalledTimes(2); // One for token, one for rate limit
        });
    });

    describe('verifyOTP', () => {
        it('should verify OTP successfully', async () => {
            const dto = { email: 'test@example.com', otp: '123456', type: 'registration' as const };
            redis.get.mockResolvedValue('123456');

            const result = await service.verifyOTP(dto);

            expect(result.success).toBe(true);
            expect(redis.del).toHaveBeenCalledWith(`otp:registration:${dto.email}`);
            expect(usersRepository.updateByEmail).toHaveBeenCalledWith(dto.email, expect.anything());
        });
    });
});
