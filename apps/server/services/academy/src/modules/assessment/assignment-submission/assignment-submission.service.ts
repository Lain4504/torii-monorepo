import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
  ) { }

  async findAll(query: AssignmentSubmissionQueryDto) {
    return this.prisma.assignmentSubmission.findMany({
      where: {
        classId: query.classId ?? undefined,
        classAssessmentId: query.classAssessmentId ?? undefined,
        userId: query.userId ?? undefined,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.assignmentSubmission.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('AssignmentSubmission not found');
    return item;
  }

  async create(input: AssignmentSubmissionCreateDto, requesterId = 'SYSTEM') {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    const assessment = await this.prisma.classAssessment.findUnique({
      where: { id: input.classAssessmentId },
      select: { id: true, classId: true, assignmentTemplateId: true, kind: true, settings: true },
    });
    if (!assessment) throw new BadRequestException('Invalid classAssessmentId');
    if (assessment.classId !== input.classId) {
      throw new BadRequestException('classAssessmentId does not belong to classId');
    }

    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: {
        classId: input.classId,
        classAssessmentId: input.classAssessmentId,
        userId: input.userId,
      },
    });

    if (existing) {
      if (existing.status === 'GRADED') {
        throw new BadRequestException('Cannot resubmit already graded assignment');
      }

      const settings = (assessment.settings as any) || {};
      if (existing.status === 'SUBMITTED' && !settings.allowResubmission) {
        throw new BadRequestException('Resubmission not allowed for this assignment');
      }

      // Update existing instead of create
      return this.update(existing.id, {
        status: input.status,
        content: input.content,
      }, requesterId);
    }

    const result = await this.prisma.assignmentSubmission.create({
      data: {
        classId: input.classId,
        classAssessmentId: input.classAssessmentId,
        assignmentTemplateId: input.assignmentTemplateId,
        userId: input.userId,
        status: (input.status as any) ?? 'DRAFT',
        submittedAt: (input.status ?? '').toUpperCase() === 'SUBMITTED' ? new Date() : null,
        content: input.content ?? undefined,
      } as any,
    });

    // We don't necessarily log student creations as audit log, but if a staff creates it, log it
    // Or if it's a submission, track it?
    // Let's focus on administrative actions (like delete and grade)
    return result;
  }

  async update(id: string, input: AssignmentSubmissionUpdateDto, requesterId = 'SYSTEM') {
    const oldSubmission = await this.findById(id);
    const updated = await this.prisma.assignmentSubmission.update({
      where: { id },
      data: {
        status: input.status as any,
        score: input.score !== undefined ? new Prisma.Decimal(input.score) : undefined,
        gradedAt: input.score !== undefined ? new Date() : undefined,
        submittedAt: input.status && input.status.toUpperCase() === 'SUBMITTED' ? new Date() : undefined,
        content: input.content ?? undefined,
      } as any,
    });

    if (input.score !== undefined) {
      await this.audit.log({
        userId: requesterId,
        action: 'assignment_submission.grade',
        entity: 'AssignmentSubmission',
        entityId: id,
        description: `Graded assignment submission for user ${oldSubmission.userId}. Score: ${input.score}`,
        oldValues: { score: oldSubmission.score?.toString() },
        newValues: { score: updated.score?.toString(), status: updated.status },
      });
    }

    return updated;
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    await this.findById(id);
    const submission = await this.findById(id);
    await this.prisma.assignmentSubmission.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'assignment_submission.delete',
      entity: 'AssignmentSubmission',
      entityId: id,
      description: `Deleted assignment submission for user ${submission.userId}`,
      metadata: { userId: submission.userId, classId: submission.classId },
    });

    return { ok: true };
  }
}

