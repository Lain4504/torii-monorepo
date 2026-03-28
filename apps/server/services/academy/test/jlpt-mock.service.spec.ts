import { Test, TestingModule } from '@nestjs/testing';
import { JlptMockService } from '../src/modules/jlpt-mock/jlpt-mock.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('JlptMockService', () => {
  let service: JlptMockService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      jlptLevel: { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn() },
      jlptSection: { findMany: jest.fn(), upsert: jest.fn() },
      jlptScoringProfile: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
      jlptMockExamTemplate: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
      jlptMockExamTemplateQuestion: { 
        count: jest.fn(), deleteMany: jest.fn(), upsert: jest.fn(),
        groupBy: jest.fn().mockResolvedValue([]),
        aggregate: jest.fn().mockResolvedValue({ _max: { orderIndex: 0 } }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      jlptMockAttempt: { create: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() },
      jlptMockAttemptSection: { createMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
      jlptMockAnswer: { upsert: jest.fn(), findMany: jest.fn() },
      jlptQuestionBankQuestion: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn() },
      jlptQuestionBankOption: { findMany: jest.fn() },
      $transaction: jest.fn(async (cb) => {
        if (typeof cb === 'function') return cb(prisma);
        return cb;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JlptMockService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<JlptMockService>(JlptMockService);
  });

  describe('startAttempt exhaustive', () => {
    it('should throw if attempt already in progress', async () => {
      prisma.jlptMockExamTemplate.findUnique.mockResolvedValue({ 
        id: 't1', status: 'PUBLISHED', sections: [{ id: 's1' }] 
      });
      prisma.jlptMockExamTemplateQuestion.count.mockResolvedValue(1);
      prisma.jlptMockExamTemplateQuestion.groupBy.mockResolvedValue([{ sectionId: 's1', _count: { sectionId: 1 } }]);
      prisma.jlptMockAttempt.count.mockResolvedValue(1);
      // Service checks for maxAttemptsPerUser if it exists
      prisma.jlptMockExamTemplate.findUnique.mockResolvedValue({ 
        id: 't1', status: 'PUBLISHED', sections: [{ id: 's1' }], maxAttemptsPerUser: 1, level: { code: 'N5' }
      });
      await expect(service.startAttempt('t1', 'u1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('saveAnswers and validation', () => {
    it('should save answers successfully', async () => {
      prisma.jlptMockAttempt.findUnique.mockResolvedValueOnce({ id: 'a1', userId: 'u1', status: 'IN_PROGRESS' });
      prisma.jlptMockExamTemplateQuestion.findMany.mockResolvedValueOnce([{ id: 'tq1', questionId: 'q1' }]);
      
      await service.saveAnswers('a1', [{ templateQuestionId: 'tq1', selectedOptionId: 'o1' }], 'u1');
      expect(prisma.jlptMockAnswer.upsert).toHaveBeenCalled();
    });

    it('should throw if question does not belong to template', async () => {
      prisma.jlptMockAttempt.findUnique.mockResolvedValueOnce({ id: 'a1', userId: 'u1', status: 'IN_PROGRESS' });
      prisma.jlptMockExamTemplateQuestion.findMany.mockResolvedValueOnce([]); // No match
      
      await expect(service.saveAnswers('a1', [{ templateQuestionId: 'tq_wrong', selectedOptionId: 'o1' }], 'u1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findAttemptHistory', () => {
    it('should return recent attempts', async () => {
      prisma.jlptMockAttempt.findMany.mockResolvedValueOnce([{ id: 'a1' }]);
      const result = await service.findAttemptHistory('u1');
      expect(result).toHaveLength(1);
    });
  });

  describe('scoring logic deep dive', () => {
    it('should calculate pass correctly for N3', () => {
      const profile = { minLanguageScaled: 19, minReadingScaled: 19, minListeningScaled: 19, minTotalScaled: 95 };
      const result = (service as any)._isPass('N3', profile, 20, 20, 55, 95);
      expect(result).toBe(true);
    });

    it('should fail if any section below min (N3)', () => {
      const profile = { minLanguageScaled: 19, minReadingScaled: 19, minListeningScaled: 19, minTotalScaled: 95 };
      const result = (service as any)._isPass('N3', profile, 18, 40, 40, 98);
      expect(result).toBe(false);
    });
  });
});
