import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
  type QuestionBankCreateDTO,
  type QuestionBankUpdateDTO,
  type QuestionBankQueryDTO,
  type QuestionBankResponseDTO,
  type PaginatedResponse,
  QuestionStatus,
} from '@workspace/schemas';

@Injectable()
export class QuestionBankService {
  private readonly logger = new Logger(QuestionBankService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Map Prisma QuestionBank to QuestionBankDto
   */
  private toQuestionBankDto(question: any): QuestionBankResponseDTO {
    return {
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      jlptLevel: question.jlptLevel || undefined,
      category: question.category || undefined,
      subcategory: question.subcategory || undefined,
      difficulty: question.difficulty || undefined,
      options: question.options || undefined,
      correctAnswer: question.correctAnswer || undefined,
      explanation: question.explanation || undefined,
      tags: question.tags || [],
      createdBy: question.createdBy || undefined,
      status: question.status,
      usageCount: question.usageCount,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  /**
   * Get all questions with filters
   */
  async findAll(query: QuestionBankQueryDTO): Promise<PaginatedResponse<QuestionBankResponseDTO>> {
    try {
      const {
        page = 1,
        limit = 10,
        questionType,
        jlptLevel,
        difficulty,
        category,
        search,
        status,
        tags,
      } = query;

      // Parse page and limit to numbers (in case they come as strings from query params)
      const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;

      // Ensure page and limit are valid positive numbers
      const validPage = pageNum > 0 ? pageNum : 1;
      const validLimit = limitNum > 0 ? limitNum : 10;

      const skip = (validPage - 1) * validLimit;

      const whereClause: Record<string, any> = {};

      if (questionType) {
        whereClause.questionType = questionType;
      }

      if (jlptLevel) {
        whereClause.jlptLevel = jlptLevel;
      }

      if (difficulty) {
        whereClause.difficulty = difficulty;
      }

      if (category) {
        whereClause.category = category;
      }

      if (status) {
        whereClause.status = status;
      }

      if (search) {
        whereClause.OR = [
          { questionText: { contains: search, mode: 'insensitive' } },
          { explanation: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (tags && tags.length > 0) {
        whereClause.tags = { hasSome: tags };
      }

      const [total, questions] = await Promise.all([
        this.prisma.questionBank.count({ where: whereClause }),
        this.prisma.questionBank.findMany({
          take: validLimit,
          skip: skip,
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / validLimit);

      return {
        data: questions.map((q) => this.toQuestionBankDto(q)),
        total,
        page: validPage,
        limit: validLimit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching questions: ${error.message}`, error.stack);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  }

  /**
   * Get question by ID
   */
  async findOne(id: string): Promise<QuestionBankResponseDTO | null> {
    try {
      const question = await this.prisma.questionBank.findUnique({
        where: { id },
      });

      if (!question) {
        return null;
      }

      return this.toQuestionBankDto(question);
    } catch (error: any) {
      this.logger.error(`Error fetching question ${id}: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Create new question
   */
  async create(input: QuestionBankCreateDTO): Promise<QuestionBankResponseDTO> {
    try {
      const question = await this.prisma.questionBank.create({
        data: {
          questionText: input.questionText,
          questionType: input.questionType,
          jlptLevel: input.jlptLevel || null,
          category: input.category || null,
          subcategory: input.subcategory || null,
          difficulty: input.difficulty || null,
          options: input.options || undefined,
          correctAnswer: input.correctAnswer || null,
          explanation: input.explanation || null,
          tags: input.tags || [],
          createdBy: input.createdBy || null,
          status: QuestionStatus.ACTIVE,
          usageCount: 0,
        },
      });

      return this.toQuestionBankDto(question);
    } catch (error: any) {
      this.logger.error(`Error creating question: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update existing question
   */
  async update(id: string, input: QuestionBankUpdateDTO): Promise<QuestionBankResponseDTO> {
    try {
      const existing = await this.prisma.questionBank.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Question not found');
      }

      const question = await this.prisma.questionBank.update({
        where: { id },
        data: {
          ...(input.questionText && { questionText: input.questionText }),
          ...(input.questionType && { questionType: input.questionType }),
          ...(input.jlptLevel !== undefined && { jlptLevel: input.jlptLevel }),
          ...(input.category !== undefined && { category: input.category }),
          ...(input.subcategory !== undefined && { subcategory: input.subcategory }),
          ...(input.difficulty !== undefined && { difficulty: input.difficulty }),
          ...(input.options !== undefined && { options: input.options as any }),
          ...(input.correctAnswer !== undefined && { correctAnswer: input.correctAnswer }),
          ...(input.explanation !== undefined && { explanation: input.explanation }),
          ...(input.tags !== undefined && { tags: input.tags }),
          ...(input.status !== undefined && { status: input.status }),
        },
      });

      return this.toQuestionBankDto(question);
    } catch (error: any) {
      this.logger.error(`Error updating question ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete question
   */
  async delete(id: string): Promise<boolean> {
    try {
      const existing = await this.prisma.questionBank.findUnique({
        where: { id },
      });

      if (!existing) {
        return false;
      }

      await this.prisma.questionBank.delete({
        where: { id },
      });

      return true;
    } catch (error: any) {
      this.logger.error(`Error deleting question ${id}: ${error.message}`, error.stack);
      return false;
    }
  }
}
