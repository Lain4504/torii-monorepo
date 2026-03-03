import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { EnrollmentStatus } from '@workspace/schemas';
import type { IEnrollmentRepository } from '@server/learning/interfaces/repositories';
import { ENROLLMENT_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';

/**
 * Enrollment Expiration Scheduler
 * Handles automated cleanup of expired course enrollments
 */
@Injectable()
export class EnrollmentExpirationScheduler {
    private readonly logger = new Logger(EnrollmentExpirationScheduler.name);

    constructor(
        @Inject(ENROLLMENT_REPOSITORY_TOKEN)
        private readonly enrollmentRepository: IEnrollmentRepository,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Daily job to mark old enrollments as EXPIRED
     * Runs at midnight (UTC)
     */
    @Cron('0 0 * * *', {
        name: 'auto-expire-enrollments',
    })
    async handleAutoExpireEnrollments() {
        this.logger.log('🕒 Enrollment Expiration cronjob triggered (00:00 daily)');
        try {
            // Find enrollments where expiresAt < NOW and status is IN_PROGRESS or COMPLETED
            // Note: Even COMPLETED courses might expire if the business model dictates.
            const expiredItems = await this.enrollmentRepository.findMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                    completionStatus: {
                        not: EnrollmentStatus.EXPIRED as any,
                    },
                },
                skip: 0,
                take: 1000, // Batch limit
            });

            if (expiredItems.length === 0) {
                this.logger.log('✅ No enrollments waiting for expiration update');
                return;
            }

            let updatedCount = 0;
            for (const item of expiredItems) {
                try {
                    await this.enrollmentRepository.update(item.id, {
                        completionStatus: EnrollmentStatus.EXPIRED as any,
                    });
                    
                    // Emit event for notification service
                    this.natsClient.emit({ cmd: 'course_access_expired' }, {
                        userId: item.userId,
                        courseRunId: item.courseRunId,
                        enrollmentId: item.id,
                        expiredAt: item.expiresAt,
                    });

                    updatedCount++;
                } catch (error: any) {
                    this.logger.error(`Failed to expire enrollment ${item.id}: ${error?.message}`);
                }
            }

            this.logger.log(`✅ Auto-expire completed: ${updatedCount}/${expiredItems.length} enrollments marked as EXPIRED`);
        } catch (error: any) {
            this.logger.error(`❌ Error in enrollment expiration cronjob: ${error?.message}`, error?.stack);
        }
    }
}
