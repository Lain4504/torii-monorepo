import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { GamificationService } from '@server/academy/modules/gamification/gamification.service';
import {
  LearningProgressQueryDto,
  LearningProgressStatsDto,
  LearningProgressUpsertDto,
} from './dto/learning-progress.dto';

@Injectable()
export class LearningProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
    @Inject('NATS_SERVICE') private readonly nats: ClientProxy,
  ) { }

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

    const result = await this.prisma.learningProgress.upsert({
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

    if (input.status === 'COMPLETED') {
      await this.checkClassCompletion(input.classId, input.userId);
      await this.gamificationService.trackActivity(input.userId, 'LESSON_COMPLETE', {
        lessonId: input.lessonId,
        classId: input.classId,
      }).catch(err => {
        // Just log the error, don't fail the progress update
        console.error('Failed to track gamification activity:', err);
      });
    }

    return result;
  }

  async checkClassCompletion(classId: string, userId: string) {
    const klass = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        courseEdition: {
          include: {
            chapters: {
              include: { items: { where: { kind: 'LESSON' } } },
            },
          },
        },
      },
    });

    if (!klass) return;

    const allLessonIds = klass.courseEdition.chapters.flatMap((c) =>
      c.items.map((i) => i.referenceId),
    );

    if (allLessonIds.length === 0) return;

    const completedCount = await this.prisma.learningProgress.count({
      where: {
        classId,
        userId,
        lessonId: { in: allLessonIds },
        status: 'COMPLETED',
      },
    });

    if (completedCount >= allLessonIds.length) {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { classId, userId, status: 'ACTIVE' },
        select: { id: true },
      });

      for (const enrollment of enrollments) {
        await this.prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: 'COMPLETED' },
        });

        // Emit event
        this.nats.emit('enrollment.completed', { enrollmentId: enrollment.id });
      }
    }
  }
}

