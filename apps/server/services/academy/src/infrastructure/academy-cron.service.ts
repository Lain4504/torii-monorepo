import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@server/shared/prisma/prisma.service';

@Injectable()
export class AcademyCronService {
    private readonly logger = new Logger(AcademyCronService.name);

    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleClassTransitions() {
        this.logger.log('Running class lifecycle transitions...');
        const now = new Date();

        // DRAFT -> ENROLLING (if enrollmentOpenAt reached)
        const enrolling = await this.prisma.class.updateMany({
            where: {
                status: 'DRAFT',
                enrollmentOpenAt: { lte: now },
            },
            data: { status: 'ENROLLING' },
        });
        if (enrolling.count > 0) this.logger.log(`Activated ${enrolling.count} classes to ENROLLING`);

        // ENROLLING -> IN_PROGRESS (if startDate reached)
        const starting = await this.prisma.class.updateMany({
            where: {
                status: 'ENROLLING',
                startDate: { lte: now },
            },
            data: { status: 'IN_PROGRESS' },
        });
        if (starting.count > 0) this.logger.log(`Started ${starting.count} classes to IN_PROGRESS`);

        // IN_PROGRESS -> COMPLETED (if endDate passed)
        const completing = await this.prisma.class.updateMany({
            where: {
                status: 'IN_PROGRESS',
                endDate: { lte: now },
            },
            data: { status: 'COMPLETED' },
        });
        if (completing.count > 0) this.logger.log(`Completed ${completing.count} classes`);
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleExamAttemptTimeouts() {
        const now = new Date();

        // Find IN_PROGRESS attempts where duration is exceeded
        // We join with Exam to get totalTimeLimitMinutes
        const attemptsToSubmit = await this.prisma.examAttempt.findMany({
            where: {
                status: 'IN_PROGRESS',
                exam: {
                    totalTimeLimitMinutes: { not: null },
                },
            },
            include: { exam: true },
        });

        for (const attempt of attemptsToSubmit) {
            const limitMinutes = attempt.exam.totalTimeLimitMinutes;
            if (!limitMinutes) continue;

            const startTime = new Date(attempt.startedAt);
            const expiryTime = new Date(startTime.getTime() + limitMinutes * 60000);

            if (now > expiryTime) {
                this.logger.log(`Auto-submitting expired exam attempt: ${attempt.id}`);
                await this.prisma.examAttempt.update({
                    where: { id: attempt.id },
                    data: {
                        status: 'SUBMITTED',
                        submittedAt: now,
                        completedAt: now,
                    },
                });
            }
        }
    }
}
