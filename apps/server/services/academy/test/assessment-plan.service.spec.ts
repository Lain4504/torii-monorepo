import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentPlanService } from '../src/modules/assessment/assessment-plan/assessment-plan.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AssessmentPlanService', () => {
  let service: AssessmentPlanService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      enrollment: { 
        findUnique: jest.fn().mockResolvedValue({ 
          id: 'e1', userId: 'u1', 
          vodPackage: { courseProfileId: 'cp1' }, 
          liveClass: null 
        }) 
      },
      academyCourseProfileAssessment: { findMany: jest.fn().mockResolvedValue([]) },
      academyExamAttempt: { findMany: jest.fn().mockResolvedValue([]) },
      lesson: { findUnique: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentPlanService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AssessmentPlanService>(AssessmentPlanService);
  });

  describe('getLearnerAssessmentStatus Exhaustive', () => {
    it('should return AVAILABLE status correctly', async () => {
      prisma.academyCourseProfileAssessment.findMany.mockResolvedValueOnce([
        { id: 'p1', examId: 'ex1', assessmentKind: 'EXAM', exam: { title: 'T1' } }
      ]);
      prisma.academyExamAttempt.findMany.mockResolvedValueOnce([]);
      
      const result = await service.getLearnerAssessmentStatus({ enrollmentId: 'e1', userId: 'u1' });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('AVAILABLE');
    });

    it('should throw if enrollment not found', async () => {
      prisma.enrollment.findUnique.mockResolvedValueOnce(null);
      await expect(service.getLearnerAssessmentStatus({ enrollmentId: 'e_none', userId: 'u1' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('canAccessLesson', () => {
    it('should allow if no milestones exist', async () => {
      prisma.lesson.findUnique.mockResolvedValueOnce({ 
        id: 'l1', orderIndex: 1, module: { courseProfileId: 'cp1', orderIndex: 1 } 
      });
      prisma.academyCourseProfileAssessment.findMany.mockResolvedValueOnce([]);
      
      const result = await service.canAccessLesson({ userId: 'u1', lessonId: 'l1', enrollmentId: 'e1' });
      expect(result.allowed).toBe(true);
    });
  });
});
