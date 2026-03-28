import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@server/shared/prisma/prisma.service';

/**
 * V2: Status transitions are manual (admin-driven).
 * The cron only handles:
 * - Expiring ACTIVE enrollments that have passed expiresAt.
 */
@Injectable()
export class ClassroomCronService {
  private readonly logger = new Logger(ClassroomCronService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Expire enrollments where expiresAt <= now (VOD time-limited access).
   */
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

  /**
   * Auto transition Cohort status to COMPLETED (and its classes) when registration closes.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCohortRegistrationsClosed() {
    const now = new Date();

    // 1. Find all OPENING cohorts whose enrollment closed
    const cohortsToStart = await this.prisma.cohort.findMany({
      where: {
        status: 'OPENING',
        enrollmentCloseAt: { lte: now },
      },
      select: { id: true },
    });

    if (cohortsToStart.length === 0) return;

    const cohortIds = cohortsToStart.map((c) => c.id);

    // 2. Transition Cohorts to COMPLETED
    await this.prisma.cohort.updateMany({
      where: { id: { in: cohortIds } },
      data: { status: 'COMPLETED' },
    });

    // 3. Transition associated LiveClasses to COMPLETED (if they were OPENING)
    const classesStarted = await this.prisma.liveClass.updateMany({
      where: {
        cohortId: { in: cohortIds },
        status: 'OPENING',
      },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(
      `Auto-completed ${cohortIds.length} cohorts and ${classesStarted.count} live classes due to registration closure`,
    );
  }

}
