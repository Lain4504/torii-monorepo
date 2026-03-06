// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import {
  WajlcAuthService,
  WajlcTokenClaims,
} from '@server/meet/modules/auth/wajlc-auth.service';
import { NatsUserInfoService } from '../src/handlers/nats-user-info.service';
import { AppConfigService } from '@server/shared';
import * as jwt from 'jsonwebtoken';

// Create mock functions for external utils
const mockGenerateWajlcJWTAccessToken = jest.fn();
const mockVerifyWajlcAccessToken = jest.fn();
const mockVerifyWebhookRequest = jest.fn();

// Mock the external utils modules
jest.mock('@server/shared/utils/access_token', () => ({
  generateWajlcJWTAccessToken: (...args) =>
    mockGenerateWajlcJWTAccessToken(...args),
}));

jest.mock('@server/shared/utils/verify_token', () => ({
  verifyWajlcAccessToken: (...args) => mockVerifyWajlcAccessToken(...args),
}));

jest.mock('@server/shared/utils/webhook_verify', () => ({
  verifyWebhookRequest: (...args) => mockVerifyWebhookRequest(...args),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('WajlcAuthService', () => {
  let service: WajlcAuthService;
  let natsUserInfoService: NatsUserInfoService;

  const mockAppConfigService = {
    security: {
      wajlc: {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      },
    },
    livekit: {
      apiKey: 'test-livekit-key',
      apiSecret: 'test-livekit-secret',
    },
  };

  const mockNatsUserInfoService = {
    getRoomUserStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WajlcAuthService,
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
        {
          provide: NatsUserInfoService,
          useValue: mockNatsUserInfoService,
        },
      ],
    }).compile();

    service = module.get<WajlcAuthService>(WajlcAuthService);
    natsUserInfoService = module.get<NatsUserInfoService>(NatsUserInfoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateWajlcJoinToken', () => {
    it('should generate a token successfully', () => {
      const claims: WajlcTokenClaims = {
        name: 'Test User',
        userId: 'user-123',
        roomId: 'room-123',
        isAdmin: false,
      };
      const expectedToken = 'generated-token';
      mockGenerateWajlcJWTAccessToken.mockReturnValue(expectedToken);

      const result = service.generateWajlcJoinToken(claims);

      expect(mockGenerateWajlcJWTAccessToken).toHaveBeenCalledWith(
        'test-api-key',
        'test-api-secret',
        claims.userId,
        3600,
        claims,
      );
      expect(result).toBe(expectedToken);
    });

    it('should throw error if generation fails', () => {
      const claims: WajlcTokenClaims = {
        name: 'Test User',
        userId: 'user-123',
        roomId: 'room-123',
        isAdmin: false,
      };
      mockGenerateWajlcJWTAccessToken.mockImplementation(() => {
        throw new Error('Generation failed');
      });

      expect(() => service.generateWajlcJoinToken(claims)).toThrow(
        'Generation failed',
      );
    });
  });

  describe('verifyWajlcAccessToken', () => {
    it('should verify token successfully and return claims', () => {
      const token = 'valid-token';
      const protobufClaims = {
        name: 'Test User',
        userId: 'user-123',
        roomId: 'room-123',
        isAdmin: false,
        isHidden: true,
      };
      mockVerifyWajlcAccessToken.mockReturnValue(protobufClaims);

      const result = service.verifyWajlcAccessToken(token);

      expect(mockVerifyWajlcAccessToken).toHaveBeenCalledWith(
        'test-api-key',
        'test-api-secret',
        token,
        0,
      );
      expect(result).toEqual({
        name: 'Test User',
        userId: 'user-123',
        roomId: 'room-123',
        isAdmin: false,
        isHidden: true,
      });
    });

    it('should throw error if verification fails', () => {
      const token = 'invalid-token';
      mockVerifyWajlcAccessToken.mockImplementation(() => {
        throw new Error('Verification failed');
      });

      expect(() => service.verifyWajlcAccessToken(token)).toThrow(
        'Invalid token claims',
      );
    });
  });

  describe('verifyToken', () => {
    it('should call verifyWajlcAccessToken with 0 grace period', () => {
      const verifySpy = jest.spyOn(service, 'verifyWajlcAccessToken');
      const token = 'some-token';
      const claims = { userId: '1' } as any;
      verifySpy.mockReturnValue(claims);

      const result = service.verifyToken(token);

      expect(verifySpy).toHaveBeenCalledWith(token, 0);
      expect(result).toBe(claims);
    });
  });

  describe('unsafeClaimsWithoutVerification', () => {
    it('should decode token and return claims', () => {
      const token = 'some-token';
      const decoded = {
        name: 'User',
        user_id: 'u1',
        room_id: 'r1',
        is_admin: true,
        is_hidden: false,
      };
      (jwt.decode as jest.Mock).mockReturnValue(decoded);

      const result = service.unsafeClaimsWithoutVerification(token);

      expect(jwt.decode).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        name: 'User',
        userId: 'u1',
        roomId: 'r1',
        isAdmin: true,
        isHidden: false,
      });
    });

    it('should return null if decoding returns null', () => {
      (jwt.decode as jest.Mock).mockReturnValue(null);
      const result = service.unsafeClaimsWithoutVerification('bad-token');
      expect(result).toBeNull();
    });

    it('should return null if decoding throws', () => {
      (jwt.decode as jest.Mock).mockImplementation(() => {
        throw new Error('Decode error');
      });
      const result = service.unsafeClaimsWithoutVerification('bad-token');
      expect(result).toBeNull();
    });
  });

  describe('renewWajlcToken', () => {
    it('should renew token if user is in room', async () => {
      const oldToken = 'old-token';
      const claims = {
        name: 'User',
        userId: 'u1',
        roomId: 'r1',
        isAdmin: false,
      };
      const newToken = 'new-token';

      jest
        .spyOn(service, 'verifyWajlcAccessToken')
        .mockReturnValue(claims as any);
      jest.spyOn(service, 'generateWajlcJoinToken').mockReturnValue(newToken);
      mockNatsUserInfoService.getRoomUserStatus.mockResolvedValue('connected');

      const result = await service.renewWajlcToken(oldToken);

      expect(service.verifyWajlcAccessToken).toHaveBeenCalledWith(oldToken, 0);
      expect(mockNatsUserInfoService.getRoomUserStatus).toHaveBeenCalledWith(
        'r1',
        'u1',
      );
      expect(service.generateWajlcJoinToken).toHaveBeenCalledWith(claims);
      expect(result).toBe(newToken);
    });

    it('should throw error if user is not in room', async () => {
      const oldToken = 'old-token';
      const claims = { userId: 'u1', roomId: 'r1' };

      jest
        .spyOn(service, 'verifyWajlcAccessToken')
        .mockReturnValue(claims as any);
      mockNatsUserInfoService.getRoomUserStatus.mockResolvedValue('');

      await expect(service.renewWajlcToken(oldToken)).rejects.toThrow(
        'user not found',
      );
    });

    it('should throw error if getRoomUserStatus throws', async () => {
      const oldToken = 'old-token';
      const claims = { userId: 'u1', roomId: 'r1' };

      jest
        .spyOn(service, 'verifyWajlcAccessToken')
        .mockReturnValue(claims as any);
      mockNatsUserInfoService.getRoomUserStatus.mockRejectedValue(
        new Error('NATS error'),
      );

      await expect(service.renewWajlcToken(oldToken)).rejects.toThrow(
        'NATS error',
      );
    });
  });

  describe('validateLivekitWebhookToken', () => {
    it('should return true if verification succeeds', () => {
      const body = 'some-body';
      const token = 'some-token';
      mockVerifyWebhookRequest.mockReturnValue(true);

      const result = service.validateLivekitWebhookToken(body, token);

      expect(mockVerifyWebhookRequest).toHaveBeenCalledWith(
        expect.any(Buffer),
        'test-livekit-key',
        'test-livekit-secret',
        token,
      );
      expect(result).toBe(true);
    });

    it('should handle buffer body', () => {
      const body = Buffer.from('some-body');
      const token = 'some-token';
      mockVerifyWebhookRequest.mockReturnValue(true);

      const result = service.validateLivekitWebhookToken(body, token);

      expect(mockVerifyWebhookRequest).toHaveBeenCalledWith(
        body,
        'test-livekit-key',
        'test-livekit-secret',
        token,
      );
      expect(result).toBe(true);
    });

    it('should return false if verification throws', () => {
      mockVerifyWebhookRequest.mockImplementation(() => {
        throw new Error('Verify failed');
      });

      const result = service.validateLivekitWebhookToken('body', 'token');
      expect(result).toBe(false);
    });
  });
});
