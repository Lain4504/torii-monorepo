import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { UserGamification, Prisma } from '@prisma/generated';
import type { IProfilesRepository } from '@server/gamification/interfaces/repositories';

@Injectable()
export class ProfilesRepository implements IProfilesRepository {
    private readonly logger = new Logger(ProfilesRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findByUserId(userId: string): Promise<UserGamification | null> {
        return this.prisma.userGamification.findUnique({
            where: { userId },
        });
    }

    async upsert(userId: string, data: Prisma.UserGamificationUpdateInput, create: Omit<Prisma.UserGamificationCreateInput, 'user'>): Promise<UserGamification> {
        return this.prisma.userGamification.upsert({
            where: { userId },
            update: data,
            create: {
                ...create,
                user: { connect: { id: userId } },
            } as any,
        });
    }

    async update(userId: string, data: Prisma.UserGamificationUpdateInput): Promise<UserGamification> {
        return this.prisma.userGamification.update({
            where: { userId },
            data,
        });
    }

    async findUsersAtRiskOfStreakReset(twoDaysAgo: string): Promise<UserGamification[]> {
        return this.prisma.userGamification.findMany({
            where: {
                lastActiveDate: {
                    equals: twoDaysAgo,
                },
                currentStreak: {
                    gt: 0,
                },
            },
        });
    }

    async incrementActiveCounts(userId: string, isSameWeek: boolean, isSameMonth: boolean): Promise<UserGamification> {
        return this.prisma.userGamification.update({
            where: { userId },
            data: {
                totalActiveDays: { increment: 1 },
                weeklyActiveCount: isSameWeek ? { increment: 1 } : 1,
                monthlyActiveCount: isSameMonth ? { increment: 1 } : 1,
            },
        });
    }
}
