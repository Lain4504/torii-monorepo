import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  QuestionBankQueryDto,
  QuestionBankDto,
  CreateQuestionBankResponseDto,
  UpdateQuestionBankResponseDto,
  DeleteQuestionBankResponseDto,
  GetQuestionBankByIdResponseDto,
  QuestionBankListResponseDto,
  QuestionStatus,
} from '@workspace/dtos';

@Injectable()
export class QuestionBankService {
  private readonly logger = new Logger(QuestionBankService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Map Prisma QuestionBank to QuestionBankDto
   */
  private toQuestionBankDto(question: any): QuestionBankDto {
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
  async findAll(query: QuestionBankQueryDto): Promise<QuestionBankListResponseDto> {
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
      const skip = (page - 1) * limit;

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
          take: limit,
          skip: skip,
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: `${questions.length} question(s) retrieved successfully`,
        error: '',
        data: {
          success: true,
          message: '',
          data: questions.map((q) => this.toQuestionBankDto(q)),
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching questions: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to fetch questions',
        error: error.message,
        data: null as any,
      };
    }
  }

  /**
   * Get question by ID
   */
  async findOne(id: string): Promise<GetQuestionBankByIdResponseDto> {
    try {
      const question = await this.prisma.questionBank.findUnique({
        where: { id },
      });

      if (!question) {
        return {
          success: false,
          message: 'Question not found',
          error: 'NOT_FOUND',
          data: null as any,
        };
      }

      return {
        success: true,
        message: 'Question retrieved successfully',
        error: '',
        data: this.toQuestionBankDto(question),
      };
    } catch (error) {
      this.logger.error(`Error fetching question ${id}: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to fetch question',
        error: error.message,
        data: null as any,
      };
    }
  }

  /**
   * Create new question
   */
  async create(input: CreateQuestionBankDto): Promise<CreateQuestionBankResponseDto> {
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

      return {
        success: true,
        message: 'Question created successfully',
        error: '',
        data: this.toQuestionBankDto(question),
      };
    } catch (error) {
      this.logger.error(`Error creating question: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to create question',
        error: error.message,
        data: null as any,
      };
    }
  }

  /**
   * Update existing question
   */
  async update(id: string, input: UpdateQuestionBankDto): Promise<UpdateQuestionBankResponseDto> {
    try {
      const existing = await this.prisma.questionBank.findUnique({
        where: { id },
      });

      if (!existing) {
        return {
          success: false,
          message: 'Question not found',
          error: 'NOT_FOUND',
          data: null as any,
        };
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

      return {
        success: true,
        message: 'Question updated successfully',
        error: '',
        data: this.toQuestionBankDto(question),
      };
    } catch (error) {
      this.logger.error(`Error updating question ${id}: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to update question',
        error: error.message,
        data: null as any,
      };
    }
  }

  /**
   * Delete question
   */
  async delete(id: string): Promise<DeleteQuestionBankResponseDto> {
    try {
      const existing = await this.prisma.questionBank.findUnique({
        where: { id },
      });

      if (!existing) {
        return {
          success: false,
          message: 'Question not found',
          error: 'NOT_FOUND',
          data: false,
        };
      }

      await this.prisma.questionBank.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Question deleted successfully',
        error: '',
        data: true,
      };
    } catch (error) {
      this.logger.error(`Error deleting question ${id}: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to delete question',
        error: error.message,
        data: false,
      };
    }
  }
}
