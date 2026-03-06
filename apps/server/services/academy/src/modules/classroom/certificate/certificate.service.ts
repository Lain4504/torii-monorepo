import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CertificateService {
    constructor(private readonly prisma: PrismaService) { }

    async generateForEnrollment(enrollmentId: string) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { class: true, user: true },
        });

        if (!enrollment) throw new NotFoundException('Enrollment not found');
        if (enrollment.status !== 'COMPLETED') {
            console.warn(`[Academy] Cannot generate certificate for non-completed enrollment: ${enrollmentId}`);
            return;
        }

        const existing = await this.prisma.certificate.findUnique({
            where: { enrollmentId },
        });
        if (existing) return existing;

        const certificateCode = `CERT-${enrollment.class.code}-${enrollment.user.id.substring(0, 8)}-${Date.now()}`.toUpperCase();

        return this.prisma.certificate.create({
            data: {
                userId: enrollment.userId,
                classId: enrollment.classId,
                enrollmentId: enrollment.id,
                certificateCode,
                issueDate: new Date(),
                fileUrl: '', // TODO: integrate with PDF generation service later
                metadata: {
                    courseTitle: (enrollment.class as any).name,
                    username: (enrollment.user as any).name,
                } as any,
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
