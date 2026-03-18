import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  AssignmentSubmissionCreateDto,
  AssignmentSubmissionQueryDto,
  AssignmentSubmissionUpdateDto,
} from './dto/assignment-submission.dto';
import { AuditLoggerService } from '../../audit-logger.service';

@Injectable()
export class AssignmentSubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) {}

  async findAll(
    query: AssignmentSubmissionQueryDto,
    requesterId?: string,
    isExamManager = false,
  ) {
    const effectiveUserId = isExamManager
      ? query.userId
      : (requesterId ?? query.userId);
    return this.prisma.assignmentSubmission.findMany({
      where: {
        classAssignmentId: query.classAssessmentId ?? undefined,
        userId: effectiveUserId ?? undefined,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string, requesterId?: string, isExamManager = false) {
    const item = await this.prisma.assignmentSubmission.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('AssignmentSubmission not found');
    if (
      !isExamManager &&
      requesterId &&
      requesterId !== 'SYSTEM' &&
      item.userId !== requesterId
    ) {
      throw new BadRequestException('You can only access your own submissions');
    }
    return item;
  }

  async create(
    input: AssignmentSubmissionCreateDto,
    requesterId = 'SYSTEM',
    isExamManager = false,
  ) {
    if (!input.userId) {
      throw new BadRequestException('Missing userId for assignment submission');
    }
    if (
      !isExamManager &&
      requesterId &&
      requesterId !== 'SYSTEM' &&
      input.userId !== requesterId
    ) {
      throw new BadRequestException(
        'You can only create submissions for yourself',
      );
    }

    if (!input.classAssessmentId) {
      throw new BadRequestException(
        'Missing classAssessmentId for assignment submission',
      );
    }

    const classAssignment = await this.prisma.classAssignment.findUnique({
      where: { id: input.classAssessmentId },
      select: { id: true },
    });
    if (!classAssignment) {
      throw new BadRequestException('Invalid classAssessmentId');
    }

    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: {
        classAssignmentId: input.classAssessmentId,
        userId: input.userId,
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException(
        'You have already submitted this assignment',
      );
    }

    const result = await this.prisma.assignmentSubmission.create({
      data: {
        classAssignmentId: input.classAssessmentId,
        userId: input.userId,
        status: (input.status as any) ?? 'SUBMITTED',
        submittedAt:
          (input.status ?? 'SUBMITTED').toUpperCase() === 'SUBMITTED'
            ? new Date()
            : null,
        content: input.content ?? null,
        fileUrls: input.fileUrls ?? [],
      },
    });

    return result;
  }

  async update(
    id: string,
    input: AssignmentSubmissionUpdateDto,
    requesterId = 'SYSTEM',
    isExamManager = false,
  ) {
    const oldSubmission = await this.findById(id, requesterId, isExamManager);

    const updated = await this.prisma.assignmentSubmission.update({
      where: { id },
      data: {
        status: input.status as any,
        grade:
          input.score !== undefined
            ? new Prisma.Decimal(input.score)
            : undefined,
        feedback: input.feedback ?? undefined,
        gradedAt: input.score !== undefined ? new Date() : undefined,
        submittedAt:
          input.status && input.status.toUpperCase() === 'SUBMITTED'
            ? new Date()
            : undefined,
        content: input.content ?? undefined,
        fileUrls: input.fileUrls ?? undefined,
      },
    });

    if (input.score !== undefined) {
      await this.audit.log({
        userId: requesterId,
        action: 'assignment_submission.grade',
        entity: 'AssignmentSubmission',
        entityId: id,
        description: `Graded assignment submission for user ${oldSubmission.userId}. Score: ${input.score}`,
        oldValues: { grade: oldSubmission.grade?.toString() },
        newValues: { grade: updated.grade?.toString(), status: updated.status },
      });
    }

    return updated;
  }

  async delete(id: string, requesterId = 'SYSTEM', isExamManager = false) {
    const submission = await this.findById(id, requesterId, isExamManager);
    await this.prisma.assignmentSubmission.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'assignment_submission.delete',
      entity: 'AssignmentSubmission',
      entityId: id,
      description: `Deleted assignment submission for user ${submission.userId}`,
      metadata: {
        userId: submission.userId,
        classAssignmentId: submission.classAssignmentId,
      },
    });

    return { ok: true };
  }
}
