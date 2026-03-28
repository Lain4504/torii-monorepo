import { Test, TestingModule } from '@nestjs/testing';
import { LessonService } from '../src/modules/lesson/lesson.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LessonService', () => {
  let service: LessonService;
  let prisma: any;
  let audit: any;

  beforeEach(async () => {
    const mockPrisma = {
      lesson: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({ 
          id: 'l1', 
          title: 'L1', 
          moduleId: 'm1',
          module: { status: 'DRAFT' } 
        }),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({ id: 'l1', title: 'L1', type: 'VIDEO' }),
        update: jest.fn().mockResolvedValue({ id: 'l1', title: 'L1-Edit' }),
        delete: jest.fn().mockResolvedValue({ id: 'l1' }),
      },
      module: {
        findUnique: jest.fn().mockResolvedValue({ 
          id: 'm1', 
          courseProfile: { status: 'DRAFT' } 
        }),
      },
      $transaction: jest.fn(async (cb) => cb(mockPrisma)),
    };

    const mockAudit = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLoggerService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditLoggerService>(AuditLoggerService);
  });

  describe('create Exhaustive', () => {
    it('should throw if course profile is PUBLISHED', async () => {
      prisma.module.findUnique.mockResolvedValueOnce({
        courseProfile: { status: 'PUBLISHED' }
      });
      await expect(service.create({ moduleId: 'm1', title: 'T', type: 'VIDEO' }))
        .rejects.toThrow('chưa ở trạng thái DRAFT');
    });

    it('should increment orderIndex automatically', async () => {
      prisma.lesson.count.mockResolvedValueOnce(5);
      await service.create({ moduleId: 'm1', title: 'L6', type: 'VIDEO' });
      expect(prisma.lesson.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ orderIndex: 6 })
      }));
    });
  });

  describe('delete deeply', () => {
    it('should throw if profile is not DRAFT', async () => {
      prisma.lesson.findUnique.mockResolvedValueOnce({ id: 'l1', moduleId: 'm1' });
      prisma.module.findUnique.mockResolvedValueOnce({ courseProfile: { status: 'PUBLISHED' } });
      await expect(service.delete('l1')).rejects.toThrow('chưa ở trạng thái DRAFT');
    });
  });
});
