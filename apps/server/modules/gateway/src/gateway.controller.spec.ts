import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from './gateway.controller';
import {
  AuthHealthResponse,
  GatewayService,
  ValidateTokenResponse,
} from './gateway.service';

describe('GatewayController', () => {
  let gatewayController: GatewayController;
  let gatewayService: jest.Mocked<GatewayService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        {
          provide: GatewayService,
          useValue: {
            pingAuth: jest.fn<() => Promise<AuthHealthResponse>>().mockResolvedValue({
              service: 'auth',
              status: 'ok',
            }),
            validateToken: jest
              .fn<(token?: string) => Promise<ValidateTokenResponse>>()
              .mockResolvedValue({
                isValid: true,
              }),
          },
        },
      ],
    }).compile();

    gatewayController = module.get<GatewayController>(GatewayController);
    gatewayService = module.get(GatewayService) as jest.Mocked<GatewayService>;
  });

  describe('pingAuth', () => {
    it('should proxy to gateway service', async () => {
      const result = await gatewayController.pingAuth();

      expect(result).toEqual({ service: 'auth', status: 'ok' });
      expect(gatewayService.pingAuth).toHaveBeenCalledTimes(1);
    });
  });

  describe('validate', () => {
    it('should forward token and return validation', async () => {
      const result = await gatewayController.validate('token-value');

      expect(result).toEqual({ isValid: true });
      expect(gatewayService.validateToken).toHaveBeenCalledWith('token-value');
    });
  });
});
