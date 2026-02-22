import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { CanActivate } from '@nestjs/common';
import { AnalyticsHandler } from '../../src/modules/agents/controllers/analytics.controller';
import { AssessmentHandler } from '../../src/modules/agents/controllers/assessment.controller';
import { SenseiHandler } from '../../src/modules/agents/controllers/sensei.controller';
import { GatewayAuthGuard } from '@server/shared';

function createNatsMock() {
  return {
    send: jest.fn(),
    emit: jest.fn().mockReturnValue(of(null)),
  };
}

class MockGatewayAuthGuard implements CanActivate {
  canActivate() { return true; }
}

function makeReq(userId = 'user-abc') {
  return { requester: { sub: userId, email: `${userId}@example.com` } } as any;
}

describe('Agents Controllers', () => {
  let natsMock: ReturnType<typeof createNatsMock>;

  afterEach(() => jest.clearAllMocks());

  describe('AnalyticsHandler', () => {
    let handler: AnalyticsHandler;
    beforeEach(async () => {
      natsMock = createNatsMock();
      const module = await Test.createTestingModule({
        controllers: [AnalyticsHandler],
        providers: [
          { provide: 'NATS_SERVICE', useValue: natsMock },
        ],
      })
        .overrideGuard(GatewayAuthGuard)
        .useValue(new MockGatewayAuthGuard())
        .compile();
      handler = module.get<AnalyticsHandler>(AnalyticsHandler);
    });

    it('should trackProgress via NATS', async () => {
      natsMock.send.mockReturnValue(of({ tracked: true }));
      const result = await handler.trackProgress(makeReq(), { courseId: 'c1' });
      expect(natsMock.send).toHaveBeenCalledWith({ cmd: 'agents.analytics.trackProgress' }, expect.any(Object));
      expect(result.success).toBe(true);
    });
  });

  describe('SenseiHandler', () => {
    let handler: SenseiHandler;
    beforeEach(async () => {
      natsMock = createNatsMock();
      const module = await Test.createTestingModule({
        controllers: [SenseiHandler],
        providers: [{ provide: 'NATS_SERVICE', useValue: natsMock }],
      })
        .overrideGuard(GatewayAuthGuard)
        .useValue(new MockGatewayAuthGuard())
        .compile();
      handler = module.get<SenseiHandler>(SenseiHandler);
    });

    it('should call grammarCheck on NATS', async () => {
      natsMock.send.mockReturnValue(of({ corrections: [] }));
      const result = await handler.grammarCheck(makeReq(), { text: 'test' });
      expect(natsMock.send).toHaveBeenCalledWith({ cmd: 'agents.sensei.grammarCheck' }, expect.any(Object));
      expect(result.data).toBeDefined();
    });

    it('should handle TTS requests', async () => {
      natsMock.send.mockReturnValue(of({ audioBase64: 'abc' }));
      const result = await handler.tts(makeReq(), { text: 'hello' });
      expect(natsMock.send).toHaveBeenCalledWith({ cmd: 'agents.sensei.tts' }, expect.any(Object));
      expect(result.success).toBe(true);
    });
  });
});
