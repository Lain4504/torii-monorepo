import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../../src/modules/identity/controllers/auth.controller';
import { GatewayAuthGuard, AppConfigService } from '@server/shared';

function createNatsMock() {
  return {
    send: jest.fn(),
    emit: jest.fn().mockReturnValue(of(null)),
  };
}

function createAppConfigMock(overrides: Record<string, any> = {}) {
  return {
    livekit: { apiKey: 'test-key', apiSecret: 'test-secret' },
    server: { nodeEnv: 'test', ...overrides.server },
    redis: { host: 'localhost', port: 6379, password: '' },
    ...overrides,
  };
}

function createResMock() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any;
}

function createReqMock(overrides: Record<string, any> = {}) {
  return {
    requester: { sub: 'user-123', email: 'test@example.com' },
    headers: {},
    cookies: {},
    body: {},
    ...overrides,
  } as any;
}

describe('AuthController', () => {
  let controller: AuthController;
  let natsMock: ReturnType<typeof createNatsMock>;
  let appConfigMock: any;

  beforeEach(async () => {
    natsMock = createNatsMock();
    appConfigMock = createAppConfigMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: 'NATS_SERVICE', useValue: natsMock },
        { provide: AppConfigService, useValue: appConfigMock },
      ],
    })
      .overrideGuard(GatewayAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register()', () => {
    const dto = { email: 'test@example.com', password: 'Password123' };

    it('should return success response when registration succeeds', async () => {
      const fakeUser = { id: 'u1', email: dto.email };
      natsMock.send.mockReturnValue(of(fakeUser));

      const result = await controller.register(dto as any);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'identity.auth.register' },
        dto,
      );
      expect(result).toMatchObject({ success: true });
    });

    it('should return error response when NATS throws', async () => {
      natsMock.send.mockReturnValue(throwError(() => new Error('Email exists')));

      const result = await controller.register(dto as any);

      expect(result).toMatchObject({ success: false });
    });
  });

  describe('login()', () => {
    const dto = { email: 'test@example.com', password: 'Password123!' };

    it('should set cookies for web platform and return user data', async () => {
      natsMock.send.mockReturnValue(
        of({
          requiresTwoFactor: false,
          user: { id: 'u1', email: dto.email, displayName: 'Test', role: 'student', verifiedAt: new Date() },
          accessToken: 'acc-tok',
          refreshToken: 'ref-tok',
        }),
      );
      const req = createReqMock({ headers: {} });
      const res = createResMock();

      const result = await controller.login(dto as any, req, res);

      expect(res.cookie).toHaveBeenCalledWith('access_token', 'acc-tok', expect.any(Object));
      expect(result).toMatchObject({ success: true });
    });
  });

  describe('getMe()', () => {
    it('should return user data from NATS', async () => {
      const fakeUser = { id: 'user-123', email: 'test@example.com', displayName: 'Test' };
      natsMock.send.mockReturnValue(of(fakeUser));
      const req = createReqMock();

      const result = await controller.getMe(req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'identity.auth.me' },
        { userId: 'user-123' },
      );
      expect(result).toMatchObject({ success: true });
    });
  });
});
