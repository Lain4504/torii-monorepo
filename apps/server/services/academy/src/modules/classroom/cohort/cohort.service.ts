import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  AcademyCohortCreateDTO,
  AcademyCohortUpdateDTO,
  AcademyCohortQueryDTO,
} from '@workspace/schemas';

@Injectable()
export class CohortService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: AcademyCohortQueryDTO) {
    const where: any = {};
    if (query.courseProfileId) where.courseProfileId = query.courseProfileId;
    if (query.status) where.status = query.status;
    if (query.q) {
      where.OR = [
        { code: { contains: query.q, mode: 'insensitive' } },
        { name: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.cohort.findMany({
        where,
        include: {
          courseProfile: { select: { id: true, title: true } },
          _count: { select: { liveClasses: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cohort.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    const item = await this.prisma.cohort.findUnique({
      where: { id },
      include: {
        courseProfile: { include: { modules: { include: { lessons: true } } } },
        liveClasses: {
          include: {
            instructor: { select: { id: true, displayName: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Cohort not found');
    return item;
  }

  async create(data: AcademyCohortCreateDTO) {
    return this.prisma.cohort.create({
      data: {
        courseProfileId: data.courseProfileId,
        code: data.code,
        name: data.name,
        price: data.price,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: (data.status as any) ?? 'DRAFT',
        rejectionReason: (data as any).rejectionReason,
        submittedForApprovalAt:
          data.status === 'PENDING_APPROVAL' ? new Date() : undefined,
      },
    });
  }

  async update(id: string, data: AcademyCohortUpdateDTO) {
    return this.prisma.cohort.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        price: data.price,
        status: data.status as any,
        rejectionReason: (data as any).rejectionReason,
        submittedForApprovalAt:
          data.status === 'PENDING_APPROVAL' ? new Date() : undefined,
        enrollmentOpenAt: data.enrollmentOpenAt
          ? new Date(data.enrollmentOpenAt)
          : undefined,
        enrollmentCloseAt: data.enrollmentCloseAt
          ? new Date(data.enrollmentCloseAt)
          : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.prisma.cohort.delete({ where: { id } });
    return { ok: true };
  }
}
