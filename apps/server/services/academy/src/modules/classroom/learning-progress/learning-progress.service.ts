import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  LearningProgressQueryDto,
  LearningProgressUpsertDto,
} from './dto/learning-progress.dto';

@Injectable()
export class LearningProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: LearningProgressQueryDto) {
    return this.prisma.learningProgress.findMany({
      where: {
        classId: query.classId ?? undefined,
        userId: query.userId ?? undefined,
      },
      orderBy: [{ lastAccessedAt: 'desc' }, { id: 'desc' }],
    });
  }

  async upsert(input: LearningProgressUpsertDto) {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true, courseProfileId: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: input.lessonId },
      select: { id: true, courseProfileId: true },
    });
    if (!lesson) throw new BadRequestException('Invalid lessonId');
    if (lesson.courseProfileId !== klass.courseProfileId) {
      throw new BadRequestException('Lesson does not belong to class courseProfile');
    }

    return this.prisma.learningProgress.upsert({
      where: {
        classId_userId_lessonId: {
          classId: input.classId,
          userId: input.userId,
          lessonId: input.lessonId,
        },
      },
      create: {
        classId: input.classId,
        userId: input.userId,
        lessonId: input.lessonId,
        status: input.status ?? 'NOT_STARTED',
        lastAccessedAt: input.lastAccessedAt,
        progressPercent: input.progressPercent ?? 0,
      },
      update: {
        status: input.status,
        lastAccessedAt: input.lastAccessedAt,
        progressPercent: input.progressPercent,
      },
    });
  }
}

