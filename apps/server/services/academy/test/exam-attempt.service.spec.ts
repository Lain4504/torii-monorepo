import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamAttemptService } from '../src/modules/assessment/exam-attempt/exam-attempt.service';
import { ExamService } from '../src/modules/assessment/exam/exam.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AcademyAttemptStatus, AcademyExamStatus } from '@workspace/schemas';

describe('ExamAttemptService', () => {
  let service: ExamAttemptService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      academyExam: {
        findUnique: jest.fn(),
      },
      academyExamAttempt: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      academyExamAttemptAnswer: {
        createMany: jest.fn(),
      },
      enrollment: {
        findUnique: jest.fn(),
      },
      liveClass: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamAttemptService,
        { provide: ExamService, useValue: {} },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ExamAttemptService>(ExamAttemptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startAttempt', () => {
    const startDto = { examId: 'e1', userId: 'u1', enrollmentId: 'enr-1' };

    it('should throw if exam missing or not published', async () => {
      mockPrisma.academyExam.findUnique.mockResolvedValue({ id: 'e1', status: 'DRAFT' });
      await expect(service.startAttempt(startDto)).rejects.toThrow(NotFoundException);
    });

    it('should return existing if active attempt found', async () => {
      const activeAttempt = { id: 'att-1', status: 'IN_PROGRESS' };
      mockPrisma.academyExam.findUnique.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
      mockPrisma.academyExamAttempt.findFirst.mockResolvedValue(activeAttempt);

      const result = await service.startAttempt(startDto);
      expect(result.id).toBe('att-1');
    });

    it('should throw if enrollment belongs to another user', async () => {
      mockPrisma.academyExam.findUnique.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
      mockPrisma.academyExamAttempt.findFirst.mockResolvedValue(null);
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'enr-1', userId: 'other' });

      await expect(service.startAttempt(startDto)).rejects.toThrow(BadRequestException);
    });

    it('should create attempt for LIVE enrollment binding to classId', async () => {
      mockPrisma.academyExam.findUnique.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
      mockPrisma.academyExamAttempt.findFirst.mockResolvedValue(null);
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'enr-1', userId: 'u1', liveClassId: 'lc-1' });
      mockPrisma.liveClass.findUnique.mockResolvedValue({ id: 'lc-1' });
      mockPrisma.academyExamAttempt.create.mockResolvedValue({ id: 'new-att' });

      const result = await service.startAttempt(startDto);
      
      expect(mockPrisma.academyExamAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ classId: 'lc-1' }),
        include: { exam: true },
      });
      expect(result.id).toBe('new-att');
    });
  });

  describe('submitAttempt', () => {
    it('should judge SINGLE_CHOICE correctly', async () => {
      const mockAttempt = {
        id: 'att-1',
        status: 'IN_PROGRESS',
        draftAnswers: { 'q1': 'opt-correct' },
        exam: {
          settings: { passThreshold: 50 },
          sections: [
            {
              questions: [
                {
                  id: 'eq1',
                  points: 10,
                  question: {
                    id: 'q1',
                    questionType: 'SINGLE_CHOICE',
                    options: [
                      { id: 'opt-correct', optionKey: 'A', isCorrect: true },
                      { id: 'opt-wrong', optionKey: 'B', isCorrect: false },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };

      mockPrisma.academyExamAttempt.findUnique.mockResolvedValue(mockAttempt);
      mockPrisma.academyExamAttempt.update.mockImplementation((args) => Promise.resolve({ ...args.data, id: 'att-1' }));

      const result = await service.submitAttempt('att-1');

      expect(result.score).toBe(10);
      expect(result.isPassed).toBe(true);
      expect(mockPrisma.academyExamAttemptAnswer.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ isCorrect: true, scoreAwarded: 10 })],
      });
    });

    it('should judge MULTIPLE_CHOICE correctly (exact match)', async () => {
        const mockAttempt = {
          id: 'att-1',
          status: 'IN_PROGRESS',
          draftAnswers: { 'q1': ['A', 'C'] },
          exam: {
            settings: { passThreshold: 50 },
            sections: [
              {
                questions: [
                  {
                    id: 'eq1',
                    points: 10,
                    question: {
                      id: 'q1',
                      questionType: 'MULTIPLE_CHOICE',
                      correctAnswer: ['A', 'C'],
                      options: [
                        { id: 'o1', optionKey: 'A', isCorrect: true },
                        { id: 'o2', optionKey: 'B', isCorrect: false },
                        { id: 'o3', optionKey: 'C', isCorrect: true },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        };
  
        mockPrisma.academyExamAttempt.findUnique.mockResolvedValue(mockAttempt);
        mockPrisma.academyExamAttempt.update.mockImplementation((args) => Promise.resolve({ ...args.data, id: 'att-1' }));
  
        const result = await service.submitAttempt('att-1');
  
        expect(result.score).toBe(10);
        expect(result.isPassed).toBe(true);
      });

    it('should mark as FAILED if below percentage threshold', async () => {
        const mockAttempt = {
          id: 'att-1',
          status: 'IN_PROGRESS',
          draftAnswers: { 'q1': 'wrong' },
          exam: {
            settings: { passThreshold: 80 },
            sections: [{
              questions: [{
                id: 'eq1', points: 10,
                question: { id: 'q1', questionType: 'SINGLE_CHOICE', options: [{ id: 'opt-correct', isCorrect: true }] }
              }]
            }]
          }
        };
        mockPrisma.academyExamAttempt.findUnique.mockResolvedValue(mockAttempt);
        mockPrisma.academyExamAttempt.update.mockImplementation((args) => Promise.resolve({ ...args.data, id: 'att-1' }));

        const result = await service.submitAttempt('att-1');
        expect(result.isPassed).toBe(false);
        expect(result.percentage).toBe(0);
    });
  });

  describe('getAttemptDetail', () => {
    it('should map detailed answers correctly', async () => {
      mockPrisma.academyExamAttempt.findUnique.mockResolvedValue({
        id: 'att-1',
        startedAt: new Date(Date.now() - 1000 * 60),
        submittedAt: new Date(),
        exam: { title: 'Math Test' },
        answers: [
          {
            id: 'ans-1',
            isCorrect: true,
            scoreAwarded: 10,
            selectedOptionId: 'o1',
            answerPayload: 'A',
            question: {
              stem: '1+1=?',
              explanation: 'Math says 2',
              correctAnswer: 'A',
              options: [
                { id: 'o1', optionKey: 'A', content: '2', isCorrect: true },
              ],
            },
          },
        ],
      });

      const result = await service.getAttemptDetail('att-1');
      expect(result.details[0].questionText).toBe('1+1=?');
      expect(result.details[0].userAnswer).toBe('A');
      expect(result.details[0].isCorrect).toBe(true);
      expect(result.timeTakenSeconds).toBeGreaterThanOrEqual(60);
    });
  });

  describe('findAll', () => {
      it('should return latest only if flag provided', async () => {
          mockPrisma.academyExamAttempt.findFirst.mockResolvedValue({ id: 'latest' });
          const result = await service.findAll({ latestOnly: true });
          expect(result).toHaveLength(1);
          expect(result[0].id).toBe('latest');
      });
  });
});
