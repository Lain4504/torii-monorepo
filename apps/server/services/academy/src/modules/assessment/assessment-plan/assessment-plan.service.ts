import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
  AcademyUpdateAssessmentPlanDTO,
  AcademyAssessmentStatusDTO,
  AcademyAssessmentKind,
} from '@workspace/schemas';

@Injectable()
export class AssessmentPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlanByCourseProfileId(id: string) {
    return this.prisma.academyCourseProfileAssessment.findMany({
      where: { courseProfileId: id, isActive: true },
      include: {
        exam: {
          select: {
            title: true,
            examType: true,
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async updatePlan(dto: AcademyUpdateAssessmentPlanDTO) {
    const { courseProfileId, items } = dto;
    
    return this.prisma.$transaction(async (tx) => {
      // For simplicity, we disable old ones and create new ones or update existing
      // Standard strategy: delete all then re-insert for the course profile
      await tx.academyCourseProfileAssessment.deleteMany({
        where: { courseProfileId },
      });

      return tx.academyCourseProfileAssessment.createMany({
        data: items.map((item) => ({
          courseProfileId,
          examId: item.examId,
          assessmentKind: item.assessmentKind as any,
          moduleId: item.moduleId,
          triggerLessonId: item.triggerLessonId,
          orderIndex: item.orderIndex,
          isRequired: item.isRequired,
          isActive: item.isActive,
        })),
      });
    });
  }

  async getLearnerAssessmentStatus(params: {
    userId: string;
    classId?: string;
    enrollmentId?: string;
  }): Promise<AcademyAssessmentStatusDTO[]> {
    const { userId, classId, enrollmentId } = params;

    // 1. Identify CourseProfile
    let courseProfileId: string | undefined;
    if (classId) {
      const cls = await this.prisma.liveClass.findUnique({
        where: { id: classId },
        include: { cohort: true },
      });
      if (cls) {
        courseProfileId = cls.cohort.courseProfileId;
      } else {
        const pkg = await this.prisma.vodPackage.findUnique({
          where: { id: classId },
        });
        if (!pkg) throw new NotFoundException('Class or VOD package not found');
        courseProfileId = pkg.courseProfileId;
      }
    } else if (enrollmentId) {
      const enr = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          vodPackage: true,
          liveClass: { include: { cohort: true } },
        },
      });
      if (!enr) throw new NotFoundException('Enrollment not found');
      courseProfileId = enr.vodPackage?.courseProfileId || enr.liveClass?.cohort.courseProfileId;
    } else {
      throw new Error('Either classId or enrollmentId must be provided');
    }

    if (!courseProfileId) throw new NotFoundException('CourseProfile not found');

    // 2. Get Assessment Plan
    const plan = await this.getPlanByCourseProfileId(courseProfileId);

    // 3. Get latest attempts for this user/plan
    const attempts = await this.prisma.academyExamAttempt.findMany({
      where: {
        userId,
        examId: { in: plan.map((p) => p.examId) },
      },
      orderBy: { startedAt: 'desc' },
    });

    // 4. Resolve status for each milestone
    return plan.map((p) => {
      const latestAttempt = attempts.find((a) => a.examId === p.examId);
      let status: AcademyAssessmentStatusDTO['status'] = 'AVAILABLE';
      
      if (latestAttempt) {
        if (latestAttempt.status === ('SUBMITTED' as any)) {
          status = latestAttempt.isPassed ? 'PASSED' : 'FAILED';
        } else if (latestAttempt.status === ('IN_PROGRESS' as any)) {
          status = 'IN_PROGRESS';
        }
      }

      return {
        assessmentId: p.id,
        examId: p.examId,
        kind: p.assessmentKind as AcademyAssessmentKind,
        status,
        moduleId: p.moduleId ?? undefined,
        triggerLessonId: p.triggerLessonId ?? undefined,
        examTitle: p.exam?.title ?? undefined,
        latestAttemptId: latestAttempt?.id,
        score: latestAttempt?.score ? Number(latestAttempt.score) : undefined,
        percentage: latestAttempt?.percentage ? Number(latestAttempt.percentage) : undefined,
        isPassed: latestAttempt?.isPassed ?? undefined,
      };
    });
  }

  async canAccessLesson(params: {
    userId: string;
    lessonId: string;
    enrollmentId: string;
  }): Promise<{ allowed: boolean; reason?: string }> {
    const { userId, lessonId, enrollmentId } = params;

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const courseProfileId = lesson.module.courseProfileId;

    const milestones = await this.prisma.academyCourseProfileAssessment.findMany({
      where: {
        courseProfileId,
        isActive: true,
        isRequired: true,
      },
      include: {
        triggerLesson: true,
        module: true,
      },
      orderBy: { orderIndex: 'asc' },
    });

    const pendingMilestones: any[] = [];
    for (const m of milestones) {
      if (m.assessmentKind === ('LESSON_CHECKPOINT' as any) && m.triggerLesson) {
        if (m.triggerLesson.orderIndex < lesson.orderIndex && m.moduleId === lesson.moduleId) {
          pendingMilestones.push(m);
        } else if (m.module!.orderIndex < lesson.module.orderIndex) {
          pendingMilestones.push(m);
        }
      } else if (m.assessmentKind === ('MODULE_CHECKPOINT' as any) && m.module) {
        if (m.module.orderIndex < lesson.module.orderIndex) {
          pendingMilestones.push(m);
        }
      }
    }

    if (pendingMilestones.length === 0) return { allowed: true };

    const attempts = await this.prisma.academyExamAttempt.findMany({
      where: {
        userId,
        examId: { in: pendingMilestones.map((m) => m.examId) },
        status: 'SUBMITTED',
        isPassed: true,
      },
    });

    const passedExamIds = new Set(attempts.map((a) => a.examId));
    const blockingMilestone = pendingMilestones.find((m) => !passedExamIds.has(m.examId));

    if (blockingMilestone) {
      return {
        allowed: false,
        reason: 'Bạn cần hoàn thành bài kiểm tra trước khi tiếp tục bài học này.',
      };
    }

    return { allowed: true };
  }
}
