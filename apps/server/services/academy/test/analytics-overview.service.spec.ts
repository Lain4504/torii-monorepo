import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsOverviewService } from '../src/modules/analytics/analytics-overview/analytics-overview.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';

describe('AnalyticsOverviewService', () => {
  let service: AnalyticsOverviewService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      courseProfile: { 
        count: jest.fn(), 
        findMany: jest.fn().mockResolvedValue([{ id: 'cp1', title: 'T1', level: 'N1', thumbnailUrl: null }]) 
      },
      enrollment: { 
        count: jest.fn(), 
        groupBy: jest.fn().mockResolvedValue([]) 
      },
      cohort: { count: jest.fn() },
      vodPackage: { 
        count: jest.fn(), 
        findMany: jest.fn().mockResolvedValue([]) 
      },
      liveScheduleSession: { count: jest.fn() },
      liveClass: { findMany: jest.fn().mockResolvedValue([]) },
      order: { 
        aggregate: jest.fn(),
        findMany: jest.fn().mockResolvedValue([])
      },
      orderItem: {
        findMany: jest.fn().mockResolvedValue([])
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsOverviewService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AnalyticsOverviewService>(AnalyticsOverviewService);
  });

  describe('getLearningOverview', () => {
    it('should aggregate learning metrics', async () => {
      prisma.courseProfile.count.mockImplementation((args: any) => {
        if (args?.where?.status === 'PENDING_APPROVAL') return 5;
        return 50;
      });
      prisma.enrollment.count.mockResolvedValue(100);
      prisma.cohort.count.mockResolvedValue(2);
      prisma.vodPackage.count.mockResolvedValue(3);
      prisma.liveScheduleSession.count.mockResolvedValue(1);

      const result = await service.getLearningOverview();
      expect(result.totalCourses).toBe(50);
      expect(result.totalEnrollments).toBe(100);
      expect(result.pendingApprovals).toBe(10);
      expect(result.activeRooms).toBe(1);
    });
  });

  describe('getBillingOverview', () => {
    it('should return revenue', async () => {
      prisma.order.aggregate.mockResolvedValue({ _sum: { grandTotal: 5000000 } });
      prisma.order.findMany.mockResolvedValue([]);
      prisma.orderItem.findMany.mockResolvedValue([
        { 
          price: 1000, 
          vodPackage: { courseProfile: { level: 'N1' } } 
        }
      ]);

      const result = await service.getBillingOverview();
      expect(result.totalRevenue).toBe(5000000);
      expect(result.revenueByLevel).toContainEqual({ level: 'N1', amount: 1000 });
    });

    it('should handle null summary gracefully', async () => {
      prisma.order.aggregate.mockResolvedValue({ _sum: { grandTotal: null } });
      const result = await service.getBillingOverview();
      expect(result.totalRevenue).toBe(0);
    });
  });
});
