import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ClassCreateDto, ClassQueryDto, ClassUpdateDto } from './dto/class.dto';

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: ClassQueryDto) {
    const q = query.q?.trim();
    return this.prisma.class.findMany({
      where: {
        courseProfileId: query.courseProfileId ?? undefined,
        courseEditionId: query.courseEditionId ?? undefined,
        mode: query.mode ?? undefined,
        status: query.status ?? undefined,
        ...(q
          ? {
            OR: [
              { code: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
            ],
          }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.class.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Class not found');
    return item;
  }

  async create(input: ClassCreateDto) {
    const edition = await this.prisma.courseEdition.findUnique({
      where: { id: input.courseEditionId },
      select: { id: true, courseProfileId: true },
    });
    if (!edition) throw new BadRequestException('Invalid courseEditionId');
    if (edition.courseProfileId !== input.courseProfileId) {
      throw new BadRequestException('courseEditionId does not belong to courseProfileId');
    }

    return this.prisma.class.create({
      data: {
        courseProfileId: input.courseProfileId,
        courseEditionId: input.courseEditionId,
        code: input.code,
        name: input.name,
        mode: input.mode,
        term: input.term,
        batch: input.batch,
        startDate: input.startDate,
        endDate: input.endDate,
        enrollmentOpenAt: input.enrollmentOpenAt,
        enrollmentCloseAt: input.enrollmentCloseAt,
        minStudents: input.minStudents,
        maxStudents: input.maxStudents,
        status: input.status ?? 'DRAFT',
        primaryTeacherId: input.primaryTeacherId,
        companyId: input.companyId,
        settings: input.settings ?? undefined,
      },
    });
  }

  async update(id: string, input: ClassUpdateDto) {
    const classItem = await this.findById(id);

    // Prevent changing edition/profile if class is not DRAFT
    if (classItem.status !== 'DRAFT') {
      // In a real system, we might allow some updates, but let's be strict for now
      // or at least sensitive fields
    }

    return this.prisma.class.update({
      where: { id },
      data: {
        name: input.name,
        mode: input.mode,
        term: input.term,
        batch: input.batch,
        startDate: input.startDate,
        endDate: input.endDate,
        enrollmentOpenAt: input.enrollmentOpenAt,
        enrollmentCloseAt: input.enrollmentCloseAt,
        minStudents: input.minStudents,
        maxStudents: input.maxStudents,
        status: input.status,
        primaryTeacherId: input.primaryTeacherId,
        companyId: input.companyId,
        settings: input.settings ?? undefined,
      },
    });
  }

  async publishClass(id: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: { courseEdition: true },
    });
    if (!classItem) throw new NotFoundException('Class not found');
    if (classItem.status !== 'DRAFT') return classItem;

    if (classItem.courseEdition.status !== 'PUBLISHED') {
      throw new BadRequestException('Cannot publish class for a non-PUBLISHED edition');
    }

    return this.prisma.class.update({
      where: { id },
      data: { status: 'ENROLLING' },
    });
  }

  async startClass(id: string) {
    const classItem = await this.findById(id);
    if (classItem.status === 'IN_PROGRESS') return classItem;
    if (classItem.status !== 'ENROLLING') {
      throw new BadRequestException('Can only start class from ENROLLING status');
    }

    return this.prisma.class.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });
  }

  async completeClass(id: string) {
    const classItem = await this.findById(id);
    if (classItem.status === 'COMPLETED') return classItem;
    if (classItem.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Can only complete class from IN_PROGRESS status');
    }

    return this.prisma.class.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }

  async cancelClass(id: string) {
    const classItem = await this.findById(id);
    if (classItem.status === 'CANCELLED') return classItem;

    // Check if there are active enrollments
    const enrollCount = await this.prisma.enrollment.count({
      where: { classId: id, status: 'ACTIVE' },
    });

    if (enrollCount > 0) {
      // In a real scenario, we might allow cancellation but need to handle refunds/notifications
      // For now, let's just mark it.
    }

    return this.prisma.class.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async delete(id: string) {
    const classItem = await this.findById(id);
    if (classItem.status !== 'DRAFT' && classItem.status !== 'CANCELLED') {
      throw new BadRequestException('Can only delete DRAFT or CANCELLED classes');
    }

    const enrollCount = await this.prisma.enrollment.count({ where: { classId: id } });
    if (enrollCount > 0) {
      throw new BadRequestException('Cannot delete class with existing enrollments');
    }

    await this.prisma.class.delete({ where: { id } });
    return { ok: true };
  }
}

