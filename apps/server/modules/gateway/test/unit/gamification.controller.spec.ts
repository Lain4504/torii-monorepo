import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { GamificationController } from '../../src/modules/gamification/controllers/gamification.controller';
import { GatewayAuthGuard } from '@server/shared';

// ---------------------------------------------------------------------------
// Mock Helpers
// ---------------------------------------------------------------------------

function createNatsMock() {
  return {
    send: jest.fn(),
  };
}

function createReqMock(overrides: any = {}) {
  return {
    requester: { sub: 'user-123', ...overrides },
    query: {},
    body: {},
    ...overrides,
  } as any;
}

// ---------------------------------------------------------------------------
// GamificationController Tests
// ---------------------------------------------------------------------------

describe('GamificationController (Gateway)', () => {
  let controller: GamificationController;
  let natsMock: ReturnType<typeof createNatsMock>;

  beforeEach(async () => {
    natsMock = createNatsMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [{ provide: 'NATS_SERVICE', useValue: natsMock }],
    })
      .overrideGuard(GatewayAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GamificationController>(GamificationController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getProfile()', () => {
    it('should fetch profile from NATS for current user', async () => {
      const fakeProfile = { points: 100, level: 1 };
      natsMock.send.mockReturnValue(of(fakeProfile));
      const req = createReqMock({ sub: 'u1' });

      const result = await controller.getProfile(req);

      expect(natsMock.send).toHaveBeenCalledWith('gamification.getProfile', { userId: 'u1' });
      expect(result).toMatchObject({ success: true, data: fakeProfile });
    });
  });

  describe('getLeaderboard()', () => {
    it('should fetch leaderboard from NATS with type', async () => {
      natsMock.send.mockReturnValue(of([]));
      const req = createReqMock({ sub: 'u1', query: { type: 'weekly' } });

      await controller.getLeaderboard(req);

      expect(natsMock.send).toHaveBeenCalledWith('gamification.getLeaderboard', {
        userId: 'u1',
        type: 'weekly'
      });
    });
  });

  describe('getAchievements()', () => {
    it('should wrap results in an achievements object', async () => {
      const achievements = [{ id: 'a1' }];
      natsMock.send.mockReturnValue(of(achievements));
      
      const result = await controller.getAchievements(createReqMock());
      
      expect(result.data).toMatchObject({ achievements });
    });
  });

  describe('recordActivity()', () => {
    it('should forward activity data to NATS', async () => {
      natsMock.send.mockReturnValue(of({ xp_gained: 10 }));
      const req = createReqMock({ sub: 'u1', body: { activityType: 'LESSON_DONE', meta: { id: 'l1' } } });

      const result = await controller.recordActivity(req);

      expect(natsMock.send).toHaveBeenCalledWith('gamification.recordActivity', {
        userId: 'u1',
        activityType: 'LESSON_DONE',
        meta: { id: 'l1' }
      });
      expect(result.success).toBe(true);
    });
  });

  describe('redeemPoints()', () => {
    it('should forward redemption request to NATS', async () => {
      natsMock.send.mockReturnValue(of({ success: true }));
      const req = createReqMock({ sub: 'u1', body: { dealId: 'deal-1' } });

      const result = await controller.redeemPoints(req);

      expect(natsMock.send).toHaveBeenCalledWith('gamification.redeemPoints', {
        userId: 'u1',
        dealId: 'deal-1'
      });
      expect(result.success).toBe(true);
    });
  });
});
