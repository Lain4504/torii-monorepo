import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LessonService } from '../src/modules/lesson/lesson.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';

describe('LessonService', () => {
  let service: LessonService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(async () => {
    mockPrisma = {
      lesson: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      module: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((elements) => Promise.all(elements)),
    };

    mockAudit = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: AuditLoggerService,
          useValue: mockAudit,
        },
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw BadRequest if module not found', async () => {
      mockPrisma.module.findUnique.mockResolvedValue(null);
      await expect(service.create({ moduleId: 'm1', type: 'VIDEO', title: 'T' })).rejects.toThrow('Invalid moduleId');
    });

    it('should throw BadRequest if profile not DRAFT', async () => {
      mockPrisma.module.findUnique.mockResolvedValue({ courseProfile: { status: 'PUBLISHED' } });
      await expect(service.create({ moduleId: 'm1', type: 'VIDEO', title: 'T' })).rejects.toThrow('trạng thái DRAFT');
    });

    it('should create lesson and log audit', async () => {
      mockPrisma.module.findUnique.mockResolvedValue({ id: 'm1', courseProfile: { status: 'DRAFT' } });
      mockPrisma.lesson.count.mockResolvedValue(2);
      mockPrisma.lesson.create.mockResolvedValue({ id: 'l1', title: 'Lesson 1', orderIndex: 3 });

      const result = await service.create({ moduleId: 'm1', type: 'VIDEO', title: 'Lesson 1' }, 'user-1');

      expect(mockPrisma.lesson.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ orderIndex: 3 }),
      });
      expect(mockAudit.log).toHaveBeenCalled();
      expect(result.id).toBe('l1');
    });
  });

  describe('update', () => {
    it('should throw NotFound if lesson missing', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue(null);
      await expect(service.update('l1', { title: 'New' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequest if profile not DRAFT', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'l1', moduleId: 'm1' });
      mockPrisma.module.findUnique.mockResolvedValue({ courseProfile: { status: 'PUBLISHED' } });
      await expect(service.update('l1', { title: 'New' })).rejects.toThrow('trạng thái DRAFT');
    });

    it('should update correctly', async () => {
      const before = { id: 'l1', moduleId: 'm1', title: 'Old' };
      mockPrisma.lesson.findUnique.mockResolvedValue(before);
      mockPrisma.module.findUnique.mockResolvedValue({ courseProfile: { status: 'DRAFT' } });
      mockPrisma.lesson.update.mockResolvedValue({ id: 'l1', title: 'New' });

      const result = await service.update('l1', { title: 'New' }, 'user-1');

      expect(mockPrisma.lesson.update).toHaveBeenCalledWith({
        where: { id: 'l1' },
        data: { title: 'New' },
      });
      expect(mockAudit.log).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete if in DRAFT', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'l1', moduleId: 'm1', title: 'T' });
      mockPrisma.module.findUnique.mockResolvedValue({ courseProfile: { status: 'DRAFT' } });

      await service.delete('l1', 'user-1');

      expect(mockPrisma.lesson.delete).toHaveBeenCalled();
      expect(mockAudit.log).toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    it('should perform two-pass transaction reorder', async () => {
      mockPrisma.module.findUnique.mockResolvedValue({ courseProfile: { status: 'DRAFT' } });

      const lessonIds = ['l1', 'l2'];
      await service.reorder('m1', lessonIds, 'user-1');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      // Call count should be lessonIds.length * 2 (negative then positive)
      expect(mockPrisma.lesson.update).toHaveBeenCalledTimes(4);
      expect(mockPrisma.lesson.update).toHaveBeenCalledWith(expect.objectContaining({
          data: { orderIndex: -1 }
      }));
      expect(mockPrisma.lesson.update).toHaveBeenCalledWith(expect.objectContaining({
          data: { orderIndex: 1 }
      }));
    });
  });
});
