import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../src/modules/analytics/analytics.service';
import { FastMcpService } from '../src/fastmcp/fastmcp.service';
import { of } from 'rxjs';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
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

  const mockNatsClient = {
    send: jest.fn().mockReturnValue(of(null)),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: FastMcpService,
          useValue: mockFastMcpService,
        },
        {
          provide: 'NATS_SERVICE',
          useValue: mockNatsClient,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
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

  it('should register all analytics tools on module init', () => {
    // 4 tools: track_progress, suggest_study_path, generate_report, readiness_profile
    expect(mockFastMcpService.addTool).toHaveBeenCalledTimes(4);
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'analytics_track_progress',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'analytics_suggest_study_path',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'analytics_generate_report',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'analytics_get_readiness_profile',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
  });

  describe('trackProgress', () => {
    it('should call callTool with analytics_track_progress and default timeframe "month"', async () => {
      const mockResult = { progress: [] };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.trackProgress(mockRequester as any);

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'analytics_track_progress',
        {
          userId: 'user-001',
          timeframe: 'month',
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass custom timeframe "week"', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.trackProgress(mockRequester as any, 'week');

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'analytics_track_progress',
        {
          userId: 'user-001',
          timeframe: 'week',
        },
      );
    });

    it('should pass timeframe "quarter"', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.trackProgress(mockRequester as any, 'quarter');

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'analytics_track_progress',
        {
          userId: 'user-001',
          timeframe: 'quarter',
        },
      );
    });
  });

  describe('suggestStudyPath', () => {
    it('should call callTool with analytics_suggest_study_path', async () => {
      const mockResult = { studyPath: [] };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.suggestStudyPath(mockRequester as any, 'N3');

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'analytics_suggest_study_path',
        {
          userId: 'user-001',
          targetLevel: 'N3',
          timeframe: undefined,
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass timeframe when provided', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.suggestStudyPath(mockRequester as any, 'N2', '6 months');

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'analytics_suggest_study_path',
        {
          userId: 'user-001',
          targetLevel: 'N2',
          timeframe: '6 months',
        },
      );
    });

    it('should support all JLPT levels', async () => {
      const levels: Array<'N5' | 'N4' | 'N3' | 'N2' | 'N1'> = [
        'N5',
        'N4',
        'N3',
        'N2',
        'N1',
      ];

      for (const level of levels) {
        mockFastMcpService.callTool.mockResolvedValue({});
        await service.suggestStudyPath(mockRequester as any, level);
        expect(fastMcpService.callTool).toHaveBeenCalledWith(
          'analytics_suggest_study_path',
          {
            userId: 'user-001',
            targetLevel: level,
            timeframe: undefined,
          },
        );
      }
    });
  });

  describe('generateReport', () => {
    it('should call callTool with analytics_generate_report and default type/timeframe', async () => {
      const mockResult = { report: {} };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.generateReport(mockRequester as any);

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'analytics_generate_report',
        {
          userId: 'user-001',
          reportType: 'comprehensive',
          timeframe: 'month',
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass custom reportType "progress"', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.generateReport(mockRequester as any, 'progress');

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'analytics_generate_report',
        {
          userId: 'user-001',
          reportType: 'progress',
          timeframe: 'month',
        },
      );
    });

    it('should pass custom reportType "assessment" and timeframe "week"', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.generateReport(mockRequester as any, 'assessment', 'week');

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'analytics_generate_report',
        {
          userId: 'user-001',
          reportType: 'assessment',
          timeframe: 'week',
        },
      );
    });
  });

  describe('getReadinessProfile', () => {
    it('should call callTool with analytics_get_readiness_profile', async () => {
      const mockResult = {
        readinessScore: 75,
        targetLevel: 'N3',
        strengths: ['vocabulary'],
        weaknesses: ['kanji'],
      };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.getReadinessProfile(
        mockRequester as any,
        'N3',
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'analytics_get_readiness_profile',
        {
          userId: 'user-001',
          targetLevel: 'N3',
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should accept N1 as target level', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.getReadinessProfile(mockRequester as any, 'N1');

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'analytics_get_readiness_profile',
        {
          userId: 'user-001',
          targetLevel: 'N1',
        },
      );
    });
  });
});
