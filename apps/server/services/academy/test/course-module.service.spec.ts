import { Test, TestingModule } from '@nestjs/testing';
import { CourseModuleService, CourseModuleCreateDto, CourseModuleUpdateDto } from '../src/modules/course-profile/course-module.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CourseModuleService', () => {
  let service: CourseModuleService;
  let prisma: PrismaService;
  let audit: AuditLoggerService;

  const mockPrisma = {
    courseProfile: {
      findUnique: jest.fn(),
    },
    module: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  };

  const mockAudit = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseModuleService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLoggerService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<CourseModuleService>(CourseModuleService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditLoggerService>(AuditLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CourseModuleCreateDto = {
      courseProfileId: 'profile-1',
      title: 'Module 1',
    };

    it('should throw BadRequestException if courseProfile not found', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Invalid courseProfileId'),
      );
    });

    it('should throw BadRequestException if courseProfile status is not DRAFT', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        status: 'PUBLISHED',
        code: 'CP001',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException(
          'Không thể thêm/chỉnh sửa Module khi CourseProfile chưa ở trạng thái DRAFT.',
        ),
      );
    });

    it('should create a module with custom orderIndex', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        status: 'DRAFT',
        code: 'CP001',
      });
      const expectedModule = { id: 'mod-1', ...createDto, orderIndex: 5 };
      mockPrisma.module.create.mockResolvedValue(expectedModule);

      const result = await service.create({ ...createDto, orderIndex: 5 });

      expect(result).toEqual(expectedModule);
      expect(mockPrisma.module.create).toHaveBeenCalledWith({
        data: {
          courseProfileId: 'profile-1',
          title: 'Module 1',
          orderIndex: 5,
        },
      });
    });

    it('should create a module with auto-incremented orderIndex and log audit', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        status: 'DRAFT',
        code: 'CP001',
      });
      mockPrisma.module.count.mockResolvedValue(2);
      const expectedModule = { id: 'mod-1', ...createDto, orderIndex: 3 };
      mockPrisma.module.create.mockResolvedValue(expectedModule);

      const result = await service.create(createDto, 'user-1');

      expect(result).toEqual(expectedModule);
      expect(mockPrisma.module.count).toHaveBeenCalledWith({
        where: { courseProfileId: 'profile-1' },
      });
      expect(mockAudit.log).toHaveBeenCalledWith({
        userId: 'user-1',
        action: 'module.create',
        entity: 'Module',
        entityId: 'mod-1',
        description: 'Tạo module "Module 1" trong CourseProfile CP001',
        newValues: expectedModule,
      });
    });
  });

  describe('update', () => {
    const moduleId = 'mod-1';
    const updateDto: CourseModuleUpdateDto = { title: 'Updated Title' };

    it('should throw NotFoundException if module not found', async () => {
      mockPrisma.module.findUnique.mockResolvedValue(null);

      await expect(service.update(moduleId, updateDto)).rejects.toThrow(
        new NotFoundException('Module not found'),
      );
    });

    it('should throw BadRequestException if courseProfile status is not DRAFT', async () => {
      mockPrisma.module.findUnique.mockResolvedValue({
        id: moduleId,
        courseProfile: { status: 'PUBLISHED', code: 'CP001' },
      });

      await expect(service.update(moduleId, updateDto)).rejects.toThrow(
        new BadRequestException(
          'Không thể chỉnh sửa Module khi CourseProfile chưa ở trạng thái DRAFT.',
        ),
      );
    });

    it('should update module and log audit', async () => {
      const beforeUpdate = {
        id: moduleId,
        title: 'Old Title',
        courseProfile: { status: 'DRAFT', code: 'CP001' },
      };
      const afterUpdate = { id: moduleId, title: 'Updated Title' };
      mockPrisma.module.findUnique.mockResolvedValue(beforeUpdate);
      mockPrisma.module.update.mockResolvedValue(afterUpdate);

      const result = await service.update(moduleId, updateDto, 'user-1');

      expect(result).toEqual(afterUpdate);
      expect(mockPrisma.module.update).toHaveBeenCalledWith({
        where: { id: moduleId },
        data: { title: 'Updated Title' },
      });
      expect(mockAudit.log).toHaveBeenCalledWith({
        userId: 'user-1',
        action: 'module.update',
        entity: 'Module',
        entityId: moduleId,
        description: 'Cập nhật module "Old Title" trong CourseProfile CP001',
        oldValues: beforeUpdate,
        newValues: afterUpdate,
      });
    });
  });

  describe('delete', () => {
    const moduleId = 'mod-1';

    it('should throw NotFoundException if module not found', async () => {
      mockPrisma.module.findUnique.mockResolvedValue(null);

      await expect(service.delete(moduleId)).rejects.toThrow(
        new NotFoundException('Module not found'),
      );
    });

    it('should throw BadRequestException if courseProfile status is not DRAFT', async () => {
      mockPrisma.module.findUnique.mockResolvedValue({
        id: moduleId,
        courseProfile: { status: 'PUBLISHED' },
      });

      await expect(service.delete(moduleId)).rejects.toThrow(
        new BadRequestException(
          'Không thể xóa Module khi CourseProfile chưa ở trạng thái DRAFT.',
        ),
      );
    });

    it('should delete module and log audit', async () => {
      const beforeDelete = {
        id: moduleId,
        title: 'Delete Me',
        courseProfile: { status: 'DRAFT', code: 'CP01' },
        _count: { lessons: 5 },
      };
      mockPrisma.module.findUnique.mockResolvedValue(beforeDelete);

      const result = await service.delete(moduleId, 'user-1');

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.module.delete).toHaveBeenCalledWith({ where: { id: moduleId } });
      expect(mockAudit.log).toHaveBeenCalledWith({
        userId: 'user-1',
        action: 'module.delete',
        entity: 'Module',
        entityId: moduleId,
        description: 'Xóa module "Delete Me" (bao gồm 5 lessons) khỏi CourseProfile CP01',
        oldValues: beforeDelete,
      });
    });
  });

  describe('reorder', () => {
    const profileId = 'profile-1';
    const moduleIds = ['m1', 'm2', 'm3'];

    it('should throw NotFoundException if courseProfile not found', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue(null);

      await expect(service.reorder(profileId, moduleIds)).rejects.toThrow(
        new NotFoundException('CourseProfile not found'),
      );
    });

    it('should throw BadRequestException if status is not DRAFT', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({ status: 'PUBLISHED' });

      await expect(service.reorder(profileId, moduleIds)).rejects.toThrow(
        new BadRequestException(
          'Chỉ có thể thay đổi thứ tự khi CourseProfile ở trạng thái DRAFT.',
        ),
      );
    });

    it('should update orders in a transaction and log audit', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({
        id: profileId,
        status: 'DRAFT',
        code: 'CP001',
      });

      const result = await service.reorder(profileId, moduleIds, 'user-1');

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      // Verify audit log
      expect(mockAudit.log).toHaveBeenCalledWith({
        userId: 'user-1',
        action: 'module.reorder',
        entity: 'Module',
        entityId: profileId,
        description: 'Thay đổi thứ tự các module trong CourseProfile CP001',
        metadata: { moduleIds },
      });
    });
  });
});
