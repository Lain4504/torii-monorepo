import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ClassCreateDto, ClassQueryDto, ClassUpdateDto } from './dto/class.dto';

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) {}

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
    await this.findById(id);
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

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.class.delete({ where: { id } });
    return { ok: true };
  }
}

