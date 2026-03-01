import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CourseRunStatus } from '@workspace/schemas';
import type { ICourseRunRepository } from '../../../interfaces/repositories/i-course-run.repository';
import { COURSE_RUN_REPOSITORY_TOKEN } from '../../../interfaces/repositories';

/**
 * Course Run Scheduler
 * Handles scheduled tasks for course run management
 */
@Injectable()
export class CourseRunScheduler {
    private readonly logger = new Logger(CourseRunScheduler.name);

    constructor(
        @Inject(COURSE_RUN_REPOSITORY_TOKEN)
        private readonly courseRunRepository: ICourseRunRepository,
    ) { }

    /**
     * Auto-cancel course runs with insufficient enrollment
     * Runs every hour to check course runs that passed enrollment deadline
     */
    @Cron('0 * * * *', {
        name: 'auto-handle-expired-enrollment',
        timeZone: 'Asia/Ho_Chi_Minh',
    })
    async handleExpiredEnrollment() {
        this.logger.log('🕐 Auto-handle expired enrollment course runs triggered (hourly)');
        try {
            const courseRuns = await this.courseRunRepository.findExpiredEnrollmentCourseRuns();

            if (courseRuns.length === 0) {
                this.logger.log('✅ No course runs with expired enrollment to process');
                return;
            }

            let cancelledCount = 0;
            let stayCount = 0;

            for (const run of courseRuns) {
                try {
                    // Logic: If enrolled students < min students, cancel/postpone
                    const minStudents = run.minStudents ?? 0;
                    if (run.totalStudents < minStudents) {
                        // For now, move to CANCELLED_BY_SYSTEM or POSTPONED
                        // We choose CANCELLED_BY_SYSTEM for now, can be adjusted based on business rules
                        await this.courseRunRepository.update(run.id, {
                            status: CourseRunStatus.CANCELLED_BY_SYSTEM,
                            updatedAt: new Date(),
                        });
                        this.logger.log(`🚫 Course run ${run.id} cancelled due to insufficient enrollment (${run.totalStudents}/${run.minStudents})`);
                        cancelledCount++;
                    } else {
                        // Enrolling period ended but we have enough students
                        // We might want to move it to PLANNING or just keep it until startDate
                        // Business flow says it should move to PLANNING or keep ENROLLING but closed?
                        // Prisma status only has ENROLLING -> IN_PROGRESS. 
                        // Let's just keep it as is, it's just no longer joinable by learners (enforce in enrollment service)
                        stayCount++;
                    }
                } catch (error: any) {
                    this.logger.error(`Failed to process course run ${run.id}: ${error?.message}`);
                }
            }

            this.logger.log(`✅ Auto-handle expired enrollment completed: ${cancelledCount} cancelled, ${stayCount} kept active`);
        } catch (error: any) {
            this.logger.error(`❌ Error in course run scheduler: ${error?.message}`, error?.stack);
        }
    }
}
