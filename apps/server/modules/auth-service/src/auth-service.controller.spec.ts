import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';

describe('AuthServiceController', () => {
  let authServiceController: AuthServiceController;
  let authServiceService: jest.Mocked<AuthServiceService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthServiceController],
      providers: [
        {
          provide: AuthServiceService,
          useValue: {
            ping: jest.fn().mockReturnValue({ service: 'auth', status: 'ok' }),
            validateToken: jest.fn().mockReturnValue({ isValid: true }),
          },
        },
      ],
    }).compile();

    authServiceController = module.get<AuthServiceController>(AuthServiceController);
    authServiceService = module.get(AuthServiceService);
  });

  describe('ping', () => {
    it('should delegate to service and return health', () => {
      const result = authServiceController.ping();

      expect(result).toEqual({ service: 'auth', status: 'ok' });
      expect(authServiceService.ping).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateToken', () => {
    it('should validate and return result', () => {
      const result = authServiceController.validateToken({ token: 'valid-token-value' });

      expect(result).toEqual({ isValid: true });
      expect(authServiceService.validateToken).toHaveBeenCalledWith('valid-token-value');
    });
  });
});
