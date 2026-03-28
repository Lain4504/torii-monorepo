import { Test, TestingModule } from '@nestjs/testing';
import { CourseModuleService } from '../src/modules/course-profile/course-module.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CourseModuleService', () => {
  let service: CourseModuleService;
  let prisma: any;
  let audit: any;

  beforeEach(async () => {
    const mockPrisma = {
      courseProfile: {
        findUnique: jest.fn().mockResolvedValue({ id: 'cp1', status: 'DRAFT', code: 'C1' }),
      },
      module: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({ id: 'm1', title: 'M1' }),
        findUnique: jest.fn().mockResolvedValue({ 
          id: 'm1', 
          title: 'M1', 
          courseProfile: { status: 'DRAFT', code: 'C1' } 
        }),
        update: jest.fn().mockResolvedValue({ id: 'm1', title: 'M1-Edit' }),
        delete: jest.fn().mockResolvedValue({ id: 'm1' }),
      },
    };

    const mockAudit = {
      log: jest.fn().mockResolvedValue(undefined),
    };

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

  describe('create', () => {
    it('should throw error if profile not found', async () => {
      prisma.courseProfile.findUnique.mockResolvedValueOnce(null);
      await expect(service.create({ courseProfileId: 'invalid', title: 'T' }))
        .rejects.toThrow('Invalid courseProfileId');
    });

    it('should throw error if profile status is not DRAFT', async () => {
      prisma.courseProfile.findUnique.mockResolvedValueOnce({ status: 'PUBLISHED' });
      await expect(service.create({ courseProfileId: 'cp1', title: 'T' }))
        .rejects.toThrow('chưa ở trạng thái DRAFT');
    });

    it('should create module with auto orderIndex', async () => {
      prisma.module.count.mockResolvedValueOnce(5);
      await service.create({ courseProfileId: 'cp1', title: 'New Module' });
      expect(prisma.module.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ orderIndex: 6 }),
      });
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if module missing', async () => {
      prisma.module.findUnique.mockResolvedValueOnce(null);
      await expect(service.update('non-existent', { title: 'T' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should update module in DRAFT profile', async () => {
      await service.update('m1', { title: 'Updated' });
      expect(prisma.module.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { title: 'Updated' },
      });
    });

    it('should throw error if profile is locked', async () => {
      prisma.module.findUnique.mockResolvedValueOnce({ 
        courseProfile: { status: 'PUBLISHED' } 
      });
      await expect(service.update('m1', { title: 'Updated' }))
        .rejects.toThrow('chưa ở trạng thái DRAFT');
    });
  });

  describe('delete', () => {
    it('should delete module if profile is DRAFT', async () => {
      prisma.module.findUnique.mockResolvedValueOnce({
        id: 'm1',
        title: 'M1',
        courseProfile: { status: 'DRAFT', code: 'C1' },
        _count: { lessons: 0 }
      });
      await service.delete('m1');
      expect(prisma.module.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
    });
  });
});
