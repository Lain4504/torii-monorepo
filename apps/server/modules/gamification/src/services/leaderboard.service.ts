import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';

@Injectable()
export class LeaderboardService {
    private readonly logger = new Logger(LeaderboardService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get weekly leaderboard for a specific league
     */
    async getWeeklyLeaderboard(leagueId?: string) {
        // If no leagueId, get the first one (Bronze)
        let targetLeagueId = leagueId;
        if (!targetLeagueId) {
            const firstLeague = await this.prisma.league.findFirst({
                orderBy: { orderIndex: 'asc' },
            });
            targetLeagueId = firstLeague?.id;
        }

        if (!targetLeagueId) return [];

        return this.prisma.user.findMany({
            where: { leagueId: targetLeagueId },
            orderBy: { currentWeekXp: 'desc' },
            take: 50,
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                currentWeekXp: true,
                leagueId: true,
            },
        });
    }

    /**
     * Get user's position and surrounding competitors
     */
    async getUserRank(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, leagueId: true, currentWeekXp: true },
        });

        if (!user || !user.leagueId) return null;

        const competitors = await this.getWeeklyLeaderboard(user.leagueId);
        const rank = competitors.findIndex(c => c.id === userId) + 1;

        return {
            rank,
            totalCompetitors: competitors.length,
            competitors,
        };
    }

    /**
     * Weekly Reset Job (Cron)
     * Resets weekly XP, handles promotion/demotion
     */
    async handleWeeklyReset() {
        this.logger.log('Starting weekly leaderboard reset...');

        const leagues = await this.prisma.league.findMany({
            orderBy: { orderIndex: 'asc' },
        });

        for (const league of leagues) {
            const users = await this.prisma.user.findMany({
                where: { leagueId: league.id },
                orderBy: { currentWeekXp: 'desc' },
            });

            if (users.length === 0) continue;

            // Promotion logic (Top 10)
            const topUsers = users.slice(0, 10);
            const nextLeague = leagues.find(l => l.orderIndex === league.orderIndex + 1);
            if (nextLeague) {
                await this.prisma.user.updateMany({
                    where: { id: { in: topUsers.map(u => u.id) } },
                    data: { leagueId: nextLeague.id },
                });
                this.logger.log(`Promoted ${topUsers.length} users to ${nextLeague.name}`);
            }

            // Demotion logic (Bottom 5, only if not in lowest league)
            if (league.orderIndex > 0) {
                const bottomUsers = users.slice(-5);
                const prevLeague = leagues.find(l => l.orderIndex === league.orderIndex - 1);
                if (prevLeague) {
                    await this.prisma.user.updateMany({
                        where: { id: { in: bottomUsers.map(u => u.id) } },
                        data: { leagueId: prevLeague.id },
                    });
                    this.logger.log(`Demoted ${bottomUsers.length} users to ${prevLeague.name}`);
                }
            }
        }

        // Final step: Reset all currentWeekXp to 0
        await this.prisma.user.updateMany({
            data: { currentWeekXp: 0 },
        });

        this.logger.log('Weekly leaderboard reset completed.');
    }
}
