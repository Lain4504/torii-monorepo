import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssessmentPlanService } from '../src/modules/assessment/assessment-plan/assessment-plan.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AcademyAssessmentKind } from '@workspace/schemas';

describe('AssessmentPlanService', () => {
  let service: AssessmentPlanService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      academyCourseProfileAssessment: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      liveClass: {
        findUnique: jest.fn(),
      },
      vodPackage: {
        findUnique: jest.fn(),
      },
      enrollment: {
        findFirst: jest.fn(),
      },
      academyExamAttempt: {
        findMany: jest.fn(),
      },
      lesson: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentPlanService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AssessmentPlanService>(AssessmentPlanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlanByCourseProfileId', () => {
    it('should return assessments ordered by index', async () => {
      const mockResult = [{ id: '1', orderIndex: 1 }];
      mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue(mockResult);

      const result = await service.getPlanByCourseProfileId('cp-1');

      expect(result).toBe(mockResult);
      expect(mockPrisma.academyCourseProfileAssessment.findMany).toHaveBeenCalledWith({
        where: { courseProfileId: 'cp-1', isActive: true },
        include: { exam: { select: { title: true, examType: true } } },
        orderBy: { orderIndex: 'asc' },
      });
    });
  });

  describe('updatePlan', () => {
    it('should delete old assessments and create new ones in a transaction', async () => {
      const dto = {
        courseProfileId: 'cp-1',
        items: [
          {
            examId: 'e1',
            assessmentKind: AcademyAssessmentKind.FINAL_EXAM,
            orderIndex: 0,
            isRequired: true,
            isActive: true,
          },
        ],
      } as any;

      await service.updatePlan(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.academyCourseProfileAssessment.deleteMany).toHaveBeenCalledWith({
        where: { courseProfileId: 'cp-1' },
      });
      expect(mockPrisma.academyCourseProfileAssessment.createMany).toHaveBeenCalledWith({
        data: [
          {
            courseProfileId: 'cp-1',
            examId: 'e1',
            assessmentKind: AcademyAssessmentKind.FINAL_EXAM,
            moduleId: null,
            triggerLessonId: null,
            orderIndex: 0,
            isRequired: true,
            isActive: true,
          },
        ],
      });
    });
  });

  describe('getLearnerAssessmentStatus', () => {
    const userId = 'user-1';

    it('should throw if neither classId nor enrollmentId provided', async () => {
      await expect(service.getLearnerAssessmentStatus({ userId })).rejects.toThrow(
        'Either classId or enrollmentId must be provided',
      );
    });

    it('should resolve courseProfileId from LiveClass', async () => {
      const classId = 'class-1';
      mockPrisma.liveClass.findUnique.mockResolvedValue({
        id: classId,
        cohort: { courseProfileId: 'cp-1' },
      });
      mockPrisma.enrollment.findFirst.mockResolvedValue({ id: 'enr-1' });
      mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue([]);

      await service.getLearnerAssessmentStatus({ userId, classId });

      expect(mockPrisma.liveClass.findUnique).toHaveBeenCalled();
    });

    it('should throw NotFound if class/VOD package does not exist', async () => {
      mockPrisma.liveClass.findUnique.mockResolvedValue(null);
      mockPrisma.vodPackage.findUnique.mockResolvedValue(null);

      await expect(
        service.getLearnerAssessmentStatus({ userId, classId: 'missing' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should correctly map exam attempt statuses (PASSED, FAILED, IN_PROGRESS)', async () => {
      const enrollmentId = 'enr-1';
      mockPrisma.enrollment.findFirst.mockResolvedValue({
        id: enrollmentId,
        vodPackage: { courseProfileId: 'cp-1' },
      });
      mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue([
        { id: 'p1', examId: 'e1', assessmentKind: 'FINAL_EXAM', isRequired: true, exam: { title: 'Final' } },
        { id: 'p2', examId: 'e2', assessmentKind: 'MODULE_CHECKPOINT', isRequired: true, exam: { title: 'Mod 1' } },
        { id: 'p3', examId: 'e3', assessmentKind: 'LESSON_CHECKPOINT', isRequired: false, exam: { title: 'Less 1' } },
        { id: 'p4', examId: 'e4', assessmentKind: 'LESSON_CHECKPOINT', isRequired: false, exam: { title: 'Less 2' } },
      ]);

      mockPrisma.academyExamAttempt.findMany.mockResolvedValue([
        { examId: 'e1', status: 'SUBMITTED', isPassed: true, score: 10, percentage: 100 },
        { examId: 'e2', status: 'SUBMITTED', isPassed: false, score: 2, percentage: 20 },
        { examId: 'e3', status: 'IN_PROGRESS' },
      ]);

      const result = await service.getLearnerAssessmentStatus({ userId, enrollmentId });

      expect(result[0].status).toBe('PASSED');
      expect(result[1].status).toBe('FAILED');
      expect(result[2].status).toBe('IN_PROGRESS');
      expect(result[3].status).toBe('AVAILABLE');
      expect(result[0].score).toBe(10);
    });
  });

  describe('canAccessLesson', () => {
    it('should throw NotFound if lesson missing', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue(null);
      await expect(
        service.canAccessLesson({ userId: 'u1', lessonId: 'l1', enrollmentId: 'e1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow access if no milestones exist', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'l1', orderIndex: 1, module: { courseProfileId: 'cp-1' } });
      mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue([]);
      
      const result = await service.canAccessLesson({ userId: 'u1', lessonId: 'l1', enrollmentId: 'e1' });
      expect(result.allowed).toBe(true);
    });

    it('should block access if a preceding milestone is not passed', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({ 
        id: 'l10', 
        orderIndex: 10, 
        moduleId: 'm2',
        module: { courseProfileId: 'cp-1', orderIndex: 2 } 
      });
      
      mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue([
        { 
          id: 'p1', 
          examId: 'e1', 
          assessmentKind: 'MODULE_CHECKPOINT', 
          module: { id: 'm1', orderIndex: 1 } 
        }
      ]);

      // Mock zero passed attempts
      mockPrisma.academyExamAttempt.findMany.mockResolvedValue([]);

      const result = await service.canAccessLesson({ userId: 'u1', lessonId: 'l10', enrollmentId: 'e1' });
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('hoàn thành bài kiểm tra');
    });

    it('should allow access if all preceding milestones are passed', async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({ 
        id: 'l10', 
        orderIndex: 10, 
        moduleId: 'm2',
        module: { courseProfileId: 'cp-1', orderIndex: 2 } 
      });
      
      mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue([
        { 
          id: 'p1', 
          examId: 'e1', 
          assessmentKind: 'MODULE_CHECKPOINT', 
          module: { id: 'm1', orderIndex: 1 } 
        }
      ]);

      mockPrisma.academyExamAttempt.findMany.mockResolvedValue([
        { examId: 'e1', status: 'SUBMITTED', isPassed: true }
      ]);

      const result = await service.canAccessLesson({ userId: 'u1', lessonId: 'l10', enrollmentId: 'e1' });
      
      expect(result.allowed).toBe(true);
    });
    
    it('should allow access if milestone is for current lesson but trigger order is higher', async () => {
        mockPrisma.lesson.findUnique.mockResolvedValue({ 
          id: 'l5', 
          orderIndex: 5, 
          moduleId: 'm1',
          module: { courseProfileId: 'cp-1', orderIndex: 1 } 
        });
        
        mockPrisma.academyCourseProfileAssessment.findMany.mockResolvedValue([
          { 
            id: 'p1', 
            examId: 'e1', 
            assessmentKind: 'LESSON_CHECKPOINT',
            moduleId: 'm1',
            module: { id: 'm1', orderIndex: 1 },
            triggerLesson: { id: 'l7', orderIndex: 7 } // Milestone after current lesson
          }
        ]);
  
        const result = await service.canAccessLesson({ userId: 'u1', lessonId: 'l5', enrollmentId: 'e1' });
        expect(result.allowed).toBe(true);
      });
  });
});
