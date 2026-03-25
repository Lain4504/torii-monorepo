import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ReqWithRequester,
  GatewayAuthGuard,
  errorResponse,
  successResponse,
  PrismaService,
} from '@server/shared';

@Controller('api/v1')
@UseGuards(GatewayAuthGuard)
export class LearningPathController {
  private readonly logger = new Logger(LearningPathController.name);

  // NOTE: MVP dùng Prisma schema mới; trong một số môi trường dev Prisma client
  // có thể chưa được generate đầy đủ model typing ngay lập tức.
  // Ép kiểu `Record<string, any>` để tránh TS compile/lint block cho phần ingestor/planning.
  constructor(private readonly prisma: PrismaService & Record<string, any>) {}

  private addDaysUTC(date: Date, days: number) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  }

  private normalizeTaskStatus(status?: string) {
    // Accept lowercase from client: completed -> COMPLETED
    const s = (status ?? '').toString().trim();
    if (!s) return 'COMPLETED';
    return s.toUpperCase();
  }

  private isTaskNonAi(taskType: string) {
    // Planning layer must never generate AI-practice tasks.
    return (
      taskType === 'VOD_LESSON' ||
      taskType === 'LIVE_ATTENDANCE' ||
      taskType === 'ASSIGNMENT_SUBMIT' ||
      taskType === 'SRS_REVIEW' ||
      taskType === 'JLPT_MOCK_SECTION'
    );
  }

  private async getUserLastActiveDateString(userId: string) {
    const last = await this.prisma.streakLog.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'FREEZE'] } },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    return last?.date ?? null;
  }

  @Put('learners/me/profile')
  async upsertLearnerProfile(@Req() req: ReqWithRequester, @Body() body: any) {
    try {
      const userId = req.requester.sub;

      const targetJlptLevel = body?.target_jlpt_level ?? body?.self_assessed_level ?? null;
      const weeklyAvailableMinutes =
        body?.weekly_available_minutes ??
        body?.weeklyAvailableMinutes ??
        null;

      const existing = await this.prisma.personalLearningPlan.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      const completenessScoreParts: number[] = [];
      if (targetJlptLevel) completenessScoreParts.push(0.4);
      if (typeof weeklyAvailableMinutes === 'number' && weeklyAvailableMinutes > 0)
        completenessScoreParts.push(0.3);
      if (body?.self_assessed_level) completenessScoreParts.push(0.2);
      if (Array.isArray(body?.preferred_learning_modes) && body.preferred_learning_modes.length > 0)
        completenessScoreParts.push(0.1);

      const completenessScoreRaw = completenessScoreParts.reduce((a, b) => a + b, 0);
      const completenessScore = Math.max(0.1, Math.min(1, completenessScoreRaw));

      const plan = existing
        ? await this.prisma.personalLearningPlan.update({
            where: { id: existing.id },
            data: {
              targetJlptLevel,
              planType: 'ADAPTIVE',
              status: 'ACTIVE',
              currentVersion: 1,
              goalSnapshot: {
                ...(body ?? {}),
                weekly_available_minutes: weeklyAvailableMinutes,
              },
            },
          })
        : await this.prisma.personalLearningPlan.create({
            data: {
              userId,
              targetJlptLevel,
              planType: 'ADAPTIVE',
              status: 'ACTIVE',
              currentVersion: 1,
              goalSnapshot: {
                ...(body ?? {}),
                weekly_available_minutes: weeklyAvailableMinutes,
              },
              startedAt: new Date(),
            },
          });

      return successResponse({
        profileId: plan.id,
        profileVersion: plan.currentVersion,
        completenessScore,
        nextStep: 'generate_roadmap',
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`upsertLearnerProfile failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to upsert profile');
    }
  }

  @Post('learners/me/pretest/submit')
  async submitPretest(@Req() req: ReqWithRequester, @Body() body: any) {
    try {
      const userId = req.requester.sub;

      const overallScoreRaw =
        body?.overall_score ??
        body?.overallScore ??
        body?.pretest_score ??
        body?.pretestScore ??
        body?.score ??
        null;
      const overallScore = overallScoreRaw == null ? null : Number(overallScoreRaw);

      const recommendedAction = body?.recommended_action ?? body?.recommendedAction ?? 'generate_roadmap';
      const recommendedTargetJlptLevel =
        body?.target_jlpt_level ??
        body?.recommended_jlpt_level ??
        body?.recommendedJlptLevel ??
        body?.targetJlptLevel ??
        null;

      const existingPlan = await this.prisma.personalLearningPlan.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      const plan = existingPlan
        ? await this.prisma.personalLearningPlan.update({
            where: { id: existingPlan.id },
            data: {
              targetJlptLevel: recommendedTargetJlptLevel ?? existingPlan.targetJlptLevel,
              planType: 'ADAPTIVE',
              status: 'ACTIVE',
              currentVersion: existingPlan.currentVersion ?? 1,
              goalSnapshot: {
                ...(existingPlan.goalSnapshot ?? {}),
                ...(body ?? {}),
              },
            },
          })
        : await this.prisma.personalLearningPlan.create({
            data: {
              userId,
              targetJlptLevel: recommendedTargetJlptLevel,
              planType: 'ADAPTIVE',
              status: 'ACTIVE',
              currentVersion: 1,
              goalSnapshot: {
                ...(body ?? {}),
              },
              startedAt: new Date(),
            },
          });

      let completenessScore = 0.5;
      if (typeof overallScore === 'number' && !Number.isNaN(overallScore)) {
        completenessScore = Math.max(0, Math.min(1, overallScore / 100));
      }

      return successResponse({
        resultId: plan.id,
        overallScore: overallScore ?? 0,
        completenessScore,
        recommendedAction,
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`submitPretest failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to submit pretest');
    }
  }

  @Post('roadmaps/generate')
  async generateRoadmap(@Req() req: ReqWithRequester, @Body() body: any) {
    try {
      const userId = req.requester.sub;

      // 1) Get or create learner plan snapshot
      const existingPlan = await this.prisma.personalLearningPlan.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      const plan = existingPlan
        ? existingPlan
        : await this.prisma.personalLearningPlan.create({
            data: {
              userId,
              targetJlptLevel: body?.target_jlpt_level ?? null,
              planType: 'ADAPTIVE',
              status: 'ACTIVE',
              currentVersion: 1,
              goalSnapshot: body ?? {},
              startedAt: new Date(),
            },
          });

      const weeklyAvailableMinutes =
        (plan.goalSnapshot as any)?.weekly_available_minutes ??
        (plan.goalSnapshot as any)?.weeklyAvailableMinutes ??
        body?.weekly_available_minutes ??
        body?.weeklyAvailableMinutes ??
        420;

      const horizonWeeksRaw =
        body?.horizon_weeks ??
        body?.horizonWeeks ??
        body?.horizon_weeks_count ??
        12;

      const horizonWeeks = Math.max(1, Number(horizonWeeksRaw) || 12);

      // 2) Clear previous weeks/tasks (idempotent generator)
      const existingWeeks = await this.prisma.personalLearningPlanWeek.findMany({
        where: { planId: plan.id },
        select: { id: true },
      });
      if (existingWeeks.length > 0) {
        const weekIds = existingWeeks.map((w) => w.id);
        await this.prisma.personalLearningPlanTask.deleteMany({
          where: { planWeekId: { in: weekIds } },
        });
        await this.prisma.personalLearningPlanWeek.deleteMany({
          where: { planId: plan.id },
        });
      }

      // 3) Pick entitlement anchor (optional for MVP)
      const activeEnrollment = await this.prisma.enrollment.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { id: true },
      });

      const sourceEnrollmentId = activeEnrollment?.id ?? null;

      // 4) Generate weeks + tasks rule-based (no AI tasks)
      const startDate = new Date();
      const endDate = this.addDaysUTC(startDate, horizonWeeks * 7 - 1);

      const weeklyPlan: any[] = [];
      const explanations: string[] = [];

      const makeTask = (taskType: string, priority: string, title: string, weight: number) => ({
        taskType,
        priority,
        title,
        weight,
      });

      for (let weekIndex = 1; weekIndex <= horizonWeeks; weekIndex++) {
        const isCheckpoint = weekIndex % 4 === 0;

        const tasksWithWeight: Array<{
          taskType: string;
          priority: string;
          title: string;
          weight: number;
        }> = [];

        tasksWithWeight.push(
          makeTask(
            'VOD_LESSON',
            'must',
            `VOD: Ôn nền JLPT (Tuần ${weekIndex})`,
            2,
          ),
        );
        tasksWithWeight.push(
          makeTask(
            'SRS_REVIEW',
            'must',
            `SRS: Ôn từ vựng JLPT (Tuần ${weekIndex})`,
            2,
          ),
        );

        if (isCheckpoint) {
          tasksWithWeight.push(
            makeTask(
              'JLPT_MOCK_SECTION',
              'must',
              `JLPT Mock: Section ôn tập (Tuần ${weekIndex})`,
              2,
            ),
          );
        } else if (weekIndex % 2 === 0) {
          tasksWithWeight.push(
            makeTask(
              'JLPT_MOCK_SECTION',
              'should',
              `JLPT Mock: Luyện nhẹ (Tuần ${weekIndex})`,
              1,
            ),
          );
        }

        if (weekIndex % 3 === 0) {
          tasksWithWeight.push(
            makeTask(
              'LIVE_ATTENDANCE',
              'should',
              `Live: Tham gia buổi luyện tập (Tuần ${weekIndex})`,
              1,
            ),
          );
        }

        if (weekIndex % 5 === 0) {
          tasksWithWeight.push(
            makeTask(
              'ASSIGNMENT_SUBMIT',
              'should',
              `Assignment: Bài tập củng cố (Tuần ${weekIndex})`,
              1,
            ),
          );
        }

        // MVP cap: keep tasks count within 5
        const cappedTasks = tasksWithWeight.slice(0, 5);

        const sumWeight = cappedTasks.reduce((acc, t) => acc + t.weight, 0) || 1;
        let allocatedSoFar = 0;
        const weekStart = this.addDaysUTC(startDate, (weekIndex - 1) * 7);
        const weekEnd = this.addDaysUTC(startDate, weekIndex * 7 - 1);

        const weekEstimatedMinutes = Math.max(
          0,
          Math.round(Number(weeklyAvailableMinutes) || 0),
        );

        const objective = `Tuần ${weekIndex}: giữ nhịp + củng cố JLPT`;

        const week = await this.prisma.personalLearningPlanWeek.create({
          data: {
            planId: plan.id,
            version: plan.currentVersion,
            weekIndex,
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            objective,
            estimatedMinutes: weekEstimatedMinutes,
            status: 'PENDING',
          },
        });

        const tasks: any[] = [];
        for (let i = 0; i < cappedTasks.length; i++) {
          const t = cappedTasks[i];
          const minutes =
            i === cappedTasks.length - 1
              ? Math.max(0, weekEstimatedMinutes - allocatedSoFar)
              : Math.floor((weekEstimatedMinutes * t.weight) / sumWeight);

          allocatedSoFar += minutes;

          const sourceTypeMap: Record<string, string> = {
            VOD_LESSON: 'LESSON',
            LIVE_ATTENDANCE: 'LIVE_SESSION',
            ASSIGNMENT_SUBMIT: 'ASSIGNMENT',
            SRS_REVIEW: 'SET_CARD',
            JLPT_MOCK_SECTION: 'JLPT_TEMPLATE',
          };

          const task = await this.prisma.personalLearningPlanTask.create({
            data: {
              planWeekId: week.id,
              taskType: t.taskType,
              priority: t.priority,
              title: t.title,
              estimatedMinutes: minutes,
              status: 'PENDING',
              dueAt: weekEnd,
              sourceType: sourceTypeMap[t.taskType],
              sourceEnrollmentId,
              explanation: `Bám theo roadmap để tối ưu tiến độ cho Tuần ${weekIndex}.`,
              metadata: {
                week_index: weekIndex,
                task_type: t.taskType,
              },
            },
          });

          tasks.push(task);
        }

        if (isCheckpoint) {
          explanations.push(
            `Tuần ${weekIndex} là checkpoint để củng cố và kiểm tra nhanh tiến độ.`,
          );
        }

        weeklyPlan.push({
          week_index: week.weekIndex,
          objective: week.objective,
          estimated_minutes: week.estimatedMinutes,
          tasks: tasks.map((tt) => ({
            task_id: tt.id,
            title: tt.title,
            priority: tt.priority,
            estimated_minutes: tt.estimatedMinutes,
            task_type: tt.taskType,
            source_ref: {
              enrollment_id: sourceEnrollmentId,
            },
          })),
        });
      }

      return successResponse({
        roadmapId: plan.id,
        pathVersion: plan.currentVersion,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        weeklyPlan,
        explanations: explanations.length ? explanations : ['Roadmap generated by rule-based MVP.'],
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`generateRoadmap failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to generate roadmap');
    }
  }

  @Get('roadmaps/current')
  async getCurrentRoadmap(
    @Req() req: ReqWithRequester,
    @Query('include') include?: string,
  ) {
    try {
      const userId = req.requester.sub;
      const plan = await this.prisma.personalLearningPlan.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (!plan) {
        return successResponse({
          roadmapId: null,
          pathVersion: 0,
          include: include ? include.split(',') : [],
          weeklyPlan: [],
        });
      }

      const weeks = await this.prisma.personalLearningPlanWeek.findMany({
        where: { planId: plan.id, version: plan.currentVersion },
        orderBy: { weekIndex: 'asc' },
      });

      const weekIds = weeks.map((w) => w.id);
      const tasks = weekIds.length
        ? await this.prisma.personalLearningPlanTask.findMany({
            where: { planWeekId: { in: weekIds } },
            orderBy: { createdAt: 'asc' },
          })
        : [];

      const tasksByWeekId = new Map<string, any[]>();
      for (const t of tasks) {
        const list = tasksByWeekId.get(t.planWeekId) ?? [];
        list.push(t);
        tasksByWeekId.set(t.planWeekId, list);
      }

      return successResponse({
        roadmapId: plan.id,
        pathVersion: plan.currentVersion,
        include: include ? include.split(',') : [],
        weeklyPlan: weeks.map((w) => ({
          week_index: w.weekIndex,
          objective: w.objective,
          estimated_minutes: w.estimatedMinutes,
          tasks: (tasksByWeekId.get(w.id) ?? []).map((tt) => ({
            task_id: tt.id,
            title: tt.title,
            priority: tt.priority,
            estimated_minutes: tt.estimatedMinutes,
            task_type: tt.taskType,
            status: tt.status,
            due_at: tt.dueAt,
            completed_at: tt.completedAt,
          })),
        })),
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getCurrentRoadmap failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch current roadmap');
    }
  }

  @Post('roadmaps/:roadmapId/replan')
  async replanRoadmap(
    @Req() req: ReqWithRequester,
    @Param('roadmapId') roadmapId: string,
    @Body() body: any,
  ) {
    try {
      const userId = req.requester.sub;

      const triggerType: string =
        body?.trigger_type ?? body?.trigger ?? 'WEEKLY_SCHEDULER';
      const weekIndexRaw = body?.week_index ?? body?.weekIndex;
      const weekIndex = Math.max(1, Number(weekIndexRaw) || 1);

      const reasonContext = body?.reason_context ?? {};

      const plan = await this.prisma.personalLearningPlan.findFirst({
        where: { id: roadmapId, userId, status: 'ACTIVE' },
      });

      if (!plan) {
        return errorResponse('Roadmap not found');
      }

      const fromVersion = plan.currentVersion ?? 1;
      const nextVersion = fromVersion + 1;
      const prevWeekIndex = weekIndex - 1;

      // prev week completion drives the adjustment for `weekIndex`
      const prevWeek = await this.prisma.personalLearningPlanWeek.findFirst({
        where: {
          planId: plan.id,
          version: fromVersion,
          weekIndex: prevWeekIndex,
        },
      });

      if (!prevWeek) {
        return errorResponse(
          'prev week not found (need weekIndex >= 2)',
        );
      }

      const prevTasks = await this.prisma.personalLearningPlanTask.findMany({
        where: { planWeekId: prevWeek.id },
      });

      const prevTotal = prevTasks.length;
      const prevCompleted = prevTasks.filter(
        (t) => (t.status ?? '').toUpperCase() === 'COMPLETED',
      ).length;

      const completionRate =
        prevTotal > 0 ? prevCompleted / prevTotal : 0;

      const nextWeek = await this.prisma.personalLearningPlanWeek.findFirst({
        where: {
          planId: plan.id,
          version: fromVersion,
          weekIndex,
        },
      });

      if (!nextWeek) {
        return errorResponse('next week not found');
      }

      const weeklyAvailableMinutes =
        (plan.goalSnapshot as any)?.weekly_available_minutes ??
        (plan.goalSnapshot as any)?.weeklyAvailableMinutes ??
        nextWeek.estimatedMinutes ??
        0;

      const changes: any[] = [];
      const nextBestActions: any[] = [];

      // Only allow non-AI task adjustments: reduce/skip/add from allowed types.
      await this.prisma.$transaction(async (tx: any) => {
        if (completionRate < 0.5) {
          // Reduce 1 task in the target week.
          const candidateTasks = await tx.personalLearningPlanTask.findMany({
            where: { planWeekId: nextWeek.id },
            orderBy: { estimatedMinutes: 'asc' },
          });

          const removable =
            candidateTasks.find((t) => (t.priority ?? '').toLowerCase() !== 'must' && (t.status ?? '').toUpperCase() !== 'COMPLETED') ??
            candidateTasks.find((t) => (t.status ?? '').toUpperCase() !== 'COMPLETED');

          if (removable) {
            const delta = -(removable.estimatedMinutes ?? 0);
            await tx.personalLearningPlanTask.update({
              where: { id: removable.id },
              data: {
                status: 'SKIPPED',
                estimatedMinutes: 0,
                actualMinutes: null,
                completedAt: null,
              },
            });

            await tx.personalLearningPlanWeek.update({
              where: { id: nextWeek.id },
              data: {
                estimatedMinutes: Math.max(0, nextWeek.estimatedMinutes + delta),
              },
            });

            changes.push({
              type: 'scope_reduce',
              week_index: weekIndex,
              delta_minutes: delta,
              explanation:
                'Giảm tải để user có thể bắt kịp tiến độ nhịp học.',
            });
          }
        } else if (completionRate >= 0.8) {
          // Add at most 1 light task (non-AI) if there is remaining effort.
          const tasks = await tx.personalLearningPlanTask.findMany({
            where: { planWeekId: nextWeek.id },
          });

          const sumMinutes = tasks
            .filter((t) => (t.status ?? '').toUpperCase() !== 'SKIPPED')
            .reduce((acc, t) => acc + (t.estimatedMinutes ?? 0), 0);

          const remaining = Math.max(0, weeklyAvailableMinutes - sumMinutes);

          if (remaining >= 10) {
            const addMinutes = Math.min(10, remaining);
            const isSrsPriority = true;

            await tx.personalLearningPlanTask.create({
              data: {
                planWeekId: nextWeek.id,
                taskType: 'SRS_REVIEW',
                priority: isSrsPriority ? 'should' : 'could',
                title: `SRS: Ôn từ vựng JLPT (Tuần ${weekIndex}) - bonus`,
                estimatedMinutes: addMinutes,
                status: 'PENDING',
                dueAt: nextWeek.weekEndDate,
                sourceType: 'SET_CARD',
                explanation: 'Tuần này bạn có completion cao, hệ thống thêm một ôn nhẹ để tăng nhịp.',
                metadata: {
                  week_index: weekIndex,
                  bonus: true,
                } as any,
              },
            });

            await tx.personalLearningPlanWeek.update({
              where: { id: nextWeek.id },
              data: { estimatedMinutes: (nextWeek.estimatedMinutes ?? 0) + addMinutes },
            });

            changes.push({
              type: 'add_revision_block',
              week_index: weekIndex,
              delta_minutes: addMinutes,
              explanation:
                'Completion tuần trước cao: thêm 1 nhiệm vụ ôn nhẹ để tăng tốc.',
            });
          }
        }

        if (changes.length > 0) {
          // Bật path_version: giữ timeline bằng cách nâng version cho tất cả weeks.
          await tx.personalLearningPlan.update({
            where: { id: plan.id },
            data: { currentVersion: nextVersion, updatedAt: new Date() },
          });

          await tx.personalLearningPlanWeek.updateMany({
            where: { planId: plan.id, version: fromVersion },
            data: { version: nextVersion, updatedAt: new Date() },
          });
        }

        if (changes.length > 0) {
          await tx.personalLearningReplanLog.create({
            data: {
              planId: plan.id,
              fromVersion,
              toVersion: nextVersion,
              triggerType,
              reasonContext: reasonContext as any,
              changesSummary: changes as any,
            },
          });
        }
      });

      return successResponse({
        roadmapId,
        oldPathVersion: fromVersion,
        newPathVersion: changes.length > 0 ? nextVersion : fromVersion,
        changes,
        nextBestActions,
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`replanRoadmap failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to replan roadmap');
    }
  }

  @Patch('roadmaps/:roadmapId/tasks/:taskId')
  async patchTaskStatus(
    @Req() req: ReqWithRequester,
    @Param('roadmapId') roadmapId: string,
    @Param('taskId') taskId: string,
    @Body() body: any,
  ) {
    try {
      const status = this.normalizeTaskStatus(body?.status ?? body?.state);
      const actualMinutes =
        body?.actual_minutes ?? body?.actualMinutes ?? null;

      const completedAtRaw = body?.completed_at ?? body?.completedAt ?? null;
      const completedAt =
        completedAtRaw ? new Date(completedAtRaw) : undefined;

      const updated = await this.prisma.personalLearningPlanTask.update({
        where: { id: taskId },
        data: {
          status,
          actualMinutes: actualMinutes === null ? undefined : Number(actualMinutes),
          completedAt,
        },
      });

      // MVP RecoveryMode exit: when all "Recovery:" tasks are completed, switch plan back to ADAPTIVE.
      if (
        status === 'COMPLETED' &&
        (updated.title ?? '').startsWith('Recovery:') &&
        (updated.metadata as any)?.recovery
      ) {
        const remaining = await this.prisma.personalLearningPlanTask.findMany({
          where: {
            planWeekId: updated.planWeekId,
            status: { notIn: ['COMPLETED', 'SKIPPED'] },
            title: { startsWith: 'Recovery:' },
          },
          select: { id: true },
          take: 1,
        });

        if (!remaining || remaining.length === 0) {
          const week = await this.prisma.personalLearningPlanWeek.findUnique({
            where: { id: updated.planWeekId },
            select: { planId: true },
          });
          if (week) {
            await this.prisma.personalLearningPlan.update({
              where: { id: week.planId },
              data: { planType: 'ADAPTIVE', updatedAt: new Date() },
            });
          }
        }
      }

      return successResponse({ roadmapId, taskId, updated: true });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`patchTaskStatus failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to update task status');
    }
  }

  @Get('progress/overview')
  async getProgressOverview(@Req() req: ReqWithRequester) {
    try {
      const userId = req.requester.sub;
      const now = new Date();

      const plan = await this.prisma.personalLearningPlan.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (!plan) {
        return successResponse({
          progress_score: 0,
          confidence_score: 0,
          status: 'at-risk',
          activity: { weekly_minutes: 0, streak_days: 0 },
          performance: { avg_quiz_score: 0 },
          mastery: { skills_mastered: 0, skills_in_progress: 0 },
          risk_flags: ['no_active_plan'],
          updated_at: now.toISOString(),
        });
      }

      const weeks = await this.prisma.personalLearningPlanWeek.findMany({
        where: { planId: plan.id },
        orderBy: { weekIndex: 'asc' },
      });

      if (weeks.length === 0) {
        return successResponse({
          progress_score: 0,
          confidence_score: 0,
          status: 'at-risk',
          activity: { weekly_minutes: 0, streak_days: 0 },
          performance: { avg_quiz_score: 0 },
          mastery: { skills_mastered: 0, skills_in_progress: 0 },
          risk_flags: ['no_weeks_generated'],
          updated_at: now.toISOString(),
        });
      }

      const currentWeek =
        weeks.find(
          (w) =>
            now >= w.weekStartDate &&
            now <= w.weekEndDate,
        ) ?? weeks
          .slice()
          .reverse()
          .find((w) => now >= w.weekStartDate) ?? weeks[0];

      const tasks = await this.prisma.personalLearningPlanTask.findMany({
        where: { planWeekId: currentWeek.id },
      });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(
        (t) => (t.status ?? '').toUpperCase() === 'COMPLETED',
      ).length;

      const completionRate =
        totalTasks > 0 ? completedTasks / totalTasks : 0;

      const progress_score = Number(completionRate.toFixed(3));
      const confidence_score = progress_score; // MVP proxy

      // Recovering bucket: when user is actively in recovery mode.
      const isRecovering = String(plan.planType ?? '').toUpperCase() === 'RECOVERY';

      const status = isRecovering
        ? 'recovering'
        : completionRate >= 0.8
          ? 'on-track'
          : completionRate >= 0.5
            ? 'slightly_off'
            : 'at-risk';

      const risk_flags: string[] = [];
      if (completionRate < 0.5) risk_flags.push('low_completion');
      if (totalTasks === 0) risk_flags.push('empty_week_tasks');
      if (isRecovering) risk_flags.push('in_recovery_mode');

      const streak = await this.prisma.streak.findUnique({
        where: { userId },
        select: { currentStreak: true },
      });

      const weekly_minutes = currentWeek.estimatedMinutes ?? 0;

      return successResponse({
        progress_score,
        confidence_score,
        status,
        activity: { weekly_minutes, streak_days: streak?.currentStreak ?? 0 },
        performance: { avg_quiz_score: 0 },
        mastery: { skills_mastered: 0, skills_in_progress: 0 },
        risk_flags,
        updated_at: now.toISOString(),
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getProgressOverview failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch progress overview');
    }
  }

  @Get('progress/skills')
  async getProgressSkills(
    @Req() req: ReqWithRequester,
    @Query('include') include?: string,
  ) {
    try {
      const userId = req.requester.sub;
      const includeArr = include ? include.split(',') : [];

      // Lấy snapshot mới nhất theo skillKey.
      const snapshots = await this.prisma.personalLearningSkillSnapshot.findMany({
        where: { userId },
        orderBy: { snapshotDate: 'desc' },
        take: 50,
      });

      const latestBySkill = new Map<string, any>();
      for (const s of snapshots) {
        if (latestBySkill.has(s.skillKey)) continue;
        latestBySkill.set(s.skillKey, s);
      }

      const skills = Array.from(latestBySkill.values()).map((s) => ({
        skill_key: s.skillKey,
        jlpt_level: s.jlptLevel,
        score: s.score,
        confidence_score: s.confidenceScore,
        source_breakdown: s.sourceBreakdown ?? {},
        snapshot_date: s.snapshotDate,
      }));

      return successResponse({ skills, include: includeArr });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getProgressSkills failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch progress skills');
    }
  }

  @Get('progress/insights')
  async getProgressInsights(@Req() req: ReqWithRequester) {
    try {
      const userId = req.requester.sub;
      const now = new Date();

      const plan = await this.prisma.personalLearningPlan.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (!plan) {
        return successResponse({ insights: [], recommendedChanges: [] });
      }

      const weeks = await this.prisma.personalLearningPlanWeek.findMany({
        where: { planId: plan.id, version: plan.currentVersion },
        orderBy: { weekIndex: 'asc' },
      });

      const currentWeek =
        weeks.find((w: any) => now >= w.weekStartDate && now <= w.weekEndDate) ??
        weeks
          .slice()
          .reverse()
          .find((w: any) => now >= w.weekStartDate) ??
        null;

      if (!currentWeek) {
        return successResponse({ insights: [], recommendedChanges: [] });
      }

      const tasks = await this.prisma.personalLearningPlanTask.findMany({
        where: { planWeekId: currentWeek.id },
      });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t: any) => String(t.status ?? '').toUpperCase() === 'COMPLETED')
        .length;
      const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

      const isRecovering = String(plan.planType ?? '').toUpperCase() === 'RECOVERY';
      const status = isRecovering
        ? 'recovering'
        : completionRate >= 0.8
          ? 'on-track'
          : completionRate >= 0.5
            ? 'slightly_off'
            : 'at-risk';

      const riskFlags: string[] = [];
      if (completionRate < 0.5) riskFlags.push('low_completion');
      if (totalTasks === 0) riskFlags.push('empty_week_tasks');
      if (isRecovering) riskFlags.push('in_recovery_mode');

      const recommendedChanges: string[] = [];
      if (status === 'at-risk') {
        recommendedChanges.push('Tập trung hoàn thành toàn bộ tasks ưu tiên `must`');
        recommendedChanges.push('Giảm tải: dời các tasks `could` sang tuần sau nếu quá chậm');
      } else if (status === 'slightly_off') {
        recommendedChanges.push('Bám nhịp: ưu tiên tasks `must` và `should` trước');
        recommendedChanges.push('Duy trì SRS (review) đều mỗi ngày');
      } else if (status === 'recovering') {
        recommendedChanges.push('Hoàn thành chuỗi Recovery (3 ngày) để trở lại on-track');
      } else {
        recommendedChanges.push('Giữ nhịp học hiện tại, ưu tiên tasks `should`/`could` để tăng tốc nhẹ');
      }

      const insights = [
        {
          status,
          completion_rate: completionRate,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          risk_flags: riskFlags,
          week_index: currentWeek.weekIndex,
        },
      ];

      return successResponse({ insights, recommendedChanges });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getProgressInsights failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch progress insights');
    }
  }

  @Get('interventions/next-actions')
  async getNextInterventions(@Req() req: ReqWithRequester) {
    try {
      const userId = req.requester.sub;
      const now = new Date();

      const plan = await this.prisma.personalLearningPlan.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (!plan) {
        return successResponse({ actions: [] });
      }

      const currentWeek = await this.prisma.personalLearningPlanWeek.findFirst({
        where: {
          planId: plan.id,
          version: plan.currentVersion,
        },
      });

      const weeks = await this.prisma.personalLearningPlanWeek.findMany({
        where: { planId: plan.id, version: plan.currentVersion },
        orderBy: { weekIndex: 'asc' },
      });

      const week =
        weeks.find((w) => now >= w.weekStartDate && now <= w.weekEndDate) ??
        weeks
          .slice()
          .reverse()
          .find((w) => now >= w.weekStartDate) ??
        currentWeek;

      if (!week) {
        return successResponse({ actions: [] });
      }

      const tasks = await this.prisma.personalLearningPlanTask.findMany({
        where: { planWeekId: week.id },
      });

      const pending = tasks
        .filter(
          (t) =>
            (t.status ?? '').toUpperCase() !== 'COMPLETED' &&
            (t.status ?? '').toUpperCase() !== 'SKIPPED',
        )
        .sort((a: any, b: any) => {
          const pa = String(a.priority ?? 'must').toLowerCase();
          const pb = String(b.priority ?? 'must').toLowerCase();
          const rank = (p: string) => (p === 'must' ? 0 : p === 'should' ? 1 : 2);
          return rank(pa) - rank(pb);
        });

      const actions = pending.slice(0, 3).map((t) => ({
        action_id: `nba_task:${t.id}`,
        title: t.title,
        estimated_minutes: t.estimatedMinutes,
        priority: t.priority,
        reason: t.explanation ?? `Thực hiện để bám theo mục tiêu tuần ${week.weekIndex}.`,
      }));

      return successResponse({ actions });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getNextInterventions failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch next actions');
    }
  }

  @Post('interventions/recovery-plan')
  async createRecoveryPlan(
    @Req() req: ReqWithRequester,
    @Body() body: any,
  ) {
    try {
      const userId = req.requester.sub;
      const now = new Date();

      const windowDays =
        body?.recovery_window_days ??
        body?.recoveryWindowDays ??
        3;
      const inactiveDaysThreshold =
        body?.inactive_days ??
        body?.inactiveDays ??
        3;

      const plan = await this.prisma.personalLearningPlan.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (!plan) {
        return errorResponse('No active learning plan found');
      }

      const isAlreadyRecovery =
        String(plan.planType ?? '').toUpperCase() === 'RECOVERY';

      // Determine at-risk
      const lastActiveStr = await this.getUserLastActiveDateString(userId);
      const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
      const atRisk =
        !lastActiveStr
          ? true
          : (() => {
              const a = Date.parse(`${lastActiveStr}T00:00:00.000Z`);
              const b = Date.parse(`${todayStr}T00:00:00.000Z`);
              const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
              return diff >= inactiveDaysThreshold;
            })();

      // Even if not at-risk, still allow recovery creation for MVP UX.
      // (Later: guard by atRisk)

      // Pick week to attach recovery tasks (current week by date).
      const weeks = await this.prisma.personalLearningPlanWeek.findMany({
        where: { planId: plan.id, version: plan.currentVersion },
        orderBy: { weekIndex: 'asc' },
      });
      const currentWeek =
        weeks.find((w) => now >= w.weekStartDate && now <= w.weekEndDate) ??
        weeks
          .slice()
          .reverse()
          .find((w) => now >= w.weekStartDate) ??
        weeks[0];

      if (!currentWeek) {
        return errorResponse('No weeks in roadmap to attach recovery');
      }

      // Idempotent: if plan already in RECOVERY, don't create new tasks again.
      if (isAlreadyRecovery) {
        const recoveryTasks = await this.prisma.personalLearningPlanTask.findMany({
          where: {
            planWeekId: currentWeek.id,
            title: { startsWith: 'Recovery:' },
          },
        });

        const actionsByDay = new Map<number, any[]>();
        for (const t of recoveryTasks) {
          const day = (t.metadata as any)?.day;
          const dayNum = typeof day === 'number' ? day : null;
          if (!dayNum) continue;
          const list = actionsByDay.get(dayNum) ?? [];
          list.push({
            task_type: t.taskType,
            title: t.title,
            estimated_minutes: t.estimatedMinutes,
            priority: t.priority,
            is_must: String(t.priority ?? '').toLowerCase() === 'must',
            status: String(t.status ?? '').toUpperCase(),
          });
          actionsByDay.set(dayNum, list);
        }

        const dailyActions: any[] = [];
        for (let day = 1; day <= windowDays; day++) {
          dailyActions.push({
            day,
            tasks: actionsByDay.get(day) ?? [],
          });
        }

        return successResponse({
          planId: plan.id,
          windowDays,
          dailyActions,
          expectedOutcome: atRisk
            ? 'Quay lại trạng thái on_track trong 5-7 ngày.'
            : 'Recovery plan đã tồn tại. Hoàn thành các nhiệm vụ ngắn để thoát recovery.',
          atRisk,
          createdTaskIds: [],
          isAlreadyRecovery: true,
        });
      }

      const recoveryTasksToAdd: Array<{ day: number; taskType: string; title: string; minutes: number; priority: string }> = [];

      for (let day = 0; day < windowDays; day++) {
        // Must-win loop (non-AI)
        recoveryTasksToAdd.push({
          day: day + 1,
          taskType: 'SRS_REVIEW',
          title: `Recovery: Ôn SRS từ vựng JLPT (Ngày ${day + 1})`,
          minutes: 10,
          priority: 'must',
        });

        // Optional extra if within MVP effort cap
        recoveryTasksToAdd.push({
          day: day + 1,
          taskType: day === 0 ? 'VOD_LESSON' : 'JLPT_MOCK_SECTION',
          title: `Recovery: Học ôn nhẹ (Ngày ${day + 1})`,
          minutes: day === 0 ? 15 : 10,
          priority: 'should',
        });
      }

      const dailyActions: any[] = [];
      const createdTaskIds: string[] = [];

      await this.prisma.$transaction(async (tx: any) => {
        // Mark plan type as RECOVERY (MVP)
        await tx.personalLearningPlan.update({
          where: { id: plan.id },
          data: { planType: 'RECOVERY', updatedAt: now },
        });

        for (const item of recoveryTasksToAdd) {
          if (!this.isTaskNonAi(item.taskType)) continue;

          const dueAt = new Date(now);
          dueAt.setUTCDate(now.getUTCDate() + (item.day - 1));

          const created = await tx.personalLearningPlanTask.create({
            data: {
              planWeekId: currentWeek.id,
              taskType: item.taskType,
              priority: item.priority,
              title: item.title,
              estimatedMinutes: item.minutes,
              actualMinutes: null,
              status: 'PENDING',
              dueAt,
              sourceType:
                item.taskType === 'SRS_REVIEW'
                  ? 'SET_CARD'
                  : item.taskType === 'VOD_LESSON'
                    ? 'LESSON'
                    : 'JLPT_TEMPLATE',
              explanation:
                'Recovery Mode: chọn nhiệm vụ ngắn để giúp user quay lại nhịp On-track.',
              metadata: { recovery: true, day: item.day, windowDays } as any,
            },
          });

          createdTaskIds.push(created.id);
        }

        // Update week effort estimate (roughly)
        const weekAddedMinutes = recoveryTasksToAdd.reduce(
          (acc, x) => acc + x.minutes,
          0,
        );
        await tx.personalLearningPlanWeek.update({
          where: { id: currentWeek.id },
          data: {
            estimatedMinutes: (currentWeek.estimatedMinutes ?? 0) + weekAddedMinutes,
            status: 'IN_PROGRESS',
          },
        });
      });

      // Build daily actions response (group by day)
      const actionsByDay = new Map<number, any[]>();
      for (const item of recoveryTasksToAdd) {
        const list = actionsByDay.get(item.day) ?? [];
        list.push({
          task_type: item.taskType,
          title: item.title,
          estimated_minutes: item.minutes,
          priority: item.priority,
          is_must: item.priority === 'must',
        });
        actionsByDay.set(item.day, list);
      }

      for (let day = 1; day <= windowDays; day++) {
        dailyActions.push({
          day,
          tasks: actionsByDay.get(day) ?? [],
        });
      }

      return successResponse({
        planId: 'rp_generated_now',
        windowDays,
        dailyActions,
        expectedOutcome: atRisk
          ? 'Quay lại trạng thái on_track trong 5-7 ngày.'
          : 'Recovery plan được tạo để hỗ trợ quay lại nhịp học.',
        atRisk,
        createdTaskIds: createdTaskIds.slice(0, 20),
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`createRecoveryPlan failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to create recovery plan');
    }
  }
}

