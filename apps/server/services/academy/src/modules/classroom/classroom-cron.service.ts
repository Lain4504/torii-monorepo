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

        // ENROLLING -> IN_PROGRESS: Class starts if now >= startDate
        // For VOD classes, they might stay ENROLLING or move to IN_PROGRESS upon first student activity?
        // core-lms says VOD classes transition to IN_PROGRESS when enrollment opens.

        // VOD classes: ENROLLING -> IN_PROGRESS if enrollmentOpenAt <= now
        const vodToStart = await this.prisma.class.updateMany({
            where: {
                mode: 'VOD',
                status: 'ENROLLING',
                enrollmentOpenAt: { lte: now },
            },
            data: { status: 'IN_PROGRESS' },
        });
        if (vodToStart.count > 0) this.logger.log(`Moved ${vodToStart.count} VOD classes to IN_PROGRESS`);

        // LIVE/BLENDED: ENROLLING -> IN_PROGRESS if startDate <= now
        const liveToStart = await this.prisma.class.updateMany({
            where: {
                mode: { in: ['LIVE', 'BLENDED'] },
                status: 'ENROLLING',
                startDate: { lte: now },
            },
            data: { status: 'IN_PROGRESS' },
        });
        if (liveToStart.count > 0) this.logger.log(`Started ${liveToStart.count} LIVE/BLENDED classes`);

        // IN_PROGRESS -> COMPLETED if endDate <= now
        const toComplete = await this.prisma.class.updateMany({
            where: {
                status: 'IN_PROGRESS',
                endDate: { lte: now },
            },
            data: { status: 'COMPLETED' },
        });
        if (toComplete.count > 0) this.logger.log(`Completed ${toComplete.count} classes`);
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
