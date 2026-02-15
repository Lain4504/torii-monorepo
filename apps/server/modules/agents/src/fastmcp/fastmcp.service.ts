import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService, AppConfigService } from '@server/shared';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FastMCP } from 'fastmcp';
import { z } from 'zod';

export interface ToolContext {
  userId: string;
  enrolledCourses?: string[];
  jlptLevels?: string[];
  aiMetadata?: any[];
  recentActivity?: { date: string; lessons: number; averageScore: number }[];
}

/**
 * FastMCP Service - Generic AI Client & Prompt Engine
 * 
 * Responsibilities:
 * - Managed Gemini API connection
 * - Prompt Template loading & rendering
 * - Response parsing/cleaning
 * - User Context retrieval (shared)
 */
@Injectable()
export class FastMcpService implements OnModuleInit {
  private readonly logger = new Logger(FastMcpService.name);
  private server: FastMCP;
  private toolRegistry = new Map<string, { schema: any; handler: Function }>();
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.registerHandlebarsHelpers();

    // Initialize FastMCP Server
    this.server = new FastMCP({
      name: 'Torii Agents',
      version: '1.0.0',
      transportType: 'httpStream',
    } as any);

    // Priority: 1. Config (YAML), 2. Environment Variable
    const apiKey = this.appConfig.thirdParty.gemini.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not set in config.yaml or .env!');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async onModuleInit() {
    this.logger.log('✅ Integrated AI Service Initialized');

    // Start FastMCP server on internal port 4000
    // This allows us to proxy requests from the main NestJS app (port 3004) -> FastMCP (port 4000)
    await this.server.start({
      transportType: 'httpStream',
      httpStream: {
        port: 4000,
        endpoint: '/sse', // Standard MCP endpoint
      }
    } as any);
  }

  public getApp() {
    return this.server.getApp();
  }

  // ==================== TOOL REGISTRY ====================

  public addTool(name: string, description: string, schema: any, handler: Function) {
    this.logger.debug(`🛠️ Registering Tool: ${name}`);

    // 1. Register with FastMCP (for external MCP clients)
    this.server.addTool({
      name,
      description,
      parameters: schema,
      execute: async (args) => handler(args),
    });

    // 2. Register internally (for NATS execution)
    this.toolRegistry.set(name, { schema, handler });
  }

  public async callTool(name: string, args: any): Promise<any> {
    const tool = this.toolRegistry.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    // Optional: We could validate 'args' against 'tool.schema' here using Zod
    // const validatedArgs = tool.schema.parse(args);

    this.logger.debug(`▶️ Executing Tool: ${name}`);
    return tool.handler(args);
  }

  // ==================== PUBLIC HELPERS ====================

  public loadPromptTemplate(templatePath: string): HandlebarsTemplateDelegate {
    try {
      // 1. Try Build Path (Standard Prod)
      // If we are in apps/server/dist, this might be correct or nested
      const buildPath = join(process.cwd(), 'dist/modules/agents/src/assets/prompts', templatePath);

      // 2. Try Source Path (Service Root - apps/server)
      // When running 'nest start' from apps/server, cwd is apps/server
      const serviceSourcePath = join(process.cwd(), 'modules/agents/src/assets/prompts', templatePath);

      // 3. Try Source Path (Monorepo Root)
      // When running from root
      const monorepoSourcePath = join(process.cwd(), 'apps/server/modules/agents/src/assets/prompts', templatePath);

      // 4. Try Relative to Service File (Fallback)
      const localPath = join(__dirname, '../../assets/prompts', templatePath);

      let templateContent: string;
      try {
        templateContent = readFileSync(buildPath, 'utf-8');
      } catch (e1) {
        try {
          templateContent = readFileSync(serviceSourcePath, 'utf-8');
        } catch (e2) {
          try {
            templateContent = readFileSync(monorepoSourcePath, 'utf-8');
          } catch (e3) {
            templateContent = readFileSync(localPath, 'utf-8');
          }
        }
      }

      this.logger.debug(`Template paths tried:\n1. ${buildPath}\n2. ${serviceSourcePath}\n3. ${monorepoSourcePath}\n4. ${localPath}`);

      return Handlebars.compile(templateContent);
    } catch (error) {
      this.logger.error(`Failed to load prompt template: ${templatePath}. CWD: ${process.cwd()}`, error);
      throw new Error(`Template not found: ${templatePath}`);
    }
  }

  public async callGemini(prompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API Key is missing');
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      this.logger.error('Gemini API Error:', error);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  public cleanJsonResponse(text: string): any {
    if (process.env.DEBUG_AI) {
      // console.log('--- RAW AI RESPONSE ---');
      // console.log(text);
      // console.log('-----------------------');
    }

    let cleaned = text.trim();
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1];
    }

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      this.logger.error('❌ JSON Parse Error', e);
      return {
        error: 'Failed to parse AI response',
        raw: text,
      };
    }
  }

  public async getUserContext(userId: string): Promise<ToolContext> {
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

      // Fetch Recent Activity (Last 30 Days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 1. Lessons Completed
      const completedLessons = await this.prisma.lessonProgress.findMany({
        where: {
          enrollment: { userId },
          completedAt: { gte: thirtyDaysAgo },
          status: 'completed'
        },
        select: { completedAt: true }
      });

      // 2. Quiz/Test Scores
      const completedQuizzes = await this.prisma.quizAttempt.findMany({
        where: {
          userId,
          completedAt: { gte: thirtyDaysAgo },
          status: 'completed' // or 'submitted'
        },
        select: { completedAt: true, percentage: true }
      });

      // 3. Aggregate by Date
      const activityMap = new Map<string, { lessons: number, scores: number[], date: string }>();

      // Init helper
      const getDateKey = (date: Date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

      completedLessons.forEach(l => {
        if (!l.completedAt) return;
        const dateKey = getDateKey(l.completedAt);
        if (!activityMap.has(dateKey)) {
          activityMap.set(dateKey, { lessons: 0, scores: [], date: dateKey });
        }
        activityMap.get(dateKey)!.lessons += 1;
      });

      completedQuizzes.forEach(q => {
        if (!q.completedAt) return;
        const dateKey = getDateKey(q.completedAt);
        if (!activityMap.has(dateKey)) {
          activityMap.set(dateKey, { lessons: 0, scores: [], date: dateKey });
        }
        if (q.percentage !== null) {
          activityMap.get(dateKey)!.scores.push(Number(q.percentage));
        }
      });

      // Convert to Array and Calculate Averages
      const recentActivity = Array.from(activityMap.values()).map(item => ({
        date: item.date,
        lessons: item.lessons,
        averageScore: item.scores.length > 0
          ? Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length)
          : 0
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Limit to last 7 days? Or keep all 30? Context window assumes 30 is fine.
      // Let's pass the last 14 days to be safe and concise.
      const conciseActivity = recentActivity.slice(-14);

      return {
        userId,
        enrolledCourses: courseTitles,
        jlptLevels,
        aiMetadata: courseMetadata,
        recentActivity: conciseActivity,
      } as any; // Cast as any to bypass partial interface for now or update interface
    } catch (error) {
      this.logger.warn(`Failed to fetch user context: ${error.message}`);
      return { userId };
    }
  }

  private registerHandlebarsHelpers() {
    Handlebars.registerHelper('eq', function (a: any, b: any) {
      return a === b;
    });
    Handlebars.registerHelper('json', function (obj: any) {
      return JSON.stringify(obj, null, 2);
    });
  }
}
