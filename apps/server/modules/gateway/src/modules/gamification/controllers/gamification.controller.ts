import {
    Controller,
    Get,
    Post,
    Inject,
    Req,
    UseGuards,
    Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import {
    successResponse,
    errorResponse,
    ReqWithRequester,
} from '@server/shared';
import { GatewayAuthGuard } from '@server/shared';

@Controller('api/gamification')
@UseGuards(GatewayAuthGuard)
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
                this.natsClient.send('gamification.getProfile', { userId: user.sub })
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to get gamification profile for user ${user?.sub}`, error.stack);
            return errorResponse(error.message || 'Failed to fetch gamification profile');
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
                    type
                })
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to get leaderboard for user ${user?.sub}`, error.stack);
            return errorResponse(error.message || 'Failed to fetch leaderboard');
        }
    }

    @Get('streak')
    async getStreak(@Req() req: ReqWithRequester) {
        const user = req.requester;
        try {
            const result = await firstValueFrom(
                this.natsClient.send('gamification.getStreak', { userId: user.sub })
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to get streak for user ${user?.sub}`, error.stack);
            return errorResponse(error.message || 'Failed to fetch streak status');
        }
    }

    @Get('achievements')
    async getAchievements(@Req() req: ReqWithRequester) {
        const user = req.requester;
        try {
            const result = await firstValueFrom(
                this.natsClient.send('gamification.getAchievements', { userId: user.sub })
            );
            return successResponse({ achievements: result });
        } catch (error: any) {
            this.logger.error(`Failed to get achievements for user ${user?.sub}`, error.stack);
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
                    meta
                })
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to record activity for user ${user?.sub}`, error.stack);
            return errorResponse(error.message || 'Failed to record activity');
        }
    }

    @Post('mark-toast-shown')
    async markToastShown(@Req() req: ReqWithRequester) {
        const user = req.requester;
        try {
            const result = await firstValueFrom(
                this.natsClient.send('gamification.markStreakToastShown', { userId: user.sub })
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to mark toast as shown for user ${user?.sub}`, error.stack);
            return errorResponse(error.message || 'Failed to mark toast as shown');
        }
    }
}
