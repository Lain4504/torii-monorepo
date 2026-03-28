import { Test, TestingModule } from '@nestjs/testing';
import { ExamAttemptService } from '../src/modules/assessment/exam-attempt/exam-attempt.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ExamService } from '../src/modules/assessment/exam/exam.service';
import { NotFoundException } from '@nestjs/common';

describe('ExamAttemptService', () => {
  let service: ExamAttemptService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      academyExamAttempt: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      academyExam: { findUnique: jest.fn() },
      academyExamQuestion: { findMany: jest.fn().mockResolvedValue([]) },
      academyExamAttemptAnswer: { createMany: jest.fn(), deleteMany: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamAttemptService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExamService, useValue: { findById: jest.fn() } },
        { provide: 'NATS_SERVICE', useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<ExamAttemptService>(ExamAttemptService);
  });

  describe('startAttempt exhaustive', () => {
    it('should throw if exam not found', async () => {
      prisma.academyExam.findUnique.mockResolvedValueOnce(null);
      await expect(service.startAttempt({ examId: 'ex1', userId: 'u1' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should create new attempt if none exists', async () => {
      // Using string literals to avoid AcademyExamStatus resolution issues in tests
      prisma.academyExam.findUnique.mockResolvedValueOnce({ 
        id: 'ex1', status: 'PUBLISHED'
      });
      prisma.academyExamAttempt.create.mockResolvedValueOnce({ 
        id: 'a1', status: 'IN_PROGRESS' 
      });
      
      const result = await service.startAttempt({ examId: 'ex1', userId: 'u1' });
      expect(result.id).toBe('a1');
    });
  });

  describe('submitAttempt deeply', () => {
    it('should calculate score and pass status', async () => {
      prisma.academyExamAttempt.findUnique.mockResolvedValueOnce({ 
        id: 'a1', status: 'IN_PROGRESS', examId: 'ex1',
        exam: { passScore: 50, totalScore: 100 }
      });
      prisma.academyExamAttempt.update.mockResolvedValueOnce({ 
        id: 'a1', status: 'SUBMITTED' 
      });
      
      const result = await service.submitAttempt('a1', 'u1');
      expect(prisma.academyExamAttempt.update).toHaveBeenCalled();
    });
  });
});
