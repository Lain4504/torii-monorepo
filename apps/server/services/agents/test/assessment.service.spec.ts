import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentService } from '../src/modules/assessment/assessment.service';
import { FastMcpService } from '../src/fastmcp/fastmcp.service';
import { PrismaService } from '@server/shared';

describe('AssessmentService', () => {
  let service: AssessmentService;
  let fastMcpService: jest.Mocked<FastMcpService>;

  const mockRequester = { sub: 'user-001' };

  const mockFastMcpService = {
    addTool: jest.fn(),
    callTool: jest.fn(),
    callGemini: jest.fn(),
    callGeminiWithSchema: jest.fn(),
    getUserContext: jest.fn(),
    loadPromptTemplate: jest.fn(),
    cleanJsonResponse: jest.fn(),
    loadResource: jest.fn(),
  };

  const mockPrismaService = {
    question: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentService,
        {
          provide: FastMcpService,
          useValue: mockFastMcpService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AssessmentService>(AssessmentService);
    fastMcpService = module.get(FastMcpService);

    // Simulate onModuleInit so tools register before tests
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register all assessment tools on module init', () => {
    // 4 tools: generate_test, evaluate_test, placement_test, evaluate_placement
    expect(mockFastMcpService.addTool).toHaveBeenCalledTimes(4);
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'assessment_generate_test',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'assessment_analyze_results',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'assessment_placement_test',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'assessment_recommend_courses',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
  });

  describe('generateJlptTest', () => {
    it('should call callTool with assessment_generate_test and default questionCount 10', async () => {
      const mockResult = {
        testId: 'test-123',
        level: 'N4',
        section: 'vocabulary',
        questions: [],
      };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.generateJlptTest(
        mockRequester as any,
        'N4',
        'vocabulary',
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'assessment_generate_test',
        {
          userId: 'user-001',
          level: 'N4',
          section: 'vocabulary',
          questionCount: 10,
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass custom questionCount', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.generateJlptTest(mockRequester as any, 'N3', 'grammar', 20);

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'assessment_generate_test',
        {
          userId: 'user-001',
          level: 'N3',
          section: 'grammar',
          questionCount: 20,
        },
      );
    });

    it('should support "full" section', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.generateJlptTest(mockRequester as any, 'N2', 'full');

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'assessment_generate_test',
        {
          userId: 'user-001',
          level: 'N2',
          section: 'full',
          questionCount: 10,
        },
      );
    });
  });

  /*
  describe('evaluateTest', () => {
    const sampleAnswers = [
      { questionId: 'q1', userAnswer: 'A', correctAnswer: 'A' },
      { questionId: 'q2', userAnswer: 'B', correctAnswer: 'C' },
      { questionId: 'q3', userAnswer: 'C', correctAnswer: 'C' },
    ];

    it('should call callTool with assessment_evaluate_test', async () => {
      const mockResult = {
        testId: 'test-001',
        score: 2,
        maxScore: 3,
        percentage: 67,
        feedback: 'Good effort!',
        details: [],
      };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.evaluateTest(
        mockRequester as any,
        'test-001',
        sampleAnswers,
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'assessment_evaluate_test',
        {
          userId: 'user-001',
          testId: 'test-001',
          answers: sampleAnswers,
        },
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('generatePlacementTest', () => {
    it('should call callTool with assessment_placement_test and default count 15', async () => {
      const mockResult = {
        testId: 'placement-001',
        questions: [],
        estimatedTimeMinutes: 23,
      };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.generatePlacementTest(mockRequester as any);

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'assessment_placement_test',
        {
          userId: 'user-001',
          questionCount: 15,
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass custom questionCount', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.generatePlacementTest(mockRequester as any, 25);

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'assessment_placement_test',
        {
          userId: 'user-001',
          questionCount: 25,
        },
      );
    });
  });

  describe('evaluatePlacementTest', () => {
    const sampleUserAnswers = [
      { questionId: 'q1', level: 'N5', userAnswer: 'A', correctAnswer: 'A' },
      { questionId: 'q2', level: 'N5', userAnswer: 'B', correctAnswer: 'B' },
      { questionId: 'q3', level: 'N4', userAnswer: 'A', correctAnswer: 'C' },
      { questionId: 'q4', level: 'N3', userAnswer: 'D', correctAnswer: 'D' },
    ];

    it('should call callTool with assessment_evaluate_placement', async () => {
      const mockResult = {
        userId: 'user-001',
        assessedLevel: 'N4',
        targetLevel: 'N3',
        scoreBreakdown: { N5: '100%', N4: '0%', N3: '100%' },
        studyPathRecommendation: {},
      };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.evaluatePlacementTest(
        mockRequester as any,
        'placement-001',
        sampleUserAnswers,
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'assessment_evaluate_placement',
        {
          userId: 'user-001',
          testId: 'placement-001',
          userAnswers: sampleUserAnswers,
        },
      );
      expect(result).toEqual(mockResult);
    });
  });
  */
});
