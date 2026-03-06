import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ExamAttemptService } from './exam-attempt/exam-attempt.service';
import { AuditLoggerService } from '../audit-logger.service';

@Injectable()
export class AssessmentCronService {
    private readonly logger = new Logger(AssessmentCronService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly examAttemptService: ExamAttemptService,
        private readonly audit: AuditLoggerService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleExamAttemptTimeouts() {
        this.logger.log('Checking for timed-out exam attempts...');
        const now = new Date();

        const attempts = await this.prisma.examAttempt.findMany({
            where: {
                status: 'IN_PROGRESS',
                deadlineAt: { lte: now },
            },
        });

        for (const attempt of attempts) {
            this.logger.log(`Auto-submitting timed out attempt: ${attempt.id}`);

            try {
                await this.examAttemptService.submit({ attemptId: attempt.id });

                await this.audit.log({
                    userId: 'SYSTEM',
                    action: 'exam.auto_submit',
                    entity: 'ExamAttempt',
                    entityId: attempt.id,
                    description: `Auto-submitted timed-out exam attempt ${attempt.id}`,
                    metadata: { reason: 'timeout' },
                });
            } catch (error) {
                this.logger.error(`Failed to auto-submit attempt ${attempt.id}:`, error.message);
            }
        }
    }
}
