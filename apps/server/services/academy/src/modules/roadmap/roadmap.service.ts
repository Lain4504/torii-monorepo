import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  RoadmapReplanTrigger,
  RoadmapTaskStatus,
  RoadmapTaskType,
} from '@workspace/schemas';

type EnrollmentLite = {
  id: string;
  userId: string;
  status: string;
  liveClassId?: string | null;
  vodPackageId?: string | null;
  liveClass?: {
    id: string;
    name?: string | null;
    cohort?: { courseProfileId?: string | null };
  } | null;
  vodPackage?: {
    id: string;
    title?: string | null;
    courseProfileId?: string | null;
  } | null;
};

@Injectable()
export class RoadmapService {
  private readonly logger = new Logger(RoadmapService.name);

  constructor(private readonly prisma: PrismaService) {}

  private get prismaAny() {
    return this.prisma as any;
  }

  private startOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfWeek(start: Date) {
    const d = new Date(start);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private async resolvePrimaryEnrollment(userId: string): Promise<EnrollmentLite> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      include: {
        liveClass: { include: { cohort: { select: { courseProfileId: true } } } },
        vodPackage: { select: { id: true, title: true, courseProfileId: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 10,
    });

    if (!enrollments.length) {
      throw new NotFoundException('No active enrollment found for roadmap');
    }

    const weighted = await Promise.all(
      enrollments.map(async (e) => {
        const completedLessons = await this.prisma.userLessonProgress.count({
          where: { enrollmentId: e.id, isCompleted: true },
        });
        const cpId = e.liveClass?.cohort?.courseProfileId || e.vodPackage?.courseProfileId;
        const totalLessons = cpId
          ? await this.prisma.lesson.count({
              where: { module: { courseProfileId: cpId } },
            })
          : 0;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const inProgressBias = progress >= 10 && progress < 90 ? 200 : 0;
        const score = inProgressBias + (100 - Math.abs(50 - progress));
        return { enrollment: e as EnrollmentLite, score, progress };
      }),
    );

    weighted.sort((a, b) => b.score - a.score);
    return weighted[0].enrollment;
  }

  private async createWeeklyTasks(roadmapId: string, enrollment: EnrollmentLite) {
    const weekStart = this.startOfWeek(new Date());
    const weekEnd = this.endOfWeek(weekStart);

    const cpId =
      enrollment.liveClass?.cohort?.courseProfileId || enrollment.vodPackage?.courseProfileId;
    if (!cpId) return;

    const completedLessonRows = await this.prisma.userLessonProgress.findMany({
      where: { enrollmentId: enrollment.id, isCompleted: true },
      select: { lessonId: true },
    });
    const completedSet = new Set(completedLessonRows.map((x) => x.lessonId));

    const lessons = await this.prisma.lesson.findMany({
      where: { module: { courseProfileId: cpId } },
      include: { module: { select: { orderIndex: true } } },
      orderBy: [{ module: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
      take: 24,
    });

    const nextLessons = lessons
      .filter((l) => !completedSet.has(l.id))
      .slice(0, 5)
      .map((lesson, idx) => ({
        roadmapId,
        weekIndex: 1,
        taskType: 'LESSON' as RoadmapTaskType,
        title: `Học bài: ${lesson.title}`,
        description: 'Hoàn thành bài học theo lộ trình cá nhân hóa.',
        priority: idx === 0 ? 1 : idx <= 2 ? 2 : 3,
        estimatedMinutes: 25,
        status: 'PENDING' as RoadmapTaskStatus,
        sourceRef: lesson.id,
        dueAt: weekEnd,
        metadata: { lessonId: lesson.id, enrollmentId: enrollment.id },
      }));

    const liveTasks =
      enrollment.liveClassId
        ? (
            await this.prisma.liveScheduleSession.findMany({
              where: {
                liveClassId: enrollment.liveClassId,
                sessionDate: { gte: weekStart, lte: weekEnd },
                status: { in: ['SCHEDULED', 'ONGOING'] },
              },
              orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
              take: 2,
            })
          ).map((s, idx) => ({
            roadmapId,
            weekIndex: 1,
            taskType: 'LIVE_SESSION' as RoadmapTaskType,
            title: `Tham gia buổi live ${s.sessionDate.toISOString().slice(0, 10)}`,
            description: 'Tham gia đầy đủ buổi học trực tiếp theo lịch.',
            priority: 1 + idx,
            estimatedMinutes: 90,
            status: 'PENDING' as RoadmapTaskStatus,
            sourceRef: s.id,
            dueAt: s.sessionDate,
            metadata: { sessionId: s.id, enrollmentId: enrollment.id },
          }))
        : [];

    const tasks = [...liveTasks, ...nextLessons].slice(0, 7);
    if (!tasks.length) return;
    await this.prismaAny.learningRoadmapTask.createMany({ data: tasks });
  }

  private async toRoadmapResponse(roadmap: any) {
    const enrollmentRow = await this.prisma.enrollment.findUnique({
      where: { id: roadmap.enrollmentId },
      select: { liveClassId: true, vodPackageId: true },
    });
    const targetId =
      enrollmentRow?.liveClassId || enrollmentRow?.vodPackageId || null;

    const tasks = await this.prismaAny.learningRoadmapTask.findMany({
      where: { roadmapId: roadmap.id },
      orderBy: [{ priority: 'asc' }, { dueAt: 'asc' }, { createdAt: 'asc' }],
    });
    const pending = tasks.filter((t: any) => t.status !== 'COMPLETED');
    const todayFocus = (pending.length ? pending : tasks).slice(0, 3);
    return {
      id: roadmap.id,
      status: roadmap.status,
      currentWeek: roadmap.currentWeek,
      version: roadmap.version,
      targetEnrollmentId: roadmap.enrollmentId,
      targetId,
      learnHref: targetId ? `/courses/${targetId}/learn` : null,
      todayFocus,
      weekPlan: tasks,
      nextBestAction: pending[0] || tasks[0] || null,
      generatedAt: roadmap.updatedAt,
    };
  }

  /**
   * Sau thanh toán / enroll: tạo roadmap + task tuần đầu nếu chưa có.
   */
  async bootstrapRoadmapForEnrollment(userId: string, enrollmentId: string): Promise<void> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: {
        liveClass: { include: { cohort: { select: { courseProfileId: true } } } },
        vodPackage: { select: { id: true, title: true, courseProfileId: true } },
      },
    });
    if (!enrollment || !['ACTIVE', 'COMPLETED'].includes(enrollment.status)) {
      return;
    }
    const existing = await this.prismaAny.learningRoadmap.findFirst({
      where: { userId, enrollmentId, status: 'ACTIVE' },
    });
    if (existing) return;

    const roadmap = await this.prismaAny.learningRoadmap.create({
      data: {
        userId,
        enrollmentId,
        status: 'ACTIVE',
        currentWeek: 1,
        version: 1,
        startedAt: new Date(),
      },
    });
    await this.createWeeklyTasks(roadmap.id, enrollment as EnrollmentLite);
    this.logger.log(`Bootstrapped roadmap ${roadmap.id} for enrollment ${enrollmentId}`);
  }

  async getMyRoadmap(userId: string) {
    const enrollment = await this.resolvePrimaryEnrollment(userId);
    let roadmap = await this.prismaAny.learningRoadmap.findFirst({
      where: {
        userId,
        enrollmentId: enrollment.id,
        status: 'ACTIVE',
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!roadmap) {
      roadmap = await this.prismaAny.learningRoadmap.create({
        data: {
          userId,
          enrollmentId: enrollment.id,
          status: 'ACTIVE',
          currentWeek: 1,
          version: 1,
          startedAt: new Date(),
        },
      });
      await this.createWeeklyTasks(roadmap.id, enrollment);
    }

    return this.toRoadmapResponse(roadmap);
  }

  async updateTask(
    userId: string,
    taskId: string,
    status: RoadmapTaskStatus,
    actualMinutes?: number,
  ) {
    const task = await this.prismaAny.learningRoadmapTask.findUnique({
      where: { id: taskId },
      include: { roadmap: true },
    });
    if (!task || !task.roadmap || task.roadmap.userId !== userId) {
      throw new NotFoundException('Roadmap task not found');
    }

    const completedAt = status === 'COMPLETED' ? new Date() : null;
    const updated = await this.prismaAny.learningRoadmapTask.update({
      where: { id: taskId },
      data: {
        status,
        actualMinutes: actualMinutes ?? task.actualMinutes,
        completedAt,
      },
    });

    // Nếu task thuộc lesson thì đồng bộ tiến độ học chính thức
    if (status === 'COMPLETED' && updated.taskType === 'LESSON') {
      const lessonId = updated.metadata?.lessonId || updated.sourceRef;
      const enrollmentId = updated.metadata?.enrollmentId || task.roadmap.enrollmentId;
      if (lessonId && enrollmentId) {
        await this.prisma.userLessonProgress.upsert({
          where: {
            enrollmentId_lessonId: { enrollmentId, lessonId },
          },
          update: {
            isCompleted: true,
            lastWatchedAt: new Date(),
          },
          create: {
            userId,
            enrollmentId,
            lessonId,
            isCompleted: true,
            lastWatchedAt: new Date(),
          },
        });
      }
    }

    return { ok: true, item: updated };
  }

  async replanForUser(userId: string, trigger: RoadmapReplanTrigger = 'USER_REQUEST') {
    const enrollment = await this.resolvePrimaryEnrollment(userId);
    const activeRoadmap = await this.prismaAny.learningRoadmap.findFirst({
      where: { userId, enrollmentId: enrollment.id, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
    });
    if (!activeRoadmap) {
      return this.getMyRoadmap(userId);
    }

    const prevVersion = activeRoadmap.version;
    const nextVersion = prevVersion + 1;

    await this.prismaAny.learningRoadmapTask.deleteMany({
      where: { roadmapId: activeRoadmap.id, status: { in: ['PENDING', 'IN_PROGRESS'] } },
    });

    await this.prismaAny.learningRoadmap.update({
      where: { id: activeRoadmap.id },
      data: {
        version: nextVersion,
        currentWeek: activeRoadmap.currentWeek + 1,
      },
    });

    await this.prismaAny.learningRoadmapReplan.create({
      data: {
        roadmapId: activeRoadmap.id,
        fromVersion: prevVersion,
        toVersion: nextVersion,
        triggerType: trigger,
        reasonContext: {
          trigger,
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    await this.createWeeklyTasks(activeRoadmap.id, enrollment);
    const refreshed = await this.prismaAny.learningRoadmap.findUnique({
      where: { id: activeRoadmap.id },
    });
    return this.toRoadmapResponse(refreshed);
  }

  @Cron('0 2 * * 0')
  async weeklyReplanJob() {
    this.logger.log('Running weekly roadmap replan job...');
    const users = await this.prisma.enrollment.findMany({
      where: { status: 'ACTIVE' },
      distinct: ['userId'],
      select: { userId: true },
    });

    for (const u of users) {
      try {
        await this.replanForUser(u.userId, 'SYSTEM_WEEKLY');
      } catch (error: any) {
        this.logger.warn(`Weekly replan failed for ${u.userId}: ${error?.message}`);
      }
    }
    this.logger.log(`Weekly roadmap replan finished for ${users.length} users`);
  }
}

