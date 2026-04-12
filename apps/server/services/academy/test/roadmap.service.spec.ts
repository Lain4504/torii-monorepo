import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoadmapService } from '../src/modules/roadmap/roadmap.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';

describe('RoadmapService', () => {
  let service: RoadmapService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      enrollment: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      userLessonProgress: {
        count: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        upsert: jest.fn(),
      },
      lesson: {
        count: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      liveScheduleSession: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      // Using direct properties for 'prismaAny' access
      learningRoadmap: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      learningRoadmapTask: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      learningRoadmapReplan: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RoadmapService>(RoadmapService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockEnrollment = {
    id: 'e1',
    userId: 'u1',
    status: 'ACTIVE',
    liveClassId: 'lc1',
    liveClass: { id: 'lc1', cohort: { courseProfileId: 'cp1' } },
    vodPackage: null,
  };

  describe('resolvePrimaryEnrollment', () => {
    it('should throw NotFound if no active enrollment', async () => {
      mockPrisma.enrollment.findMany.mockResolvedValue([]);
      await expect(service['resolvePrimaryEnrollment']('u1')).rejects.toThrow(NotFoundException);
    });

    it('should select enrollment with best score', async () => {
      mockPrisma.enrollment.findMany.mockResolvedValue([mockEnrollment]);
      mockPrisma.userLessonProgress.count.mockResolvedValue(5);
      mockPrisma.lesson.count.mockResolvedValue(10); // 50% progress

      const result = await service['resolvePrimaryEnrollment']('u1');
      expect(result.id).toBe('e1');
    });
  });

  describe('bootstrapRoadmapForEnrollment', () => {
    it('should skip if roadmap already exists', async () => {
      mockPrisma.enrollment.findFirst.mockResolvedValue(mockEnrollment);
      mockPrisma.learningRoadmap.findFirst.mockResolvedValue({ id: 'r1' });

      await service.bootstrapRoadmapForEnrollment('u1', 'e1');

      expect(mockPrisma.learningRoadmap.create).not.toHaveBeenCalled();
    });

    it('should create roadmap and tasks if none exists', async () => {
      mockPrisma.enrollment.findFirst.mockResolvedValue(mockEnrollment);
      mockPrisma.learningRoadmap.findFirst.mockResolvedValue(null);
      mockPrisma.learningRoadmap.create.mockResolvedValue({ id: 'r1', version: 1, currentWeek: 1 });
      
      // Mocks for createWeeklyTasks
      mockPrisma.userLessonProgress.findMany.mockResolvedValue([]);
      mockPrisma.lesson.findMany.mockResolvedValue([{ id: 'l1', title: 'L1' }]);
      mockPrisma.liveScheduleSession.findMany.mockResolvedValue([]);

      await service.bootstrapRoadmapForEnrollment('u1', 'e1');

      expect(mockPrisma.learningRoadmap.create).toHaveBeenCalled();
      expect(mockPrisma.learningRoadmapTask.createMany).toHaveBeenCalled();
    });
  });

  describe('getMyRoadmap', () => {
    it('should return existing roadmap converted to response', async () => {
        // Mock resolvePrimaryEnrollment
        mockPrisma.enrollment.findMany.mockResolvedValue([mockEnrollment]);
        mockPrisma.userLessonProgress.count.mockResolvedValue(0);
        mockPrisma.lesson.count.mockResolvedValue(10);

        mockPrisma.learningRoadmap.findFirst.mockResolvedValue({ id: 'r1', enrollmentId: 'e1' });
        mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
        mockPrisma.learningRoadmapTask.findMany.mockResolvedValue([{ id: 't1', status: 'PENDING' }]);

        const result = await service.getMyRoadmap('u1');
        expect(result.id).toBe('r1');
        expect(result.weekPlan.length).toBe(1);
    });
  });

  describe('updateTask', () => {
      it('should sync lesson progress when status is COMPLETED', async () => {
          const mockTask = { 
              id: 't1', taskType: 'LESSON', roadmap: { userId: 'u1', enrollmentId: 'e1' },
              metadata: { lessonId: 'l1' }
          };
          mockPrisma.learningRoadmapTask.findUnique.mockResolvedValue(mockTask);
          mockPrisma.learningRoadmapTask.update.mockResolvedValue({ ...mockTask, status: 'COMPLETED' });

          await service.updateTask('u1', 't1', 'COMPLETED');

          expect(mockPrisma.userLessonProgress.upsert).toHaveBeenCalledWith(expect.objectContaining({
              create: expect.objectContaining({ lessonId: 'l1' })
          }));
      });

      it('should throw if task not found or belongs to another user', async () => {
          mockPrisma.learningRoadmapTask.findUnique.mockResolvedValue(null);
          await expect(service.updateTask('u1', 't1', 'COMPLETED')).rejects.toThrow(NotFoundException);
      });
  });

  describe('replanForUser', () => {
      it('should delete pending tasks and increment version', async () => {
           // Mock resolvePrimaryEnrollment
           mockPrisma.enrollment.findMany.mockResolvedValue([mockEnrollment]);
           mockPrisma.userLessonProgress.count.mockResolvedValue(0);
           mockPrisma.lesson.count.mockResolvedValue(10);

           mockPrisma.learningRoadmap.findFirst.mockResolvedValue({ id: 'r1', version: 1, currentWeek: 1 });
           mockPrisma.learningRoadmap.findUnique.mockResolvedValue({ id: 'r1', version: 2 });
           mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
           mockPrisma.learningRoadmapTask.findMany.mockResolvedValue([]);

           await service.replanForUser('u1');

           expect(mockPrisma.learningRoadmapTask.deleteMany).toHaveBeenCalled();
           expect(mockPrisma.learningRoadmap.update).toHaveBeenCalledWith(expect.objectContaining({
               data: expect.objectContaining({ version: 2 })
           }));
      });
  });
});
