import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Submission, Prisma } from '@prisma/generated';

export interface ISubmissionRepository {
  findById(id: string): Promise<Submission | null>;
  findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SubmissionWhereInput;
    orderBy?: Prisma.SubmissionOrderByWithRelationInput;
  }): Promise<Submission[]>;
  count(where?: Prisma.SubmissionWhereInput): Promise<number>;
  create(data: Prisma.SubmissionCreateInput): Promise<Submission>;
  update(id: string, data: Prisma.SubmissionUpdateInput): Promise<Submission>;
  upsert(where: Prisma.SubmissionWhereUniqueInput, create: Prisma.SubmissionCreateInput, update: Prisma.SubmissionUpdateInput): Promise<Submission>;
  findByAssignmentAndUser(assignmentId: string, userId: string, courseRunId?: string): Promise<Submission | null>;
  findByAssignmentId(assignmentId: string, courseRunId?: string): Promise<Submission[]>;
  createGradeHistory(data: any): Promise<any>;
}

@Injectable()
export class SubmissionRepository implements ISubmissionRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<Submission | null> {
    return this.prisma.submission.findUnique({
      where: { id },
      include: { gradeHistories: true }
    }) as any;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SubmissionWhereInput;
    orderBy?: Prisma.SubmissionOrderByWithRelationInput;
  }): Promise<Submission[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.submission.findMany({ skip, take, where, orderBy });
  }

  async count(where?: Prisma.SubmissionWhereInput): Promise<number> {
    return this.prisma.submission.count({ where });
  }

  async create(data: Prisma.SubmissionCreateInput): Promise<Submission> {
    return this.prisma.submission.create({ data });
  }

  async update(id: string, data: Prisma.SubmissionUpdateInput): Promise<Submission> {
    return this.prisma.submission.update({ where: { id }, data });
  }

  async upsert(
    where: Prisma.SubmissionWhereUniqueInput,
    create: Prisma.SubmissionCreateInput,
    update: Prisma.SubmissionUpdateInput
  ): Promise<Submission> {
    return this.prisma.submission.upsert({ where, create, update });
  }

  async findByAssignmentAndUser(assignmentId: string, userId: string, courseRunId?: string): Promise<Submission | null> {
    return this.prisma.submission.findFirst({
      where: {
        assignmentId,
        userId,
        ...(courseRunId ? { courseRunId } : {})
      },
      orderBy: { attemptNumber: 'desc' }, // Get latest attempt
    });
  }

  async findByAssignmentId(assignmentId: string, courseRunId?: string): Promise<Submission[]> {
    return this.prisma.submission.findMany({
      where: {
        assignmentId,
        ...(courseRunId ? { courseRunId } : {})
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async createGradeHistory(data: any): Promise<any> {
    return this.prisma.gradeHistory.create({ data });
  }
}
