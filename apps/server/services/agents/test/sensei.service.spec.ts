import { Test, TestingModule } from '@nestjs/testing';
import { SenseiService } from '../src/modules/sensei/sensei.service';
import { FastMcpService } from '../src/fastmcp/fastmcp.service';
import { PrismaService } from '@server/shared';

describe('SenseiService', () => {
  let service: SenseiService;
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
    send: jest.fn(),
    emit: jest.fn(),
  };

  const mockPrismaService = {
    course: { findMany: jest.fn() },
    lesson: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SenseiService,
        {
          provide: FastMcpService,
          useValue: mockFastMcpService,
        },
        {
          provide: 'NATS_SERVICE',
          useValue: mockNatsClient,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SenseiService>(SenseiService);
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

  it('should register all tools on module init', () => {
    // 8 tools: grammar, translate, flashcard, drill, simulate, recommend, chat, roleplay
    expect(mockFastMcpService.addTool).toHaveBeenCalledTimes(8);
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'sensei_check_grammar',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'sensei_translate',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'sensei_create_flashcard',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'sensei_generate_drill',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'sensei_simulate_conversation',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'sensei_recommend_resources',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'sensei_chat',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
    expect(mockFastMcpService.addTool).toHaveBeenCalledWith(
      'sensei_roleplay',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
  });

  describe('checkGrammar', () => {
    it('should call callTool with sensei_check_grammar', async () => {
      const mockResult = { corrected: '私は学生です。', errors: [] };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.checkGrammar(
        mockRequester as any,
        '私は学生です',
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'sensei_check_grammar',
        {
          userId: 'user-001',
          text: '私は学生です',
        },
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('translate', () => {
    it('should call callTool with sensei_translate', async () => {
      const mockResult = { translation: 'Hello', explanation: '' };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.translate(
        mockRequester as any,
        'こんにちは',
        'Japanese',
        'English',
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith('sensei_translate', {
        userId: 'user-001',
        text: 'こんにちは',
        sourceLanguage: 'Japanese',
        targetLanguage: 'English',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('createFlashcard', () => {
    it('should call callTool with sensei_create_flashcard and default level N4', async () => {
      const mockResult = { flashcard: { front: '猫', back: 'cat' } };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.createFlashcard(
        mockRequester as any,
        'animals',
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'sensei_create_flashcard',
        {
          userId: 'user-001',
          topic: 'animals',
          level: 'N4',
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should call callTool with specified level N2', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.createFlashcard(mockRequester as any, 'business', 'N2');

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'sensei_create_flashcard',
        {
          userId: 'user-001',
          topic: 'business',
          level: 'N2',
        },
      );
    });
  });

  describe('generatePracticeDrill', () => {
    it('should call callTool with sensei_generate_drill and default level/count', async () => {
      const mockResult = { questions: [] };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.generatePracticeDrill(
        mockRequester as any,
        'grammar',
        'verb conjugation',
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'sensei_generate_drill',
        {
          userId: 'user-001',
          type: 'grammar',
          topic: 'verb conjugation',
          level: 'N4',
          count: 5,
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass custom level and count when provided', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.generatePracticeDrill(
        mockRequester as any,
        'kanji',
        'nature',
        'N3',
        10,
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'sensei_generate_drill',
        {
          userId: 'user-001',
          type: 'kanji',
          topic: 'nature',
          level: 'N3',
          count: 10,
        },
      );
    });
  });

  describe('simulateConversation', () => {
    it('should call callTool with sensei_simulate_conversation and defaults', async () => {
      const mockResult = { dialogue: [] };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.simulateConversation(
        mockRequester as any,
        'restaurant',
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'sensei_simulate_conversation',
        {
          userId: 'user-001',
          scenario: 'restaurant',
          level: 'N4',
          turns: 4,
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass custom level and turns', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.simulateConversation(
        mockRequester as any,
        'office',
        'N2',
        6,
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'sensei_simulate_conversation',
        {
          userId: 'user-001',
          scenario: 'office',
          level: 'N2',
          turns: 6,
        },
      );
    });
  });

  describe('recommendResources', () => {
    it('should call callTool with sensei_recommend_resources and defaults', async () => {
      const mockResult = { resources: [] };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.recommendResources(
        mockRequester as any,
        'grammar',
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'sensei_recommend_resources',
        {
          userId: 'user-001',
          topic: 'grammar',
          resourceType: 'all',
          level: undefined,
        },
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass specific resourceType and level', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.recommendResources(
        mockRequester as any,
        'reading',
        'book',
        'N3',
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith(
        'sensei_recommend_resources',
        {
          userId: 'user-001',
          topic: 'reading',
          resourceType: 'book',
          level: 'N3',
        },
      );
    });
  });

  describe('chat', () => {
    it('should call callTool with sensei_chat and empty history by default', async () => {
      const mockResult = { reply: 'こんにちは！' };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.chat(mockRequester as any, 'Hello');

      expect(fastMcpService.callTool).toHaveBeenCalledWith('sensei_chat', {
        userId: 'user-001',
        message: 'Hello',
        history: [],
      });
      expect(result).toEqual(mockResult);
    });

    it('should pass existing chat history', async () => {
      const history = [{ role: 'user', content: 'Hi' }];
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.chat(
        mockRequester as any,
        'Tell me about N3 grammar',
        history,
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith('sensei_chat', {
        userId: 'user-001',
        message: 'Tell me about N3 grammar',
        history,
      });
    });
  });

  describe('roleplay', () => {
    it('should call callTool with sensei_roleplay and defaults', async () => {
      const mockResult = { response: 'いらっしゃいませ！' };
      mockFastMcpService.callTool.mockResolvedValue(mockResult);

      const result = await service.roleplay(
        mockRequester as any,
        'restaurant ordering',
        'すみません、メニューをください',
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith('sensei_roleplay', {
        userId: 'user-001',
        topic: 'restaurant ordering',
        message: 'すみません、メニューをください',
        history: [],
        isFinal: false,
      });
      expect(result).toEqual(mockResult);
    });

    it('should pass isFinal flag when roleplay ends', async () => {
      mockFastMcpService.callTool.mockResolvedValue({});

      await service.roleplay(
        mockRequester as any,
        'shopping',
        'ありがとうございます',
        [{ role: 'user', content: 'こんにちは' }],
        true,
      );

      expect(fastMcpService.callTool).toHaveBeenCalledWith('sensei_roleplay', {
        userId: 'user-001',
        topic: 'shopping',
        message: 'ありがとうございます',
        history: [{ role: 'user', content: 'こんにちは' }],
        isFinal: true,
      });
    });
  });
});
