import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { IRedemptionsRepository } from '@server/gamification/interfaces/repositories';

@Injectable()
export class RedemptionsRepository implements IRedemptionsRepository {
    private readonly logger = new Logger(RedemptionsRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAllRewards() {
        return this.prisma.pointReward.findMany({
            where: { isActive: true },
            orderBy: { points: 'asc' },
        });
    }

    async findRewardById(id: string) {
        return this.prisma.pointReward.findUnique({
            where: { id },
        });
    }

    async findUserHistory(userId: string) {
        return this.prisma.gamificationHistory.findMany({
            where: {
                userId,
                type: 'REDEEM' as any,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
