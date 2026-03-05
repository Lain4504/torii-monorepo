import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { EnrollmentCreateDto, EnrollmentQueryDto } from './dto/enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: EnrollmentQueryDto) {
    return this.prisma.enrollment.findMany({
      where: {
        classId: query.classId ?? undefined,
        userId: query.userId ?? undefined,
        status: query.status ?? undefined,
      },
      orderBy: [{ enrolledAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.enrollment.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Enrollment not found');
    return item;
  }

  async create(input: EnrollmentCreateDto) {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    });
    if (!user) throw new BadRequestException('Invalid userId');

    const existing = await this.prisma.enrollment.findFirst({
      where: { classId: input.classId, userId: input.userId },
      select: { id: true },
    });
    if (existing) return this.findById(existing.id);

    return this.prisma.enrollment.create({
      data: {
        classId: input.classId,
        userId: input.userId,
        expiresAt: input.expiresAt,
        status: input.status ?? 'ACTIVE',
        sourceOfferingId: input.sourceOfferingId,
        companyId: input.companyId,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findById(id);
    return this.prisma.enrollment.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.enrollment.delete({ where: { id } });
    return { ok: true };
  }
}

