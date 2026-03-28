import { Test, TestingModule } from '@nestjs/testing';
import { LiveClassService } from '../src/modules/classroom/live-class/live-class.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { LiveScheduleService } from '../src/modules/classroom/live-schedule/live-schedule.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';

describe('LiveClassService', () => {
  let service: LiveClassService;
  let prisma: any;
  let liveSchedules: any;

  beforeEach(async () => {
    prisma = {
      liveClass: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({ id: 'lc1', status: 'DRAFT' }),
        create: jest.fn().mockResolvedValue({ id: 'lc1' }),
        update: jest.fn().mockResolvedValue({ id: 'lc1' }),
      },
      cohort: { findUnique: jest.fn().mockResolvedValue({ id: 'c1', startDate: new Date() }) },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    liveSchedules = {
      create: jest.fn().mockResolvedValue({ id: 'ls1' }),
      generateInstancesForClassRange: jest.fn().mockResolvedValue([]),
      assertNoScheduleConflicts: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveClassService,
        { provide: PrismaService, useValue: prisma },
        { provide: LiveScheduleService, useValue: liveSchedules },
        { provide: AuditLoggerService, useValue: { log: jest.fn() } },
        { provide: 'NATS_SERVICE', useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<LiveClassService>(LiveClassService);
  });

  describe('create and conflicts', () => {
    it('should create class successfully', async () => {
      const schedules = [{ weekday: 1, startTime: '09:00', endTime: '10:00' }];
      const result = await service.create({ cohortId: 'c1', schedules } as any);
      expect(result.id).toBe('lc1');
      expect(liveSchedules.assertNoScheduleConflicts).toHaveBeenCalled();
    });
  });
});
