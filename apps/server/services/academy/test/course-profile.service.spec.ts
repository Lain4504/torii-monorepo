import { Test, TestingModule } from '@nestjs/testing';
import { CourseProfileService } from '../src/modules/course-profile/course-profile.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('CourseProfileService', () => {
  let service: CourseProfileService;
  let prisma: PrismaService;
  let audit: AuditLoggerService;
  let natsClient: ClientProxy;

  const mockPrisma = {
    courseProfile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    module: {
      count: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    lesson: {
      createMany: jest.fn(),
    },
    cohort: {
      count: jest.fn(),
    },
    vodPackage: {
      count: jest.fn(),
    },
    $transaction: jest.fn((val) => {
      if (typeof val === 'function') {
        return val(mockPrisma);
      }
      return Promise.all(val);
    }),
  };

  const mockAudit = {
    log: jest.fn(),
  };

  const mockNatsClient = {
    emit: jest.fn().mockReturnValue(of({})),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseProfileService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLoggerService, useValue: mockAudit },
        { provide: 'NATS_SERVICE', useValue: mockNatsClient },
      ],
    }).compile();

    service = module.get<CourseProfileService>(CourseProfileService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditLoggerService>(AuditLoggerService);
    natsClient = module.get<ClientProxy>('NATS_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of course profiles', async () => {
      const expectedProfiles = [{ id: '1', title: 'Course 1' }];
      mockPrisma.courseProfile.findMany.mockResolvedValue(expectedProfiles);

      const result = await service.findAll({ level: 'BEGINNER', q: 'test' } as any);

      expect(result).toEqual(expectedProfiles);
      expect(mockPrisma.courseProfile.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { level: 'BEGINNER' },
            {
              OR: [
                { code: { contains: 'test', mode: 'insensitive' } },
                { title: { contains: 'test', mode: 'insensitive' } },
              ],
            },
          ],
        },
        orderBy: [{ createdAt: 'desc' }],
      });
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if course profile not found', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue(null);
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });

    it('should return the course profile', async () => {
      const profile = { id: '1', title: 'Course 1', modules: [] };
      mockPrisma.courseProfile.findUnique.mockResolvedValue(profile);

      const result = await service.findById('1');
      expect(result).toEqual(profile);
    });
  });

  describe('create', () => {
    const createDto = { code: 'C1', title: 'Course 1' };

    it('should throw BadRequestException if code already exists', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.create(createDto as any)).rejects.toThrow(
        new BadRequestException('CourseProfile code already exists'),
      );
    });

    it('should create a new course profile and log audit', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue(null);
      const createdProfile = { id: '1', ...createDto, status: 'DRAFT' };
      mockPrisma.courseProfile.create.mockResolvedValue(createdProfile);

      const result = await service.create(createDto as any, 'user1');

      expect(result).toEqual(createdProfile);
      expect(mockAudit.log).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto = { title: 'Updated' };

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue(null);
      await expect(service.update('1', updateDto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if status is not DRAFT', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({ id: '1', status: 'PUBLISHED' });
      await expect(service.update('1', updateDto as any)).rejects.toThrow(BadRequestException);
    });

    it('should update course profile', async () => {
      const before = { id: '1', status: 'DRAFT', code: 'C1' };
      const after = { ...before, title: 'Updated' };
      mockPrisma.courseProfile.findUnique.mockResolvedValue(before);
      mockPrisma.courseProfile.update.mockResolvedValue(after);

      const result = await service.update('1', updateDto as any, 'user1');
      expect(result).toEqual(after);
    });
  });

  describe('submitForApproval', () => {
    it('should throw BadRequestException if no modules', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({ id: '1', status: 'DRAFT' });
      mockPrisma.module.count.mockResolvedValue(0);

      await expect(service.submitForApproval('1')).rejects.toThrow(
        /Chương trình học trống/,
      );
    });

    it('should throw BadRequestException if module has no lessons', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({ id: '1', status: 'DRAFT' });
      mockPrisma.module.count.mockResolvedValue(1);
      mockPrisma.module.findFirst.mockResolvedValue({ title: 'Module 1' });

      await expect(service.submitForApproval('1')).rejects.toThrow(
        /Bạn phải thêm bài học vào bên trong module/,
      );
    });

    it('should update status to PENDING_APPROVAL', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({ id: '1', status: 'DRAFT', code: 'C1' });
      mockPrisma.module.count.mockResolvedValue(1);
      mockPrisma.module.findFirst.mockResolvedValue(null);
      mockPrisma.courseProfile.update.mockResolvedValue({ id: '1', status: 'PENDING_APPROVAL' });

      const result = await service.submitForApproval('1', 'user1');
      expect(result.status).toBe('PENDING_APPROVAL');
    });
  });

  describe('approve', () => {
    it('should update status to PUBLISHED', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({ id: '1', status: 'PENDING_APPROVAL', code: 'C1' });
      mockPrisma.courseProfile.update.mockResolvedValue({ id: '1', status: 'PUBLISHED' });

      const result = await service.approve('1', 'user1');
      expect(result.status).toBe('PUBLISHED');
    });
  });

  describe('reject', () => {
    it('should update status to DRAFT and send notification', async () => {
      const before = { id: '1', status: 'PENDING_APPROVAL', code: 'C1', submittedBy: 'submitter' };
      mockPrisma.courseProfile.findUnique.mockResolvedValue(before);
      mockPrisma.courseProfile.update.mockResolvedValue({ ...before, status: 'DRAFT' });

      const result = await service.reject('1', 'Incorrect content', 'approver');

      expect(result.status).toBe('DRAFT');
      expect(mockNatsClient.emit).toHaveBeenCalled();
    });
  });

  describe('duplicate', () => {
    it('should clone profile and its content', async () => {
      const source = {
        id: '1',
        code: 'S1',
        modules: [
          { id: 'm1', title: 'M1', orderIndex: 1, lessons: [{ title: 'L1', type: 'VIDEO', orderIndex: 1 }] },
        ],
      };
      mockPrisma.courseProfile.findUnique.mockResolvedValueOnce(source); // find source
      mockPrisma.courseProfile.findUnique.mockResolvedValueOnce(null); // check if new code exists
      
      const newProfile = { id: '2', code: 'N1' };
      mockPrisma.courseProfile.create.mockResolvedValue(newProfile);
      mockPrisma.module.create.mockResolvedValue({ id: 'nm1' });

      const result = await service.duplicate('1', 'N1', 'New Title', 'user1');

      expect(result).toEqual(newProfile);
      expect(mockPrisma.courseProfile.create).toHaveBeenCalled();
      expect(mockPrisma.module.create).toHaveBeenCalled();
      expect(mockPrisma.lesson.createMany).toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('should set status to ARCHIVED', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({ id: '1', code: 'C1' });
      mockPrisma.courseProfile.update.mockResolvedValue({ id: '1', status: 'ARCHIVED' });

      const result = await service.archive('1', 'user1');
      expect(result.status).toBe('ARCHIVED');
    });
  });

  describe('delete', () => {
    it('should throw BadRequestException if related data exists', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.cohort.count.mockResolvedValue(1);
      mockPrisma.vodPackage.count.mockResolvedValue(0);
      mockPrisma.module.count.mockResolvedValue(0);

      await expect(service.delete('1')).rejects.toThrow(BadRequestException);
    });

    it('should delete if no related data', async () => {
      mockPrisma.courseProfile.findUnique.mockResolvedValue({ id: '1', code: 'C1' });
      mockPrisma.cohort.count.mockResolvedValue(0);
      mockPrisma.vodPackage.count.mockResolvedValue(0);
      mockPrisma.module.count.mockResolvedValue(0);

      const result = await service.delete('1', 'user1');
      expect(result).toEqual({ ok: true });
      expect(mockPrisma.courseProfile.delete).toHaveBeenCalled();
    });
  });
});
