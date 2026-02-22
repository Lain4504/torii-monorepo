import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GatewayAuthGuard, ApiKeyGuard, JwtTokenProvider, BlacklistService, AppConfigService, REDIS_CLIENT } from '@server/shared';
import * as crypto from 'crypto';

describe('Guards (Gateway)', () => {
  // -------------------------------------------------------------------------
  // GatewayAuthGuard Tests
  // -------------------------------------------------------------------------
  describe('GatewayAuthGuard', () => {
    let guard: GatewayAuthGuard;
    let jwtTokenProvider: jest.Mocked<JwtTokenProvider>;
    let blacklistService: jest.Mocked<BlacklistService>;
    let redisMock: any;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(async () => {
      jwtTokenProvider = { verifyToken: jest.fn() } as any;
      blacklistService = { isBlacklisted: jest.fn() } as any;
      reflector = { getAllAndOverride: jest.fn() } as any;
      redisMock = { get: jest.fn() };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GatewayAuthGuard,
          { provide: JwtTokenProvider, useValue: jwtTokenProvider },
          { provide: BlacklistService, useValue: blacklistService },
          { provide: Reflector, useValue: reflector },
          { provide: REDIS_CLIENT, useValue: redisMock },
        ],
      }).compile();

      guard = module.get<GatewayAuthGuard>(GatewayAuthGuard);
    });

    function createMockContext(headers: any = {}, cookies: any = {}, isPublic = false) {
      reflector.getAllAndOverride.mockReturnValue(isPublic);
      const req = {
        headers,
        cookies,
        url: '/test',
      };
      return {
        switchToHttp: () => ({
          getRequest: () => req,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;
    }

    it('should allow public routes and attach user if token exists', async () => {
      const payload = { sub: 'u1', sid: 's1' };
      jwtTokenProvider.verifyToken.mockResolvedValue(payload);
      redisMock.get.mockResolvedValue(JSON.stringify(['p1']));
      const ctx = createMockContext({ authorization: 'Bearer tok' }, {}, true);

      const result = await guard.canActivate(ctx);
      const req = ctx.switchToHttp().getRequest();

      expect(result).toBe(true);
      expect(req['requester']).toMatchObject({ ...payload, permissions: ['p1'] });
    });

    it('should throw UnauthorizedException if no token on private route', async () => {
      const ctx = createMockContext();
      await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is blacklisted', async () => {
      jwtTokenProvider.verifyToken.mockResolvedValue({ jti: 'j123' });
      blacklistService.isBlacklisted.mockResolvedValue(true);
      const ctx = createMockContext({ authorization: 'Bearer tok' });

      await expect(guard.canActivate(ctx)).rejects.toThrow('Token revoked');
    });

    it('should fetch permissions from Redis using sid', async () => {
      jwtTokenProvider.verifyToken.mockResolvedValue({ sub: 'u1', sid: 'session-abc' });
      blacklistService.isBlacklisted.mockResolvedValue(false);
      redisMock.get.mockResolvedValue(JSON.stringify(['course.view']));
      const ctx = createMockContext({ authorization: 'Bearer tok' });

      await guard.canActivate(ctx);
      const req = ctx.switchToHttp().getRequest();

      expect(redisMock.get).toHaveBeenCalledWith('session:session-abc:permissions');
      expect(req['requester'].permissions).toContain('course.view');
    });
  });

  // -------------------------------------------------------------------------
  // ApiKeyGuard Tests
  // -------------------------------------------------------------------------
  describe('ApiKeyGuard', () => {
    let guard: ApiKeyGuard;
    let config: any;

    beforeEach(async () => {
      config = {
        security: { wajlc: { apiKey: 'test-key', apiSecret: 'test-secret' } }
      };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ApiKeyGuard,
          { provide: AppConfigService, useValue: config },
        ],
      }).compile();

      guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    });

    function createMockContext(headers: any = {}, body: any = {}) {
      return {
        switchToHttp: () => ({
          getRequest: () => ({
            headers,
            body,
            rawBody: Buffer.from(JSON.stringify(body)),
          }),
          getResponse: () => ({
            status: jest.fn().mockReturnThis(),
            setHeader: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
          }),
        }),
      } as unknown as ExecutionContext;
    }

    it('should allow if API Key and HMAC signature match', () => {
      const body = { hello: 'world' };
      const secret = 'test-secret';
      const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
      
      const ctx = createMockContext({
        'api-key': 'test-key',
        'hash-signature': signature,
      }, body);

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should reject if API Key is invalid', () => {
      const ctx = createMockContext({ 'api-key': 'wrong' });
      expect(guard.canActivate(ctx)).toBe(false);
    });

    it('should reject if signature is missing or incorrect', () => {
      const incorrectSignature = 'f'.repeat(64); // Match SHA256 hex length
      const ctx = createMockContext({ 'api-key': 'test-key', 'hash-signature': incorrectSignature });
      expect(guard.canActivate(ctx)).toBe(false);
    });
  });
});
