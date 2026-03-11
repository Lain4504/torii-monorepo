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
      include: { class: true },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.certificate.findUnique({
      where: { id },
      include: { class: true, user: true },
    });
    if (!item) throw new NotFoundException('Certificate not found');
    return item;
  }
}
