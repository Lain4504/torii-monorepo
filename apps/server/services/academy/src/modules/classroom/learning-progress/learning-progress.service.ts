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
        contentItem: true,
      },
      orderBy: [{ lastAccessedAt: 'desc' }, { id: 'desc' }],
    });
  }

  async getCompletedItemIds(
    classId: string,
    userId: string,
  ): Promise<string[]> {
    const list = await this.prisma.learningProgress.findMany({
      where: {
        classId,
        userId,
        status: 'COMPLETED',
      },
      select: { contentItemId: true },
    });
    return list.map((p) => p.contentItemId);
  }

  async getHistory(userId: string) {
    const history = await this.prisma.learningProgress.findMany({
      where: { userId },
      include: {
        contentItem: {
          select: {
            id: true,
            kind: true,
            referenceId: true,
          },
        },
        class: {
          select: {
            id: true,
            courseProfile: {
              select: {
                id: true,
                title: true,
                code: true,
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
      itemTitle: `Content (${item.contentItem.kind})`, // Fallback since title is separate
      timestamp: item.lastAccessedAt,
      slug: item.class.courseProfile.code,
      contentItemId: item.contentItemId,
      courseProfileId: item.class.courseProfile.id,
      classId: item.classId,
      progressPercent: item.progressPercent,
    }));
  }

  async getStats(userId: string) {
    const [enrollments, progressRecords, gamification, certificates] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { userId, status: { in: ['ACTIVE', 'COMPLETED'] } },
      }),
      this.prisma.learningProgress.findMany({
        where: { userId },
        select: { progressPercent: true, status: true },
      }),
      this.gamificationService.getProfile(userId).catch(() => null),
      this.prisma.certificate.count({ where: { userId } }),
    ]);

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.status === 'COMPLETED').length;

    return {
      totalCourses,
      completedCourses,
      inProgressCourses: totalCourses - completedCourses,
      totalLearningHours: 0, // Need duration tracking logic to implement fully
      averageProgress: progressRecords.length > 0
        ? Math.round(progressRecords.reduce((acc, curr) => acc + (curr.progressPercent || 0), 0) / progressRecords.length)
        : 0,
      currentStreak: gamification?.currentStreak ?? 0,
      totalCertificates: certificates,
    };
  }

  async upsert(input: LearningProgressUpsertDto) {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true, courseProfileId: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    const contentItem = await this.prisma.classContentItem.findUnique({
      where: { id: input.contentItemId },
    });
    if (!contentItem) throw new BadRequestException('Invalid contentItemId');

    const result = await this.prisma.learningProgress.upsert({
      where: {
        userId_contentItemId: {
          userId: input.userId,
          contentItemId: input.contentItemId,
        },
      },
      create: {
        classId: input.classId,
        userId: input.userId,
        contentItemId: input.contentItemId,
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
      await this.gamificationService
        .trackActivity(input.userId, 'LESSON_COMPLETE', {
          contentItemId: input.contentItemId,
          classId: input.classId,
        })
        .catch((err) => {
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
        modules: {
          include: { items: true },
        },
      },
    });

    if (!klass) return;

    const prerequisiteItemIds = klass.modules
      .flatMap((m) => m.items)
      .filter((i) => i.isPrerequisite)
      .map((i) => i.id);

    if (prerequisiteItemIds.length === 0) return;

    const completedCount = await this.prisma.learningProgress.count({
      where: {
        classId,
        userId,
        contentItemId: { in: prerequisiteItemIds },
        status: 'COMPLETED',
      },
    });

    if (completedCount >= prerequisiteItemIds.length) {
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

