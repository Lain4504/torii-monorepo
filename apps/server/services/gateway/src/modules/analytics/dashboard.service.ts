import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '@server/shared';
import type {
  AdminDashboardResponseDTO,
  DashboardChartDatum,
  StaffAcademicDashboardResponseDTO,
  StaffOperationsDashboardResponseDTO,
} from '@workspace/schemas';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async getStaffAcademicDashboard(): Promise<StaffAcademicDashboardResponseDTO> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const [totalCourses, totalEnrollments, activeRooms] = await Promise.all([
      this.prisma.courseProfile.count({
        where: { status: { not: 'ARCHIVED' } },
      }),
      this.prisma.enrollment.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.liveScheduleSession.count({
        where: {
          sessionDate: { gte: startOfToday, lt: startOfTomorrow },
          status: { in: ['SCHEDULED', 'RESCHEDULED'] },
          roomId: { not: null },
        },
      }),
    ]);

    const [pendingCourseProfiles, pendingCohorts, pendingVodPackages] =
      await Promise.all([
        this.prisma.courseProfile.count({
          where: { status: 'PENDING_APPROVAL' },
        }),
        this.prisma.cohort.count({
          where: { status: 'PENDING_APPROVAL' },
        }),
        this.prisma.vodPackage.count({
          where: { status: 'PENDING_APPROVAL' },
        }),
      ]);

    const pendingApprovals =
      pendingCourseProfiles + pendingCohorts + pendingVodPackages;

    const [courseGroups, cohortGroups, vodGroups] = await Promise.all([
      this.prisma.courseProfile.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.cohort.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.vodPackage.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const pipelineByStatus = this.mergeGroupCounts([
      ...courseGroups.map((g) => ({
        status: g.status as string,
        count: g._count._all,
      })),
      ...cohortGroups.map((g) => ({
        status: g.status as string,
        count: g._count._all,
      })),
      ...vodGroups.map((g) => ({
        status: g.status as string,
        count: g._count._all,
      })),
    ]).sort((a, b) => b.value - a.value);

    const pendingApprovalsByType: DashboardChartDatum[] = [
      { name: 'Course Profiles', value: pendingCourseProfiles },
      { name: 'Cohorts', value: pendingCohorts },
      { name: 'VOD Packages', value: pendingVodPackages },
    ].sort((a, b) => b.value - a.value);

    return {
      stats: {
        totalCourses,
        totalEnrollments,
        activeRooms,
        pendingApprovals,
      },
      pendingApprovalsByType,
      pipelineByStatus,
    };
  }

  async getStaffOperationsDashboard(): Promise<StaffOperationsDashboardResponseDTO> {
    const billingOverview = await firstValueFrom(
      this.natsClient.send({ cmd: 'billing.analytics.overview' }, {}),
    );

    const ticketStats = await firstValueFrom(
      this.natsClient.send({ cmd: 'academy.analytics.tickets' }, {}),
    );

    const ordersByStatusGroups = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const ordersByStatus: DashboardChartDatum[] = ordersByStatusGroups
      .map((g) => ({ name: g.status as string, value: g._count._all }))
      .sort((a, b) => b.value - a.value);

    const paidOrders = await this.prisma.order.count({
      where: { status: 'PAID' },
    });

    return {
      stats: {
        totalRevenue: Number(billingOverview?.totalRevenue ?? 0),
        pendingTickets: ticketStats?.pendingCount ?? 0,
        pendingRefunds: ticketStats?.refundCount ?? 0,
        paidOrders,
      },
      ordersByStatus,
      revenueByLevel: (billingOverview?.revenueByLevel ?? []).map((r: any) => ({
        level: String(r.level),
        amount: Number(r.amount ?? 0),
      })),
      recentSales: (billingOverview?.recentSales ?? []).map((s: any) => ({
        id: String(s.id),
        amount: String(s.amount ?? '0'),
        userName: String(s.userName ?? ''),
        userEmail: String(s.userEmail ?? ''),
        date: String(s.date ?? ''),
      })),
    };
  }

  async getAdminDashboard(): Promise<AdminDashboardResponseDTO> {
    const [staffAcademic, staffOperations] = await Promise.all([
      this.getStaffAcademicDashboard(),
      this.getStaffOperationsDashboard(),
    ]);

    return {
      staffAcademic,
      staffOperations,
    };
  }

  private mergeGroupCounts(
    groups: { status: string; count: number }[],
  ): DashboardChartDatum[] {
    const map = new Map<string, number>();
    for (const g of groups) {
      const prev = map.get(g.status) ?? 0;
      map.set(g.status, prev + g.count);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }
}

