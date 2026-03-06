import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ILeaderboardsService } from '@server/gamification/interfaces/services';
import type { ILeaderboardsRepository } from '@server/gamification/interfaces/repositories';
import { LEADERBOARDS_REPOSITORY_TOKEN } from '@server/gamification/interfaces/repositories';
import { LeaderboardDto, LeaderboardUserDto } from '@workspace/schemas';
import { PROFILES_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IProfilesService } from '@server/gamification/interfaces/services';

@Injectable()
export class LeaderboardsService implements ILeaderboardsService {
  private readonly logger = new Logger(LeaderboardsService.name);

  constructor(
    @Inject(LEADERBOARDS_REPOSITORY_TOKEN)
    private readonly leaderboardsRepository: ILeaderboardsRepository,
    @Inject(PROFILES_SERVICE_TOKEN)
    private readonly profilesService: IProfilesService,
  ) {}

  async getGlobalLeaderboard(userId?: string): Promise<LeaderboardDto> {
    const topGamification = await this.leaderboardsRepository.getTopByXp(100);

    const users: LeaderboardUserDto[] = topGamification.map((g, index) => ({
      id: g.user.id,
      displayName: g.user.displayName,
      avatarUrl: g.user.avatarUrl,
      xp: g.totalXp,
      level: g.level,
      rank: index + 1,
      currentStreak: g.currentStreak,
    }));

    let currentUser: LeaderboardUserDto | undefined;
    if (userId) {
      const index = users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        currentUser = users[index];
      } else {
        const profile =
          await this.profilesService.getGamificationProfile(userId);
        const rank = await this.leaderboardsRepository.getUserXpRank(userId);
        currentUser = {
          id: profile.userId,
          displayName: '', // Would need user repo for this, or just return basic
          avatarUrl: null,
          xp: profile.totalXp,
          level: profile.level,
          rank,
          currentStreak: profile.currentStreak,
        };
      }
    }

    const totalUsers = await this.leaderboardsRepository.countLearners();

    return {
      users,
      currentUser,
      totalUsers,
      type: 'global',
    };
  }

  async getWeeklyLeaderboard(userId?: string): Promise<LeaderboardDto> {
    const topStreaks =
      await this.leaderboardsRepository.getTopByWeeklyStreak(100);

    const users: LeaderboardUserDto[] = topStreaks.map((g, index) => ({
      id: g.user.id,
      displayName: g.user.displayName,
      avatarUrl: g.user.avatarUrl,
      xp: g.totalXp,
      level: g.level,
      rank: index + 1,
      currentStreak: g.currentStreak,
    }));

    let currentUser: LeaderboardUserDto | undefined;
    if (userId) {
      const index = users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        currentUser = users[index];
      } else {
        const profile =
          await this.profilesService.getGamificationProfile(userId);
        const rank =
          await this.leaderboardsRepository.getUserWeeklyRank(userId);
        currentUser = {
          id: profile.userId,
          displayName: '',
          avatarUrl: null,
          xp: profile.totalXp,
          level: profile.level,
          rank,
          currentStreak: profile.currentStreak,
        };
      }
    }

    const totalUsers = await this.leaderboardsRepository.countLearners({
      gamification: { weeklyActiveCount: { gt: 0 } },
    });

    return {
      users,
      currentUser,
      totalUsers,
      type: 'streak', // Keeping 'streak' as type for weekly leaderboard per legacy
    };
  }
}
