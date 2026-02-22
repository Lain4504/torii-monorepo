import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { WebhookController } from '../../src/modules/meet/controllers/webhook.controller';

jest.mock('@server/shared', () => ({
  ...jest.requireActual('@server/shared'),
  verifyWebhookRequest: jest.fn(),
  AppConfigService: class {
    livekit = { apiKey: 'test-api-key', apiSecret: 'test-secret' };
    server = { nodeEnv: 'test' };
  },
}));

import * as shared from '@server/shared';

function createNatsMock() {
  return {
    send: jest.fn().mockReturnValue(of(null)),
    emit: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
  };
}

describe('WebhookController', () => {
  let controller: WebhookController;
  let natsMock: ReturnType<typeof createNatsMock>;
  const verifyMock = shared.verifyWebhookRequest as jest.Mock;

  beforeEach(async () => {
    natsMock = createNatsMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        { provide: 'NATS_SERVICE', useValue: natsMock },
        { provide: shared.AppConfigService, useValue: new (shared.AppConfigService as any)() },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
  });

  it('should throw Error("No body") when body is missing', async () => {
    await expect(controller.handleWebhook(null, 'tok')).rejects.toThrow('No body');
  });

  it('should throw Forbidden when token verification fails', async () => {
    verifyMock.mockReturnValue(false);
    await expect(controller.handleWebhook({ event: 'test' }, 'bad-tok')).rejects.toThrow('Forbidden');
  });

  it('should emit webhook.handle to NATS on valid event', async () => {
    verifyMock.mockReturnValue(true);
    const body = { event: 'room_started', room: { name: 'room1' } };
    await controller.handleWebhook(body, 'valid-tok');
    expect(natsMock.emit).toHaveBeenCalledWith({ cmd: 'webhook.handle' }, expect.any(Object));
  });
});
