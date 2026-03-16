import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';

@Injectable()
export class CertificateService {
  constructor(private readonly prisma: PrismaService) {}

  async generateForEnrollment(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        class: {
          select: { id: true, code: true, name: true },
        },
        user: {
          select: { id: true, displayName: true },
        },
      },
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status !== 'COMPLETED') {
      console.warn(
        `[Academy] Cannot generate certificate for non-completed enrollment: ${enrollmentId}`,
      );
      return;
    }

    const existing = await this.prisma.certificate.findUnique({
      where: { enrollmentId },
    });
    if (existing) return existing;

    const classCode = enrollment.class?.code ?? 'CLASS';
    const userPrefix = enrollment.user.id.substring(0, 8);
    const certificateCode = `CERT-${classCode}-${userPrefix}-${Date.now()}`.toUpperCase();

    return this.prisma.certificate.create({
      data: {
        userId: enrollment.userId,
        classId: enrollment.classId!,
        enrollmentId: enrollment.id,
        certificateCode,
        issueDate: new Date(),
        fileUrl: '', // TODO: integrate with PDF generation service later
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        class: true,
        enrollment: true,
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  async findAll(query?: {
    page?: string | number;
    limit?: string | number;
    userId?: string;
    classId?: string;
  }) {
    const page = Math.max(1, Number(query?.page ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit ?? 20) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.userId) where.userId = query.userId;
    if (query?.classId) where.classId = query.classId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.certificate.findMany({
        where,
        include: {
          class: true,
          enrollment: true,
          user: { select: { id: true, displayName: true, avatarUrl: true } },
        },
        orderBy: { issueDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.certificate.count({ where }),
    ]);

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string) {
    const item = await this.prisma.certificate.findUnique({
      where: { id },
      include: { class: true, user: true, enrollment: true },
    });
    if (!item) throw new NotFoundException('Certificate not found');
    return item;
  }

  async verifyByCode(code: string) {
    const item = await this.prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        class: true,
        user: { select: { id: true, displayName: true, avatarUrl: true } },
        enrollment: true,
      },
    });
    if (!item) return { valid: false };
    return { valid: true, certificate: item };
  }
}
