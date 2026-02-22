/**
 * Unit Tests: Billing Module Controllers (Gateway)
 *
 * Covers:
 *  - OrderController: List, Create, Wallet balance
 *  - PayOSController: Public webhooks
 */

import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { OrderController } from '../../src/modules/billing/controllers/order.controller';
import { PayOSController } from '../../src/modules/billing/controllers/payos.controller';
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
    requester: { sub: 'user-123', role: 'student', ...overrides },
    ...overrides,
  } as any;
}

// ---------------------------------------------------------------------------
// OrderController Tests
// ---------------------------------------------------------------------------

describe('OrderController (Gateway)', () => {
  let controller: OrderController;
  let natsMock: ReturnType<typeof createNatsMock>;

  beforeEach(async () => {
    natsMock = createNatsMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: 'NATS_SERVICE', useValue: natsMock }],
    })
      .overrideGuard(GatewayAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrderController>(OrderController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll()', () => {
    it('should forward search query to NATS and return paginated result', async () => {
      const query = { status: 'completed' } as any;
      const fakeResult = { items: [], meta: { total: 0 } };
      natsMock.send.mockReturnValue(of(fakeResult));

      const result = await controller.findAll(query);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'billing.order.findAll' },
        query
      );
      expect(result).toMatchObject({ success: true, ...fakeResult });
    });

    it('should return errorResponse if NATS fails', async () => {
      natsMock.send.mockReturnValue(throwError(() => new Error('DB error')));
      const result = await controller.findAll({} as any);
      expect(result).toMatchObject({ success: false, message: 'DB error' });
    });
  });

  describe('create()', () => {
    it('should include userId and role in NATS payload', async () => {
      const input = { planId: 'p1' } as any;
      natsMock.send.mockReturnValue(of({ id: 'ord123' }));
      const req = createReqMock({ sub: 'u1', role: 'student' });

      const result = await controller.create(input, req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'billing.order.create' },
        expect.objectContaining({ userId: 'u1', userRole: 'student' })
      );
      expect(result).toMatchObject({ success: true });
    });
  });

  describe('getBalance()', () => {
    it('should fetch user balance from NATS', async () => {
      natsMock.send.mockReturnValue(of(1000));
      const req = createReqMock({ sub: 'u1' });

      const result = await controller.getBalance(req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'billing.user_balance.get' },
        { userId: 'u1' }
      );
      expect(result.data).toMatchObject({ balance: 1000 });
    });
  });
});

// ---------------------------------------------------------------------------
// PayOSController Tests
// ---------------------------------------------------------------------------

describe('PayOSController (Gateway)', () => {
  let controller: PayOSController;
  let natsMock: ReturnType<typeof createNatsMock>;

  beforeEach(async () => {
    natsMock = createNatsMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayOSController],
      providers: [{ provide: 'NATS_SERVICE', useValue: natsMock }],
    }).compile();

    controller = module.get<PayOSController>(PayOSController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('handleWebhook()', () => {
    it('should log and forward PayOS webhook data to NATS', async () => {
      const body = { code: '00', data: { orderCode: 'abc' } };
      natsMock.send.mockReturnValue(of({ received: true }));

      const result = await controller.handleWebhook(body);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'billing.payos.webhook' },
        body
      );
      expect(result).toMatchObject({ success: true });
    });

    it('should return errorResponse on NATS failure', async () => {
      natsMock.send.mockReturnValue(throwError(() => new Error('Process fail')));
      const result = await controller.handleWebhook({});
      expect(result).toMatchObject({ success: false, message: 'Process fail' });
    });
  });
});
