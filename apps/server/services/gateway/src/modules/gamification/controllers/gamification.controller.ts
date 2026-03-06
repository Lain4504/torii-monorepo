import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  successResponse,
  errorResponse,
  ReqWithRequester,
  Permissions,
  PermissionsGuard,
  GatewayAuthGuard,
} from '@server/shared';

@Controller('api/gamification')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class GamificationController {
  private readonly logger = new Logger(GamificationController.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Get('profile')
  async getProfile(@Req() req: ReqWithRequester) {
    const user = req.requester;
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.getProfile', { userId: user.sub }),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Failed to get gamification profile for user ${user?.sub}`,
        error.stack,
      );
      return errorResponse(
        error.message || 'Failed to fetch gamification profile',
      );
    }
  }

  @Get('leaderboard')
  async getLeaderboard(@Req() req: ReqWithRequester) {
    const user = req.requester;
    const type = (req.query.type as string) || 'global';
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.getLeaderboard', {
          userId: user.sub,
          type,
        }),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Failed to get leaderboard for user ${user?.sub}`,
        error.stack,
      );
      return errorResponse(error.message || 'Failed to fetch leaderboard');
    }
  }

  @Get('streak')
  async getStreak(@Req() req: ReqWithRequester) {
    const user = req.requester;
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.getStreak', { userId: user.sub }),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Failed to get streak for user ${user?.sub}`,
        error.stack,
      );
      return errorResponse(error.message || 'Failed to fetch streak status');
    }
  }

  @Get('achievements')
  async getAchievements(@Req() req: ReqWithRequester) {
    const user = req.requester;
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.getAchievements', {
          userId: user.sub,
        }),
      );
      return successResponse({ achievements: result });
    } catch (error: any) {
      this.logger.error(
        `Failed to get achievements for user ${user?.sub}`,
        error.stack,
      );
      return errorResponse(error.message || 'Failed to fetch achievements');
    }
  }

  @Post('record-activity')
  async recordActivity(@Req() req: ReqWithRequester) {
    const user = req.requester;
    const { activityType, meta } = req.body;
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.recordActivity', {
          userId: user.sub,
          activityType,
          meta,
        }),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Failed to record activity for user ${user?.sub}`,
        error.stack,
      );
      return errorResponse(error.message || 'Failed to record activity');
    }
  }

  @Post('mark-toast-shown')
  async markToastShown(@Req() req: ReqWithRequester) {
    const user = req.requester;
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.markStreakToastShown', {
          userId: user.sub,
        }),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Failed to mark toast as shown for user ${user?.sub}`,
        error.stack,
      );
      return errorResponse(error.message || 'Failed to mark toast as shown');
    }
  }

  @Get('history')
  async getHistory(@Req() req: ReqWithRequester) {
    const user = req.requester;
    const query = req.query;
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.getHistory', {
          userId: user.sub,
          ...query,
        }),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Failed to get gamification history for user ${user?.sub}`,
        error.stack,
      );
      return errorResponse(
        error.message || 'Failed to fetch gamification history',
      );
    }
  }

  @Get('rewards')
  async getAvailableRewards(@Req() req: ReqWithRequester) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.getAvailableRewards', {}),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to get available rewards`, error.stack);
      return errorResponse(error.message || 'Failed to fetch rewards');
    }
  }

  @Post('redeem')
  async redeemPoints(@Req() req: ReqWithRequester) {
    const user = req.requester;
    const { dealId } = req.body;
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.redeemPoints', {
          userId: user.sub,
          dealId,
        }),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Failed to redeem points for user ${user?.sub}`,
        error.stack,
      );
      return errorResponse(error.message || 'Failed to redeem points');
    }
  }

  // ========================================================================
  // ADMIN REWARDS MANAGEMENT
  // ========================================================================

  @Get('admin/rewards')
  @Permissions('gamification.manage')
  async findAllRewards() {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'gamification.reward.findAll' }, {}),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to fetch all rewards for admin`, error.stack);
      return errorResponse(error.message || 'Failed to fetch rewards');
    }
  }

  @Post('admin/rewards')
  @Permissions('gamification.manage')
  async createReward(@Body() data: any) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'gamification.reward.create' }, data),
      );
      return successResponse(result, 'Reward created successfully');
    } catch (error: any) {
      this.logger.error(`Failed to create reward`, error.stack);
      return errorResponse(error.message || 'Failed to create reward');
    }
  }

  @Put('admin/rewards/:id')
  @Permissions('gamification.manage')
  async updateReward(@Param('id') id: string, @Body() data: any) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'gamification.reward.update' },
          { id, ...data },
        ),
      );
      return successResponse(result, 'Reward updated successfully');
    } catch (error: any) {
      this.logger.error(`Failed to update reward ${id}`, error.stack);
      return errorResponse(error.message || 'Failed to update reward');
    }
  }

  @Delete('admin/rewards/:id')
  @Permissions('gamification.manage')
  async deleteReward(@Param('id') id: string) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'gamification.reward.delete' }, { id }),
      );
      return successResponse(result, 'Reward deleted successfully');
    } catch (error: any) {
      this.logger.error(`Failed to delete reward ${id}`, error.stack);
      return errorResponse(error.message || 'Failed to delete reward');
    }
  }
}
