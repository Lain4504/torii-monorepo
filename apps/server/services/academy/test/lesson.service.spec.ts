import { Test, TestingModule } from '@nestjs/testing';
import { LessonService, LessonCreateDto, LessonUpdateDto } from '../src/modules/lesson/lesson.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LessonService', () => {
  let service: LessonService;
  let prisma: PrismaService;
  let audit: AuditLoggerService;

  const mockPrisma = {
    lesson: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    module: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  };

  const mockAudit = {
    log: jest.fn(),
  };

  beforeEach(async () => {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return lessons with filters', async () => {
      const lessons = [{ id: 'l1', title: 'Lesson 1' }];
      mockPrisma.lesson.findMany.mockResolvedValue(lessons);

      const result = await service.findAll({ q: 'test ', courseProfileId: 'p1' });

      expect(result).toEqual(lessons);
      expect(mockPrisma.lesson.findMany).toHaveBeenCalledWith({
        where: {
          module: { courseProfileId: 'p1' },
          title: { contains: 'test', mode: 'insensitive' },
        },
        include: expect.any(Object),
        orderBy: expect.any(Array),
      });
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if not found', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue(null);
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });

    it('should return lesson', async () => {
      const lesson = { id: '1', title: 'L1', moduleId: 'm1' };
      mockPrisma.lesson.findUnique.mockResolvedValue(lesson);
      const result = await service.findById('1');
      expect(result).toEqual(lesson);
    });
  });

  describe('create', () => {
    const createDto: LessonCreateDto = {
      moduleId: 'm1',
      type: 'VIDEO',
      title: 'New Lesson',
    };

    it('should throw BadRequestException if module not found', async () => {
      mockPrisma.module.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if status is not DRAFT', async () => {
      mockPrisma.module.findUnique.mockResolvedValue({
        id: 'm1',
        courseProfile: { status: 'PUBLISHED' },
      });
      await expect(service.create(createDto)).rejects.toThrow(/DRAFT/);
    });

    it('should create lesson and log audit', async () => {
      mockPrisma.module.findUnique.mockResolvedValue({
        id: 'm1',
        courseProfile: { status: 'DRAFT' },
      });
      mockPrisma.lesson.count.mockResolvedValue(5);
      const createdItem = { id: 'l1', title: 'New Lesson', orderIndex: 6 };
      mockPrisma.lesson.create.mockResolvedValue(createdItem);

      const result = await service.create(createDto, 'user1');

      expect(result).toEqual(createdItem);
      expect(mockPrisma.lesson.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ orderIndex: 6 }),
      });
      expect(mockAudit.log).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if status is not DRAFT', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'l1', moduleId: 'm1' });
      mockPrisma.module.findUnique.mockResolvedValue({
        courseProfile: { status: 'PUBLISHED' },
      });

      await expect(service.update('l1', { title: 'U1' })).rejects.toThrow(/DRAFT/);
    });

    it('should update and log audit', async () => {
      const before = { id: 'l1', title: 'Old', moduleId: 'm1' };
      mockPrisma.lesson.findUnique.mockResolvedValue(before);
      mockPrisma.module.findUnique.mockResolvedValue({
        courseProfile: { status: 'DRAFT' },
      });
      const after = { ...before, title: 'New' };
      mockPrisma.lesson.update.mockResolvedValue(after);

      const result = await service.update('l1', { title: 'New' }, 'user1');
      expect(result.title).toBe('New');
      expect(mockAudit.log).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete and log audit', async () => {
      const before = { id: 'l1', title: 'Del', moduleId: 'm1' };
      mockPrisma.lesson.findUnique.mockResolvedValue(before);
      mockPrisma.module.findUnique.mockResolvedValue({
        courseProfile: { status: 'DRAFT' },
      });

      const result = await service.delete('l1', 'user1');
      expect(result).toEqual({ ok: true });
      expect(mockPrisma.lesson.delete).toHaveBeenCalled();
      expect(mockAudit.log).toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    it('should update orders in transaction', async () => {
      mockPrisma.module.findUnique.mockResolvedValue({
        id: 'm1',
        courseProfile: { status: 'DRAFT' },
      });

      const result = await service.reorder('m1', ['l1', 'l2'], 'user1');
      expect(result).toEqual({ ok: true });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockAudit.log).toHaveBeenCalled();
    });
  });
});
