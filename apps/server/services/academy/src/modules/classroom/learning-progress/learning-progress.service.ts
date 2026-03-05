import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  LearningProgressQueryDto,
  LearningProgressStatsDto,
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
      include: {
        lesson: {
          select: {
            title: true,
            // slug: true, // Removed: Field does not exist in schema
          },
        },
        class: {
          select: {
            courseProfile: {
              select: {
                title: true,
                code: true, // Used code instead of slug
              },
            },
          },
        },
      },
      orderBy: [{ lastAccessedAt: 'desc' }, { id: 'desc' }],
    });
  }

  async getHistory(userId: string) {
    const history = await this.prisma.learningProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        class: {
          select: {
            id: true,
            courseProfile: {
              select: {
                id: true,
                title: true,
                code: true, // Used code instead of slug
              },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
      take: 50,
    });

    return history.map((item: any) => ({
      id: item.id,
      courseTitle: item.class.courseProfile.title,
      lessonTitle: item.lesson.title,
      timestamp: item.lastAccessedAt,
      slug: item.class.courseProfile.code, // Mapped code to slug for compatibility
      lessonId: item.lessonId,
      courseProfileId: item.class.courseProfile.id,
      classId: item.classId,
      progressPercent: item.progressPercent,
    }));
  }

  async getStats(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
    });

    const totalCourses = enrollments.length;
    // Note: status in enrollment might be different, but we check if they have any progress
    const progress = await this.prisma.learningProgress.findMany({
      where: { userId },
    });

    const completedLessons = progress.filter((p) => p.status === 'COMPLETED').length;
    const inProgressCourses = enrollments.length; // Simplified for now

    // Mocking some values as they might need more complex aggregation or aren't in schema yet
    return {
      totalCourses,
      completedCourses: 0, // Need enrollment completion logic if available
      inProgressCourses,
      totalLearningHours: 0, // Need duration tracking logic
      averageProgress: progress.length > 0 
        ? Math.round(progress.reduce((acc, curr) => acc + (curr.progressPercent || 0), 0) / progress.length)
        : 0,
      currentStreak: 0,
      totalCertificates: 0,
    };
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

