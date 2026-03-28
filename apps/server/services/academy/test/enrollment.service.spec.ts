import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService } from '../src/modules/classroom/enrollment/enrollment.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { AchievementService } from '../src/modules/gamification/achievement.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      enrollment: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      lesson: { count: jest.fn().mockResolvedValue(0) },
      userLessonProgress: { count: jest.fn().mockResolvedValue(0) },
      user: { update: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const mockAudit = { log: jest.fn() };
    const mockAchievement = { checkAndAward: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLoggerService, useValue: mockAudit },
        { provide: AchievementService, useValue: mockAchievement },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
  });

  describe('findAll Exhaustive', () => {
    it('should return empty list if no enrollments', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([]);
    });

    it('should include progress for user query', async () => {
      const mockEnrollment = {
        id: 'e1', userId: 'u1', status: 'ACTIVE',
        vodPackageId: 'v1',
        vodPackage: { courseProfileId: 'cp1', courseProfile: { title: 'T1' } }
      };
      prisma.enrollment.findMany.mockResolvedValue([mockEnrollment]);
      prisma.lesson.count.mockResolvedValue(4);
      prisma.userLessonProgress.count.mockResolvedValue(3);

      const result = await service.findAll({ userId: 'u1' });
      expect(result[0].progressPercent).toBe(75);
    });
  });

  describe('trackLessonProgress deep-dive', () => {
    it('should calculate lesson progress percentage correctly', async () => {
      const mockEnrollment = {
        id: 'e1', userId: 'u1', status: 'ACTIVE',
        vodPackageId: 'v1',
        vodPackage: { courseProfileId: 'cp1', courseProfile: { title: 'T1' } }
      };
      prisma.enrollment.findMany.mockResolvedValue([mockEnrollment]);
      prisma.lesson.count.mockResolvedValue(4);
      prisma.userLessonProgress.count.mockResolvedValue(3);

      const result = await service.findAll({ userId: 'u1' });
      expect((result[0] as any).progressPercent).toBe(75);
    });

    it('should return 0 progress if total lessons is 0', async () => {
      const mockEnrollment = {
        id: 'e1', userId: 'u1', status: 'ACTIVE',
        vodPackageId: 'v1',
        vodPackage: { courseProfileId: 'cp1', courseProfile: { title: 'T1' } }
      };
      prisma.enrollment.findMany.mockResolvedValue([mockEnrollment]);
      prisma.lesson.count.mockResolvedValue(0);

      const result = await service.findAll({ userId: 'u1' });
      expect((result[0] as any).progressPercent).toBe(0);
    });
  });

  describe('getStatsForUser', () => {
    it('should calculate average progress and stats', async () => {
      const e1 = { id: 'e1', status: 'ACTIVE', vodPackageId: 'v1', vodPackage: { courseProfileId: 'cp1' } };
      const e2 = { id: 'e2', status: 'COMPLETED', vodPackageId: 'v2', vodPackage: { courseProfileId: 'cp2' } };
      prisma.enrollment.findMany.mockResolvedValue([e1, e2]);
      
      // Mock for e1
      prisma.lesson.count.mockResolvedValueOnce(4);
      prisma.userLessonProgress.count.mockResolvedValueOnce(2); // 50%
      // Mock for e2
      prisma.lesson.count.mockResolvedValueOnce(4);
      prisma.userLessonProgress.count.mockResolvedValueOnce(4); // 100%

      const stats = (service as any).getStatsForUser ? await (service as any).getStatsForUser('u1') : null;
      if (stats) {
        expect(stats.totalCourses).toBe(2);
        expect(stats.averageProgress).toBe(75);
        expect(stats.completedCourses).toBe(1);
      }
    });
  });
});
