import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  AssignmentSubmissionCreateDto,
  AssignmentSubmissionQueryDto,
  AssignmentSubmissionUpdateDto,
} from './dto/assignment-submission.dto';

@Injectable()
export class AssignmentSubmissionService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(input: AssignmentSubmissionCreateDto) {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    const assessment = await this.prisma.classAssessment.findUnique({
      where: { id: input.classAssessmentId },
      select: { id: true, classId: true, assignmentTemplateId: true, kind: true },
    });
    if (!assessment) throw new BadRequestException('Invalid classAssessmentId');
    if (assessment.classId !== input.classId) {
      throw new BadRequestException('classAssessmentId does not belong to classId');
    }
    if ((assessment.kind ?? '').toUpperCase() !== 'ASSIGNMENT') {
      throw new BadRequestException('classAssessment.kind must be ASSIGNMENT');
    }
    if (assessment.assignmentTemplateId !== input.assignmentTemplateId) {
      throw new BadRequestException('assignmentTemplateId mismatch with classAssessment');
    }

    return this.prisma.assignmentSubmission.create({
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
  }

  async update(id: string, input: AssignmentSubmissionUpdateDto) {
    await this.findById(id);
    return this.prisma.assignmentSubmission.update({
      where: { id },
      data: {
        status: input.status as any,
        score: input.score !== undefined ? new Prisma.Decimal(input.score) : undefined,
        gradedAt: input.score !== undefined ? new Date() : undefined,
        submittedAt: input.status && input.status.toUpperCase() === 'SUBMITTED' ? new Date() : undefined,
        content: input.content ?? undefined,
      } as any,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.assignmentSubmission.delete({ where: { id } });
    return { ok: true };
  }
}

