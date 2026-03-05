import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from '@server/learning/modules/question/question.service';
import { QUESTION_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-question.repository';
import { getMapperToken } from '@automapper/nestjs';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { QuestionType, QuestionStatus, UserRole } from '@workspace/schemas';

describe('QuestionService', () => {
  let service: QuestionService;
  let questionRepository: any;
  let mapper: any;

  const mockQuestion = {
    id: 'q-1',
    questionText: 'Test Question',
    questionType: QuestionType.MULTIPLE_CHOICE,
    options: { a: 'Option A', b: 'Option B' },
    correctAnswer: 'a',
    usageCount: 0,
    status: QuestionStatus.ACTIVE,
  };

  const mockRequester = {
    sub: 'staff-1',
    role: UserRole.STAFF,
    permissions: ['exam.manage'],
  };

  const mockQuestionRepository = {
    findById: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findByCategory: jest.fn(),
    findByJlptLevel: jest.fn(),
    findByStatus: jest.fn(),
    findByPool: jest.fn(),
  };

  const mockMapper = {
    map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: QUESTION_REPOSITORY_TOKEN,
          useValue: mockQuestionRepository,
        },
        {
          provide: getMapperToken(),
          useValue: mockMapper,
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
    questionRepository = module.get(QUESTION_REPOSITORY_TOKEN);
    mapper = module.get(getMapperToken());

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated questions', async () => {
      mockQuestionRepository.count.mockResolvedValue(1);
      mockQuestionRepository.findMany.mockResolvedValue([mockQuestion]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('create', () => {
    it('should create a question successfully', async () => {
      mockQuestionRepository.create.mockResolvedValue(mockQuestion);

      const result = await service.create(mockRequester as any, {
        questionText: 'Q',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: { a: 'A', b: 'B' },
        correctAnswer: 'a',
      });

      expect(result.id).toBe(mockQuestion.id);
      expect(questionRepository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if options missing for multiple choice', async () => {
      await expect(
        service.create(mockRequester as any, {
          questionText: 'Q',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: {},
          correctAnswer: 'a',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if missing permission', async () => {
      const requester = { sub: 'u-1', permissions: [] };
      await expect(service.create(requester as any, {} as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('should delete question if not in use', async () => {
      mockQuestionRepository.findById.mockResolvedValue(mockQuestion);
      await service.delete(mockRequester as any, 'q-1');
      expect(questionRepository.delete).toHaveBeenCalledWith('q-1');
    });

    it('should throw BadRequestException if question in use', async () => {
      mockQuestionRepository.findById.mockResolvedValue({
        ...mockQuestion,
        usageCount: 1,
      });
      await expect(service.delete(mockRequester as any, 'q-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update question successfully', async () => {
      mockQuestionRepository.findById.mockResolvedValue(mockQuestion);
      mockQuestionRepository.update.mockResolvedValue({
        ...mockQuestion,
        questionText: 'New',
      });

      const result = await service.update(mockRequester as any, 'q-1', {
        questionText: 'New',
      });

      expect(result.questionText).toBe('New');
      expect(questionRepository.update).toHaveBeenCalled();
    });
  });
});
