import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  AcademyCohortCreateDTO,
  AcademyCohortUpdateDTO,
  AcademyCohortQueryDTO,
} from '@workspace/schemas';

@Injectable()
export class CohortService {
  constructor(private prisma: PrismaService) { }

  async findAll(query: AcademyCohortQueryDTO) {
    const and: any[] = [];
    if (query.courseProfileId) and.push({ courseProfileId: query.courseProfileId });
    if (query.status) and.push({ status: query.status });

    if (query.onlyAvailable) {
      const now = new Date();
      and.push({
        status: { notIn: ['DRAFT', 'PENDING_APPROVAL', 'COMPLETED', 'ARCHIVED'] },
        AND: [
          {
            OR: [
              { enrollmentOpenAt: null },
              { enrollmentOpenAt: { lte: now } },
            ],
          },
          {
            OR: [
              { enrollmentCloseAt: null },
              { enrollmentCloseAt: { gte: now } },
            ],
          },
        ],
      });
    }

    if (query.q) {
      and.push({
        OR: [
          { code: { contains: query.q, mode: 'insensitive' } },
          { name: { contains: query.q, mode: 'insensitive' } },
        ],
      });
    }

    const where = and.length > 0 ? { AND: and } : {};

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
    if (data.status === 'PENDING_APPROVAL') {
      throw new BadRequestException(
        'Không thể tạo Đợt khai giảng ở trạng thái Chờ duyệt ngay lập tức. Vui lòng tạo bản nháp và thêm lớp học trước.',
      );
    }

    return this.prisma.cohort.create({
      data: {
        courseProfileId: data.courseProfileId,
        code: data.code,
        name: data.name,
        enrollmentOpenAt: data.enrollmentOpenAt ? new Date(data.enrollmentOpenAt) : null,
        enrollmentCloseAt: data.enrollmentCloseAt ? new Date(data.enrollmentCloseAt) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: (data.status as any) ?? 'DRAFT',
        rejectionReason: (data as any).rejectionReason,
        submittedForApprovalAt:
          data.status === 'PENDING_APPROVAL' ? new Date() : undefined,
      },
    });
  }

  async update(id: string, data: AcademyCohortUpdateDTO) {
    if (data.status === 'PENDING_APPROVAL' || data.status === 'OPENING') {
      await this.validateHasLiveClasses(id);
    }

    return this.prisma.cohort.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
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

  private async validateHasLiveClasses(id: string) {
    const classCount = await this.prisma.liveClass.count({
      where: { cohortId: id },
    });
    if (classCount === 0) {
      throw new BadRequestException(
        'Đợt khai giảng cần có ít nhất 1 Lớp học LIVE trước khi chuyển sang trạng thái này',
      );
    }
  }
}
