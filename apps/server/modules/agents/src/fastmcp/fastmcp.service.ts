import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@server/shared';
import axios, { AxiosInstance } from 'axios';

interface ToolContext {
  userId: string;
  enrolledCourses?: string[];
  jlptLevels?: string[];
  aiMetadata?: any[];
}

/**
 * FastMCP Service - HTTP Client for Torii Sensei Brain
 * 
 * Architecture:
 * NestJS Controller → FastMcpService (HTTP Client) → FastMCP Server (port 3333) → Gemini API
 * 
 * This service acts as an HTTP CLIENT that communicates with the standalone FastMCP server.
 * The FastMCP server runs as a separate process and is the ONLY place where Gemini is called.
 */
@Injectable()
export class FastMcpService implements OnModuleInit {
  private readonly logger = new Logger(FastMcpService.name);
  private httpClient: AxiosInstance;
  private fastmcpUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.fastmcpUrl = this.configService.get<string>('FASTMCP_URL') || 'http://localhost:3333';
    this.httpClient = axios.create({
      baseURL: this.fastmcpUrl,
      timeout: 60000, // 60 seconds for AI responses
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async onModuleInit() {
    await this.checkConnection();
  }

  /**
   * Check connection to FastMCP server
   */
  private async checkConnection() {
    try {
      const response = await this.httpClient.get('/health');
      this.logger.log(`✅ Connected to FastMCP Server: ${response.data.service} v${response.data.version}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to connect to FastMCP Server at ${this.fastmcpUrl}`);
      this.logger.error(`Make sure the FastMCP server is running: cd mcp-server && pnpm dev`);
      throw new Error(`FastMCP Server not available: ${error.message}`);
    }
  }

  /**
   * Get user context from database
   */
  private async getUserContext(userId: string): Promise<ToolContext> {
    try {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            select: { id: true, title: true, aiMetadata: true, jlptLevel: true },
          },
        },
      });

      const courseMetadata = enrollments.map(e => e.course.aiMetadata).filter(Boolean);
      const courseTitles = enrollments.map(e => e.course.title);
      const jlptLevels = [...new Set(enrollments.map(e => e.course.jlptLevel).filter(Boolean))];

      return {
        userId,
        enrolledCourses: courseTitles,
        jlptLevels,
        aiMetadata: courseMetadata,
      };
    } catch (error) {
      this.logger.warn(`Failed to fetch user context: ${error.message}`);
      return { userId };
    }
  }

  // ==================== SENSEI AGENT METHODS ====================

  async checkGrammar(userId: string, text: string): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/sensei/check-grammar', { text, userContext });
    return response.data;
  }

  async translate(
    userId: string,
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/sensei/translate', {
      text,
      sourceLanguage,
      targetLanguage,
      userContext,
    });
    return response.data;
  }

  async createFlashcard(
    userId: string,
    topic: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/sensei/create-flashcard', {
      topic,
      difficulty,
      userContext,
    });
    return response.data;
  }

  async generatePracticeDrill(
    userId: string,
    type: 'grammar' | 'vocabulary' | 'kanji' | 'listening' | 'reading',
    topic: string,
    difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4',
    count: number = 5,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/sensei/generate-drill', {
      type,
      topic,
      difficulty,
      count,
      userContext,
    });
    return response.data;
  }

  async simulateConversation(
    userId: string,
    scenario: 'restaurant' | 'shopping' | 'station' | 'office' | 'casual' | 'formal',
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
    turns: number = 4,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/sensei/simulate-conversation', {
      scenario,
      difficulty,
      turns,
      userContext,
    });
    return response.data;
  }

  async recommendResources(
    userId: string,
    topic: string,
    resourceType: 'article' | 'video' | 'book' | 'app' | 'website' | 'all' = 'all',
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/sensei/recommend-resources', {
      topic,
      resourceType,
      userContext,
    });
    return response.data;
  }

  // ==================== ASSESSMENT AGENT METHODS ====================

  async generateJlptTest(
    userId: string,
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
    section: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'full',
    questionCount: number = 10,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/assessment/generate-test', {
      level,
      section,
      questionCount,
      userContext,
    });
    return response.data;
  }

  async evaluateTest(
    userId: string,
    testId: string,
    answers: Array<{ questionId: string; userAnswer: string; correctAnswer: string }>,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/assessment/evaluate-test', {
      testId,
      answers,
      userContext,
    });
    return response.data;
  }

  async getProgressBenchmark(
    userId: string,
    targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/assessment/progress-benchmark', {
      targetLevel,
      userContext,
    });
    return response.data;
  }

  async scheduleTest(
    userId: string,
    targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/assessment/schedule-test', {
      targetLevel,
      userContext,
    });
    return response.data;
  }

  async generatePlacementTest(
    userId: string,
    questionCount: number = 15,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/assessment/placement-test', {
      questionCount,
      userContext,
    });
    return response.data;
  }

  async evaluatePlacementTest(
    userId: string,
    testId: string,
    userAnswers: any,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/assessment/evaluate-placement', {
      testId,
      userAnswers,
      userContext,
    });
    return response.data;
  }

  // ==================== ANALYTICS AGENT METHODS ====================

  async trackProgress(
    userId: string,
    timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month',
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/analytics/track-progress', {
      timeframe,
      userContext,
    });
    return response.data;
  }

  async suggestStudyPath(
    userId: string,
    targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
    timeframe?: string,
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/analytics/suggest-study-path', {
      targetLevel,
      timeframe,
      userContext,
    });
    return response.data;
  }

  async identifyWeaknesses(userId: string): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/analytics/identify-weaknesses', {
      userContext,
    });
    return response.data;
  }

  async predictReadiness(
    userId: string,
    targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/analytics/predict-readiness', {
      targetLevel,
      userContext,
    });
    return response.data;
  }

  async generateReport(
    userId: string,
    reportType: 'progress' | 'assessment' | 'comprehensive' = 'comprehensive',
    timeframe: string = 'month',
  ): Promise<any> {
    const userContext = await this.getUserContext(userId);
    const response = await this.httpClient.post('/api/analytics/generate-report', {
      reportType,
      timeframe,
      userContext,
    });
    return response.data;
  }
}
