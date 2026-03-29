import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
  AcademyQuestionCreateDTO,
  AcademyQuestionUpdateDTO,
  AcademyQuestionQueryDTO,
  AcademyQuestionCategoryDTO,
  AcademyQuestionCategoryUpdateDTO,
} from '@workspace/schemas';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async createQuestion(dto: AcademyQuestionCreateDTO) {
    return this.prisma.$transaction(async (tx) => {
      const { options, categoryIds, ...data } = dto;
      
      const question = await tx.academyQuestion.create({
        data: {
          ...data,
          questionType: data.questionType as any,
          correctAnswer: Array.isArray(data.correctAnswer) 
            ? JSON.stringify(data.correctAnswer) 
            : data.correctAnswer,
          metadata: data.metadata as any,
          options: options ? {
            create: options.map((opt) => ({
              optionKey: opt.optionKey,
              content: opt.content,
              isCorrect: opt.isCorrect,
              orderIndex: opt.orderIndex,
            })),
          } : undefined,
          categoryLinks: categoryIds ? {
            create: categoryIds.map((id) => ({
              categoryId: id,
            })),
          } : undefined,
        },
        include: {
          options: true,
          categoryLinks: {
            include: {
              category: true,
            },
          },
        },
      });

      return question;
    });
  }

  async updateQuestion(id: string, dto: AcademyQuestionUpdateDTO) {
    return this.prisma.$transaction(async (tx) => {
      const { options, categoryIds, ...data } = dto;

      // Update basic fields
      await tx.academyQuestion.update({
        where: { id },
        data: {
          ...data,
          questionType: data.questionType as any,
          correctAnswer: Array.isArray(data.correctAnswer) 
            ? JSON.stringify(data.correctAnswer) 
            : data.correctAnswer,
          metadata: (data.metadata as any) ?? undefined,
        },
      });

      // Update options if provided (replaces existing options for simplicity in this version)
      if (options) {
        await tx.academyQuestionOption.deleteMany({
          where: { questionId: id },
        });
        await tx.academyQuestionOption.createMany({
          data: options.map((opt) => ({
            questionId: id,
            optionKey: opt.optionKey,
            content: opt.content,
            isCorrect: opt.isCorrect,
            orderIndex: opt.orderIndex,
          })),
        });
      }

      // Update categories if provided
      if (categoryIds) {
        await tx.academyQuestionCategoryLink.deleteMany({
          where: { questionId: id },
        });
        await tx.academyQuestionCategoryLink.createMany({
          data: categoryIds.map((catId) => ({
            questionId: id,
            categoryId: catId,
          })),
        });
      }

      return tx.academyQuestion.findUnique({
        where: { id },
        include: {
          options: true,
          categoryLinks: {
            include: {
              category: true,
            },
          },
        },
      });
    });
  }

  async findQuestions(query: AcademyQuestionQueryDTO) {
    const { questionType, difficulty, categoryId, reviewStatus, q } = query;
    return this.prisma.academyQuestion.findMany({
      where: {
        questionType: questionType as any,
        difficulty,
        reviewStatus,
        OR: q ? [
          { stem: { contains: q, mode: 'insensitive' } } as any,
          { explanation: { contains: q, mode: 'insensitive' } } as any,
        ] : undefined,
        categoryLinks: categoryId ? {
          some: { categoryId },
        } : undefined,
      },
      include: {
        options: true,
        categoryLinks: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuestion(id: string) {
    const question = await this.prisma.academyQuestion.findUnique({
      where: { id },
      include: {
        options: true,
        categoryLinks: {
          include: {
            category: true,
          },
        },
      },
    });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async deleteQuestion(id: string) {
    const question = await this.prisma.academyQuestion.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            examQuestions: true,
            attemptAnswers: true,
          },
        },
      },
    });

    if (!question) throw new NotFoundException('Không tìm thấy câu hỏi');

    if (question._count.examQuestions > 0 || question._count.attemptAnswers > 0) {
      throw new BadRequestException(
        'Câu hỏi này đang được sử dụng trong bài thi hoặc đã có học viên thực hiện. Không thể xóa.'
      );
    }

    return this.prisma.academyQuestion.delete({
      where: { id },
    });
  }

  // Categories
  async createCategory(dto: AcademyQuestionCategoryDTO) {
    return this.prisma.academyQuestionCategory.create({
      data: dto as any,
    });
  }

  async getCategories() {
    return this.prisma.academyQuestionCategory.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async updateCategory(id: string, dto: AcademyQuestionCategoryUpdateDTO) {
    const category = await this.prisma.academyQuestionCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');

    return this.prisma.academyQuestionCategory.update({
      where: { id },
      data: dto as any,
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.academyQuestionCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { links: true, children: true },
        },
      },
    });

    if (!category) throw new NotFoundException('Danh mục không tồn tại');

    if (category._count.links > 0) {
      throw new BadRequestException('Không thể xóa danh mục đang có câu hỏi');
    }

    if (category._count.children > 0) {
      throw new BadRequestException('Không thể xóa danh mục đang có danh mục con');
    }

    return this.prisma.academyQuestionCategory.delete({
      where: { id },
    });
  }
}
