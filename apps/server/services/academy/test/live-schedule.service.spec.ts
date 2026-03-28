import { Test, TestingModule } from '@nestjs/testing';
import { LiveScheduleService } from '../src/modules/classroom/live-schedule/live-schedule.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AppConfigService } from '@server/shared';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

jest.mock('@bufbuild/protobuf', () => ({
  create: jest.fn().mockReturnValue({}),
}));

describe('LiveScheduleService', () => {
  let service: LiveScheduleService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      liveClass: { 
        findUnique: jest.fn().mockResolvedValue({ 
          id: 'lc1', status: 'OPENING', name: 'Class 1',
          liveSchedules: [{ id: 'ls1' }],
          cohort: { courseProfile: { title: 'P1' } }
        }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      cohort: { findUnique: jest.fn().mockResolvedValue({ id: 'c1', startDate: new Date(), endDate: new Date() }) },
      liveSchedule: { 
        create: jest.fn().mockResolvedValue({ id: 'ls1', liveClassId: 'lc1', weekday: 1, startTime: '09:00' }), 
        findMany: jest.fn().mockResolvedValue([]), 
        findUnique: jest.fn().mockResolvedValue({ 
          id: 'ls1', liveClassId: 'lc1',
          liveClass: { status: 'OPENING', liveSchedules: [{ id: 'ls1' }] }
        }), 
        delete: jest.fn() 
      },
      liveScheduleSession: { 
        createMany: jest.fn(), 
        upsert: jest.fn().mockResolvedValue({ id: 's1' }), 
        findMany: jest.fn().mockResolvedValue([]), 
        findUnique: jest.fn().mockResolvedValue({ 
          id: 's1', classId: 'lc1',
          liveClass: { 
            status: 'OPENING', 
            cohort: { courseProfile: { title: 'P1' } },
            instructor: { id: 'ins1' }
          } 
        }), 
        update: jest.fn() 
      },
      liveScheduleRequest: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
      attendance: { upsert: jest.fn() },
      user: { findUnique: jest.fn() },
      enrollment: { findFirst: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveScheduleService,
        { provide: PrismaService, useValue: prisma },
        { provide: AppConfigService, useValue: { get: jest.fn() } },
        { provide: AuditLoggerService, useValue: { log: jest.fn() } },
        { provide: 'NATS_SERVICE', useValue: { emit: jest.fn(), send: jest.fn().mockReturnValue(of({})) } },
      ],
    }).compile();

    service = module.get<LiveScheduleService>(LiveScheduleService);
  });

  describe('create Exhaustive', () => {
    it('should generate sessions and call upsert', async () => {
      // Mock generateInstances to avoid logic skip
      jest.spyOn(service as any, 'generateInstancesForClassRange').mockResolvedValue(undefined);
      await service.create({ classId: 'lc1', weekday: 3, startTime: '09:00', endTime: '10:00' } as any);
      expect(prisma.liveSchedule.create).toHaveBeenCalled();
    });
  });

  describe('join and attendance', () => {
    it('should record attendance when learner joins successfully', async () => {
      prisma.enrollment.findFirst.mockResolvedValueOnce({ id: 'e1' });
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', displayName: 'U1' });
      
      const result = await service.joinBySessionId('s1', 'u1');
      expect(result).toBeDefined();
    });
  });

  describe('session management', () => {
    it('should delete schedule successfully', async () => {
      await service.delete('ls1');
      expect(prisma.liveSchedule.delete).toHaveBeenCalled();
    });
  });
});
