import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { QuestionCreateDto, QuestionQueryDto, QuestionUpdateDto } from './dto/question.dto';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: QuestionQueryDto) {
    const q = query.q?.trim();
    return this.prisma.question.findMany({
      where: {
        parentId: query.parentId ?? undefined,
        questionType: query.questionType ?? undefined,
        level: query.level ?? undefined,
        category: query.category ?? undefined,
        ...(q
          ? { content: { contains: q, mode: 'insensitive' } }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.question.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Question not found');
    return item;
  }

  async create(input: QuestionCreateDto) {
    await this.validateParentQuestion(input.parentId);
    this.validateGroupParentPayload(input.questionType, input.parentId);

    const isGroupParent = input.questionType === 'GROUP_PARENT';

    return this.prisma.question.create({
      data: {
        parentId: input.parentId,
        content: input.content,
        mediaUrl: input.mediaUrl,
        questionType: input.questionType,
        options: isGroupParent ? undefined : input.options ?? undefined,
        correctAnswer: isGroupParent ? undefined : input.correctAnswer ?? undefined,
        explanation: input.explanation,
        level: input.level,
        category: input.category,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  async update(id: string, input: QuestionUpdateDto) {
    const current = await this.findById(id);
    const targetQuestionType = input.questionType ?? current.questionType;
    this.validateGroupParentPayload(targetQuestionType, current.parentId ?? undefined);

    const isGroupParent = targetQuestionType === 'GROUP_PARENT';

    return this.prisma.question.update({
      where: { id },
      data: {
        content: input.content,
        mediaUrl: input.mediaUrl,
        questionType: input.questionType,
        options: isGroupParent ? undefined : input.options ?? undefined,
        correctAnswer: isGroupParent ? undefined : input.correctAnswer ?? undefined,
        explanation: input.explanation,
        level: input.level,
        category: input.category,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    // Check if used in any PUBLISHED exam
    const examUsage = await this.prisma.examQuestion.findFirst({
      where: {
        questionId: id,
        exam: { status: 'PUBLISHED' },
      },
      include: { exam: { select: { id: true, title: true } } },
    });

    if (examUsage) {
      throw new BadRequestException(
        `Cannot delete question used in PUBLISHED exam: ${examUsage.exam.title} (${examUsage.exam.id})`,
      );
    }

    // Check if used in pool -> QuizTemplate in PUBLISHED edition or active ClassAssessment
    const poolQuestions = await this.prisma.poolQuestion.findMany({
      where: { questionId: id },
      include: {
        pool: {
          include: {
            quizTemplates: {
              include: {
                classAssessments: {
                  where: { status: { not: 'CLOSED' } },
                  select: { id: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    for (const pq of poolQuestions) {
      for (const qt of pq.pool.quizTemplates) {
        const inPublishedEdition = await this.prisma.chapterItem.findFirst({
          where: {
            kind: 'QUIZ_TEMPLATE',
            referenceId: qt.id,
            chapter: {
              courseEdition: { status: 'PUBLISHED' },
            },
          },
        });
        if (inPublishedEdition || qt.classAssessments.length > 0) {
          throw new BadRequestException(
            'Cannot delete question used in quiz template that is in PUBLISHED edition or active class assessment',
          );
        }
      }
    }

    await this.prisma.question.delete({ where: { id } });
    return { ok: true };
  }

  private async validateParentQuestion(parentId?: string) {
    if (!parentId) return;
    const parent = await this.prisma.question.findUnique({
      where: { id: parentId },
      select: { id: true, questionType: true },
    });
    if (!parent) {
      throw new BadRequestException('Invalid parentId');
    }
    if (parent.questionType !== 'GROUP_PARENT') {
      throw new BadRequestException('parentId must point to a GROUP_PARENT question');
    }
  }

  private validateGroupParentPayload(questionType: string, parentId?: string) {
    if (questionType === 'GROUP_PARENT' && parentId) {
      throw new BadRequestException('GROUP_PARENT question cannot be a child question');
    }
  }
}

