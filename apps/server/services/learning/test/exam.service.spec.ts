import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from '@server/learning/modules/exam/exam.service';
import { EXAM_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-exam.repository';
import { PrismaService } from '@server/shared';
import { getMapperToken } from '@automapper/nestjs';
import { of } from 'rxjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ExamStatus,
  ExamSessionStatus,
  UserRole,
  ExamType,
  ExamSectionType,
} from '@workspace/schemas';

describe('ExamService', () => {
  let service: ExamService;
  let examRepository: any;
  let prisma: any;
  let natsClient: any;
  let mapper: any;

  const mockQuiz = {
    id: 'exam-1',
    title: 'JLPT N5 Practice',
    status: ExamStatus.PUBLISHED,
    totalQuestions: 10,
    maxAttempts: 3,
    sections: [
      { type: 'READING', questionCount: 5, questionIds: ['q1', 'q2'] },
    ],
    totalTime: 60,
  };

  const mockAttempt = {
    id: 'session-1',
    quizId: 'exam-1',
    userId: 'user-1',
    status: ExamSessionStatus.IN_PROGRESS,
    startedAt: new Date(),
    timeRemaining: 3600,
    answers: {},
    flaggedQuestions: [],
    currentQuestion: 1,
  };

  const mockRequester = {
    sub: 'staff-1',
    role: UserRole.STAFF,
    permissions: ['exam.manage'],
  };

  const mockExamRepository = {
    count: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
    findAttempts: jest.fn(),
    countAttempts: jest.fn(),
    createAttempt: jest.fn(),
    updateAttempt: jest.fn(),
    findAttemptById: jest.fn(),
    findQuestionsByIds: jest.fn(),
    findQuizQuestions: jest.fn(),
    incrementQuestionUsageCount: jest.fn(),
    createAttemptDetails: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrismaService = {
    lesson: {
      findUnique: jest.fn(),
    },
  };

  const mockNatsClient = {
    emit: jest.fn(),
  };

  const mockMapper = {
    map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: EXAM_REPOSITORY_TOKEN,
          useValue: mockExamRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'NATS_SERVICE',
          useValue: mockNatsClient,
        },
        {
          provide: getMapperToken(),
          useValue: mockMapper,
        },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    examRepository = module.get(EXAM_REPOSITORY_TOKEN);
    prisma = module.get(PrismaService);
    natsClient = module.get('NATS_SERVICE');
    mapper = module.get(getMapperToken());

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllWithStatus', () => {
    it('should return exams with session status', async () => {
      mockExamRepository.count.mockResolvedValue(1);
      mockExamRepository.findMany.mockResolvedValue([mockQuiz]);
      mockExamRepository.findAttempts.mockResolvedValue([mockAttempt]);

      const result = await service.findAllWithStatus(
        { page: 1, limit: 10 },
        'user-1',
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].sessionStatus).toBe(ExamSessionStatus.IN_PROGRESS);
    });
  });

  describe('startExam', () => {
    it('should start a new exam session', async () => {
      mockExamRepository.findById.mockResolvedValue(mockQuiz);
      mockExamRepository.findAttempts.mockResolvedValue([]); // No in-progress
      mockExamRepository.countAttempts.mockResolvedValue(0);
      mockExamRepository.findQuestionsByIds.mockResolvedValue([
        { id: 'q1', questionText: 'Q1' },
      ]);
      mockExamRepository.createAttempt.mockResolvedValue(mockAttempt);

      const result = await service.startExam('exam-1', 'user-1');

      expect(result.sessionId).toBe(mockAttempt.id);
      expect(examRepository.createAttempt).toHaveBeenCalled();
    });

    it('should throw NotFoundException if exam not found', async () => {
      mockExamRepository.findById.mockResolvedValue(null);
      await expect(service.startExam('exam-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if max attempts reached', async () => {
      mockExamRepository.findById.mockResolvedValue(mockQuiz);
      mockExamRepository.findAttempts.mockResolvedValue([]);
      mockExamRepository.countAttempts.mockResolvedValue(3); // Max is 3

      await expect(service.startExam('exam-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('saveAnswers', () => {
    it('should save answers successfully', async () => {
      mockExamRepository.findAttemptById.mockResolvedValue(mockAttempt);
      mockExamRepository.updateAttempt.mockResolvedValue({
        ...mockAttempt,
        answers: { q1: 'A' },
      });

      const result = await service.saveAnswers('session-1', 'user-1', {
        answers: { q1: 'A' },
      });

      expect(result.answers).toEqual({ q1: 'A' });
      expect(examRepository.updateAttempt).toHaveBeenCalled();
    });
  });

  describe('submitSession', () => {
    it('should submit and grade session', async () => {
      const attemptWithQuiz = { ...mockAttempt, quiz: mockQuiz };
      mockExamRepository.findAttemptById.mockResolvedValue(attemptWithQuiz);
      mockExamRepository.findQuestionsByIds.mockResolvedValue([
        { id: 'q1', correctAnswer: 'A', questionType: 'multiple_choice' },
      ]);
      mockExamRepository.findQuizQuestions.mockResolvedValue([
        { questionId: 'q1', points: 1 },
      ]);
      mockExamRepository.updateAttempt.mockResolvedValue({
        ...mockAttempt,
        status: ExamSessionStatus.SUBMITTED,
        score: 0,
      });

      const result = await service.submitSession('session-1', 'user-1');

      expect(result.status).toBe(ExamSessionStatus.SUBMITTED);
      expect(examRepository.updateAttempt).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({ status: ExamSessionStatus.SUBMITTED }),
      );
    });
  });

  describe('create', () => {
    const createDto: any = {
      title: 'New Exam',
      jlptLevel: 'N5',
      examType: ExamType.PRACTICE,
      totalTime: 60,
      sections: [
        {
          type: ExamSectionType.READING,
          questionCount: 1,
          timeLimit: 20,
          poolId: '00000000-0000-0000-0000-000000000000',
        },
      ],
    };

    it('should create exam successfully', async () => {
      mockExamRepository.create.mockResolvedValue({
        ...mockQuiz,
        title: 'New Exam',
      });

      const result = await service.create(mockRequester as any, createDto);

      expect(result.title).toBe('New Exam');
      expect(examRepository.create).toHaveBeenCalled();
    });
  });
});
