import {
  Controller,
  Get,
  Post,
  Patch,
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
  ) { }

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
  async redeemPoints(@Req() req: ReqWithRequester, @Body() body: { rewardId: string }) {
    const user = req.requester;
    const { rewardId } = body;
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.redeemPoints', {
          userId: user.sub,
          dealId: rewardId,
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

  // --- Admin CRUD ---

  @Get('admin/rewards')
  @Permissions('gamification:admin')
  async admin_getAllRewards() {
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.admin.getAllRewards', {}),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to get all rewards for admin`, error.stack);
      return errorResponse(error.message || 'Failed to fetch rewards');
    }
  }

  @Post('admin/rewards')
  @Permissions('gamification:admin')
  async admin_createReward(@Body() body: any) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.admin.createReward', body),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to create reward`, error.stack);
      return errorResponse(error.message || 'Failed to create reward');
    }
  }

  @Patch('admin/rewards/:id')
  @Permissions('gamification:admin')
  async admin_updateReward(@Param('id') id: string, @Body() body: any) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.admin.updateReward', { id, data: body }),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update reward ${id}`, error.stack);
      return errorResponse(error.message || 'Failed to update reward');
    }
  }

  @Delete('admin/rewards/:id')
  @Permissions('gamification:admin')
  async admin_deleteReward(@Param('id') id: string) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send('gamification.admin.deleteReward', { id }),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to delete reward ${id}`, error.stack);
      return errorResponse(error.message || 'Failed to delete reward');
    }
  }
}
