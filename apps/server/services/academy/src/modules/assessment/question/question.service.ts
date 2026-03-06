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
    return this.prisma.question.create({
      data: {
        parentId: input.parentId,
        content: input.content,
        mediaUrl: input.mediaUrl,
        questionType: input.questionType,
        options: input.options ?? undefined,
        correctAnswer: input.correctAnswer ?? undefined,
        explanation: input.explanation,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  async update(id: string, input: QuestionUpdateDto) {
    await this.findById(id);
    return this.prisma.question.update({
      where: { id },
      data: {
        content: input.content,
        mediaUrl: input.mediaUrl,
        questionType: input.questionType,
        options: input.options ?? undefined,
        correctAnswer: input.correctAnswer ?? undefined,
        explanation: input.explanation,
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

    await this.prisma.question.delete({ where: { id } });
    return { ok: true };
  }
}

