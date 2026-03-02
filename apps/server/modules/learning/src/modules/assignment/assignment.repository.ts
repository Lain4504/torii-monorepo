import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Assignment, Prisma } from '@prisma/generated';

export interface IAssignmentRepository {
  findById(id: string): Promise<Assignment | null>;
  findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AssignmentWhereInput;
    orderBy?: Prisma.AssignmentOrderByWithRelationInput;
    include?: Prisma.AssignmentInclude;
  }): Promise<Assignment[]>;
  count(where?: Prisma.AssignmentWhereInput): Promise<number>;
  create(data: Prisma.AssignmentCreateInput): Promise<Assignment>;
  update(id: string, data: Prisma.AssignmentUpdateInput): Promise<Assignment>;
  delete(id: string): Promise<void>;
  findByCourseId(courseMasterId: string): Promise<Assignment[]>;
  findByModuleId(moduleId: string): Promise<Assignment[]>;
  findByLessonId(lessonId: string): Promise<Assignment[]>;
}

@Injectable()
export class AssignmentRepository implements IAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Assignment | null> {
    return this.prisma.assignment.findUnique({
      where: { id },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AssignmentWhereInput;
    orderBy?: Prisma.AssignmentOrderByWithRelationInput;
    include?: Prisma.AssignmentInclude;
  }): Promise<Assignment[]> {
    const { skip, take, where, orderBy, include } = params;
    return this.prisma.assignment.findMany({
      skip,
      take,
      where,
      orderBy,
      include: include as any,
    });
  }

  async count(where?: Prisma.AssignmentWhereInput): Promise<number> {
    return this.prisma.assignment.count({ where });
  }

  async create(data: Prisma.AssignmentCreateInput): Promise<Assignment> {
    return this.prisma.assignment.create({ data });
  }

  async update(id: string, data: Prisma.AssignmentUpdateInput): Promise<Assignment> {
    return this.prisma.assignment.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.assignment.delete({ where: { id } });
  }

  async findByCourseId(courseMasterId: string): Promise<Assignment[]> {
    return this.prisma.assignment.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          // Assignments attached via course run
          { courseRun: { is: { courseMasterId } } },
          // Assignments attached at module level
          { module: { is: { courseMasterId } } },
          // Assignments attached at lesson level
          { lesson: { is: { module: { courseMasterId } } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByModuleId(moduleId: string): Promise<Assignment[]> {
    return this.prisma.assignment.findMany({
      where: { moduleId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByLessonId(lessonId: string): Promise<Assignment[]> {
    return this.prisma.assignment.findMany({
      where: { lessonId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
