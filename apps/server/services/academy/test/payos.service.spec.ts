jest.mock('@payos/node', () => ({
  PayOS: jest.fn().mockImplementation(() => ({
    paymentRequests: { create: jest.fn() },
    webhooks: { verify: jest.fn() },
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PayOSService } from '../src/modules/commerce/payos.service';
import { AppConfigService } from '@server/shared';
import { BadRequestException } from '@nestjs/common';

describe('PayOSService', () => {
  let service: PayOSService;
  let config: any;

  beforeEach(async () => {
    config = {
      thirdParty: {
        payos: { clientId: 'c1', apiKey: 'a1', checksumKey: 'ck1' }
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayOSService,
        { provide: AppConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<PayOSService>(PayOSService);
  });

  describe('createPaymentLink', () => {
    it('should call payOS.paymentRequests.create', async () => {
      const mockRes = { checkoutUrl: 'http://pay.os' };
      (service as any).payOS.paymentRequests.create.mockResolvedValue(mockRes);

      const data = { orderCode: 123, amount: 1000, description: 'D', cancelUrl: 'C', returnUrl: 'R' };
      const result = await service.createPaymentLink(data);

      expect(result).toBe(mockRes);
      expect((service as any).payOS.paymentRequests.create).toHaveBeenCalledWith(data);
    });

    it('should throw BadRequestException if PayOS error occurs', async () => {
      (service as any).payOS.paymentRequests.create.mockRejectedValue(new Error('PayOS Fail'));
      await expect(service.createPaymentLink({} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyPaymentWebhookData', () => {
    it('should return true if verification succeeds', () => {
      (service as any).payOS.webhooks.verify.mockReturnValue(true);
      const result = service.verifyPaymentWebhookData({ data: 'payload' });
      expect(result).toBe(true);
    });

    it('should return false if verification fails', () => {
      (service as any).payOS.webhooks.verify.mockImplementation(() => { throw new Error('Verify Fail'); });
      const result = service.verifyPaymentWebhookData({ data: 'payload' });
      expect(result).toBe(false);
    });
  });
});
