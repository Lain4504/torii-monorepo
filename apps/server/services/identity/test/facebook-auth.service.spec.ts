import { Test, TestingModule } from '@nestjs/testing';
import { FacebookAuthService } from '../src/modules/auth/facebook-auth.service';
import { AppConfigService } from '@server/shared';
import { UnauthorizedException, Logger } from '@nestjs/common';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FacebookAuthService', () => {
  let service: FacebookAuthService;
  let appConfigService: AppConfigService;

  const mockAppConfigService = {
    thirdParty: {
      facebook: {
        appId: 'mock-facebook-app-id',
        appSecret: 'mock-facebook-app-secret',
      },
    },
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacebookAuthService,
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
      ],
    }).compile();

    service = module.get<FacebookAuthService>(FacebookAuthService);
    appConfigService = module.get<AppConfigService>(AppConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyAccessToken', () => {
    const accessToken = 'valid-facebook-token';
    const mockFacebookUser = {
      id: 'facebook-user-id',
      name: 'Test Facebook User',
      email: 'fb-test@example.com',
      picture: {
        data: {
          url: 'https://example.com/fb-photo.jpg',
        },
      },
    };

    it('should successfully verify a valid token and return user info', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockFacebookUser });

      const result = await service.verifyAccessToken(accessToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://graph.facebook.com/me',
        {
          params: {
            fields: 'id,name,email,picture',
            access_token: accessToken,
          },
        },
      );

      expect(result).toEqual({
        id: mockFacebookUser.id,
        name: mockFacebookUser.name,
        email: mockFacebookUser.email,
        picture: mockFacebookUser.picture,
      });
    });

    it('should throw UnauthorizedException if Facebook API fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.verifyAccessToken(accessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if response data is missing required fields', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { id: '123' }, // Missing email
      });

      await expect(service.verifyAccessToken(accessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('isConfigured', () => {
    it('should return true when appId is configured', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when appId is missing', async () => {
      const incompleteConfig = {
        thirdParty: {
          facebook: {
            appId: '',
          },
        },
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FacebookAuthService,
          {
            provide: AppConfigService,
            useValue: incompleteConfig,
          },
        ],
      }).compile();

      const incompleteService =
        module.get<FacebookAuthService>(FacebookAuthService);
      expect(incompleteService.isConfigured()).toBe(false);
    });
  });

  describe('constructor logging', () => {
    it('should warn if appId is missing', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      const incompleteConfig = {
        thirdParty: {
          facebook: {
            appId: '',
          },
        },
      };

      await Test.createTestingModule({
        providers: [
          FacebookAuthService,
          {
            provide: AppConfigService,
            useValue: incompleteConfig,
          },
        ],
      }).compile();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Facebook App ID not configured. Facebook OAuth will not work.',
      );
    });
  });
});
