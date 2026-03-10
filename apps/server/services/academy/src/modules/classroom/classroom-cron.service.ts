import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@server/shared/prisma/prisma.service';

@Injectable()
export class ClassroomCronService {
    private readonly logger = new Logger(ClassroomCronService.name);

    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleClassTransitions() {
        this.logger.log('Checking for class state transitions...');
        const now = new Date();

        // 1. DRAFT -> ENROLLING (if openingDate <= now)
        const toEnroll = await this.prisma.class.findMany({
            where: {
                status: 'DRAFT',
                openingDate: { lte: now },
            },
            select: { id: true },
        });
        if (toEnroll.length > 0) {
            await this.prisma.class.updateMany({
                where: { id: { in: toEnroll.map((c) => c.id) } },
                data: { status: 'ENROLLING' },
            });
            this.logger.log(`Activated ${toEnroll.length} classes to ENROLLING`);
        }

        // 2. ENROLLING -> IN_PROGRESS if openingDate <= now (specifically for LIVE, or auto-start VOD)
        const toStart = await this.prisma.class.findMany({
            where: {
                status: 'ENROLLING',
                openingDate: { lte: now },
            },
            select: { id: true },
        });
        if (toStart.length > 0) {
            const result = await this.prisma.class.updateMany({
                where: { id: { in: toStart.map((c) => c.id) } },
                data: { status: 'IN_PROGRESS' },
            });
            this.logger.log(`Started ${result.count} classes`);
        }

        // 3. IN_PROGRESS -> COMPLETED if closingDate <= now
        const toComplete = await this.prisma.class.findMany({
            where: {
                status: 'IN_PROGRESS',
                closingDate: { lte: now },
            },
            select: { id: true },
        });
        if (toComplete.length > 0) {
            const result = await this.prisma.class.updateMany({
                where: { id: { in: toComplete.map((c) => c.id) } },
                data: { status: 'COMPLETED' },
            });
            this.logger.log(`Completed ${result.count} classes`);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleEnrollmentExpirations() {
        this.logger.log('Checking for enrollment expirations...');
        const now = new Date();

        const expired = await this.prisma.enrollment.updateMany({
            where: {
                status: 'ACTIVE',
                expiresAt: { lte: now },
            },
            data: { status: 'EXPIRED' },
        });

        if (expired.count > 0) {
            this.logger.log(`Expired ${expired.count} enrollments`);
        }
    }
}
