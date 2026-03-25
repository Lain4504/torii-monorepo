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

  constructor(private readonly prisma: PrismaService) {}

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
   * Auto transition Cohort status to COMPLETED when registration closes.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCohortRegistrationsClosed() {
    const now = new Date();

    const expired = await this.prisma.cohort.updateMany({
      where: {
        status: 'OPENING',
        enrollmentCloseAt: { lt: now },
      },
      data: { status: 'COMPLETED' },
    });

    if (expired.count > 0) {
      this.logger.log(`Auto-completed ${expired.count} closed cohorts`);
    }
  }
}
