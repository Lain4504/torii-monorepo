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
}
