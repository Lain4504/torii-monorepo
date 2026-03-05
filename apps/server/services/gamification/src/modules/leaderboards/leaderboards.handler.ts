import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LEADERBOARDS_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { ILeaderboardsService } from '@server/gamification/interfaces/services';

@Controller()
export class LeaderboardsHandler {
  constructor(
    @Inject(LEADERBOARDS_SERVICE_TOKEN)
    private readonly leaderboardsService: ILeaderboardsService,
  ) {}

  @MessagePattern({ cmd: 'gamification.getLeaderboard' })
  async getLeaderboard(@Payload() data: { userId?: string; type?: string }) {
    if (data.type === 'streak' || data.type === 'weekly') {
      return this.leaderboardsService.getWeeklyLeaderboard(data.userId);
    }
    return this.leaderboardsService.getGlobalLeaderboard(data.userId);
  }

  @MessagePattern({ cmd: 'gamification.leaderboard.global' })
  async getGlobalLeaderboard(@Payload() data: { userId?: string }) {
    return this.leaderboardsService.getGlobalLeaderboard(data.userId);
  }

  @MessagePattern({ cmd: 'gamification.leaderboard.weekly' })
  async getWeeklyLeaderboard(@Payload() data: { userId?: string }) {
    return this.leaderboardsService.getWeeklyLeaderboard(data.userId);
  }
}
