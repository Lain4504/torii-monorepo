import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';

@Controller()
export class AnalyticsHandler {
    constructor(private readonly prisma: PrismaService) { }

    @MessagePattern({ cmd: 'billing.analytics.overview' })
    async getOverview() {
        const revenueResult = await this.prisma.order.aggregate({
            where: { status: 'completed' },
            _sum: { amount: true }
        });

        const totalRevenue = revenueResult._sum.amount ? Number(revenueResult._sum.amount) : 0;

        const recentSales = await this.prisma.order.findMany({
            where: { status: 'completed' },
            orderBy: { completedAt: 'desc' },
            take: 5,
            include: {
                user: {
                    select: {
                        displayName: true,
                        email: true,
                        avatarUrl: true
                    }
                }
            }
        });

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const sales = await this.prisma.order.findMany({
            where: {
                status: 'completed',
                completedAt: { gte: sixMonthsAgo }
            },
            include: {
                enrollment: {
                    include: {
                        courseRun: {
                            include: {
                                courseMaster: { select: { jlptLevel: true } }
                            }
                        }
                    }
                }
            }
        });

        const growthData = sales.reduce((acc: any, sale) => {
            if (!sale.completedAt) return acc;
            const month = sale.completedAt.toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + Number(sale.amount);
            return acc;
        }, {});

        const revenueByLevel = sales.reduce((acc: any, sale) => {
            const level = sale.enrollment?.courseRun?.courseMaster?.jlptLevel || 'Other';
            acc[level] = (acc[level] || 0) + Number(sale.amount);
            return acc;
        }, {});

        return {
            totalRevenue,
            recentSales: recentSales.map(s => ({
                id: s.id,
                amount: s.amount,
                userName: s.user.displayName,
                userEmail: s.user.email,
                date: s.completedAt
            })),
            growthData: Object.entries(growthData).map(([name, total]) => ({ name, total })),
            revenueByLevel: Object.entries(revenueByLevel).map(([level, amount]) => ({ level, amount }))
        };
    }
}
