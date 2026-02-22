import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { NotificationController } from '../../src/modules/communication/controllers/notification.controller';
import { TicketController } from '../../src/modules/communication/controllers/ticket.controller';
import { GatewayAuthGuard, PermissionsGuard } from '@server/shared';

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
    requester: { sub: 'user-123', role: 'learner', ...overrides },
    ...overrides,
  } as any;
}

// ---------------------------------------------------------------------------
// NotificationController Tests
// ---------------------------------------------------------------------------

describe('NotificationController (Gateway)', () => {
  let controller: NotificationController;
  let natsMock: ReturnType<typeof createNatsMock>;

  beforeEach(async () => {
    natsMock = createNatsMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: 'NATS_SERVICE', useValue: natsMock }],
    })
      .overrideGuard(GatewayAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll()', () => {
    it('should fetch notifications for user from NATS', async () => {
      const query = { page: 1 };
      const fakeResult = { items: [], meta: { total: 0 } };
      natsMock.send.mockReturnValue(of(fakeResult));
      const req = createReqMock({ sub: 'user-456' });

      const result = await controller.findAll(req, query as any);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'communication.notification.findAll' },
        { userId: 'user-456', query }
      );
      expect(result).toMatchObject({ success: true, ...fakeResult });
    });
  });

  describe('getUnreadCount()', () => {
    it('should return count from NATS', async () => {
      natsMock.send.mockReturnValue(of({ count: 5 }));
      const result = await controller.getUnreadCount(createReqMock({ sub: 'u1' }));
      expect(result.data.count).toBe(5);
    });
  });
});

// ---------------------------------------------------------------------------
// TicketController Tests
// ---------------------------------------------------------------------------

describe('TicketController (Gateway)', () => {
  let controller: TicketController;
  let natsMock: ReturnType<typeof createNatsMock>;

  beforeEach(async () => {
    natsMock = createNatsMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [{ provide: 'NATS_SERVICE', useValue: natsMock }],
    })
      .overrideGuard(GatewayAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TicketController>(TicketController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createTicket()', () => {
    it('should submit ticket via NATS with requesterId', async () => {
      const dto = { title: 'Bug', content: 'Help' };
      natsMock.send.mockReturnValue(of({ id: 't1' }));
      const req = createReqMock({ sub: 'user-learner' });

      const result = await controller.createTicket(dto as any, req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'communication.ticket.create' },
        { userId: 'user-learner', dto }
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getTickets()', () => {
    it('should restrict learners to their own tickets', async () => {
      natsMock.send.mockReturnValue(of({ items: [], meta: {} }));
      const req = createReqMock({ sub: 'learner-1', role: 'learner' });
      const query = {} as any;

      await controller.getTickets(query, req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'communication.ticket.findAll' },
        expect.objectContaining({ userId: 'learner-1' })
      );
    });

    it('should allow staff to see all tickets', async () => {
      natsMock.send.mockReturnValue(of({ items: [], meta: {} }));
      const req = createReqMock({ sub: 'staff-1', role: 'admin' });
      const query = {} as any;

      await controller.getTickets(query, req);

      expect(natsMock.send).toHaveBeenCalledWith(
        { cmd: 'communication.ticket.findAll' },
        expect.not.objectContaining({ userId: 'staff-1' })
      );
    });
  });
});
