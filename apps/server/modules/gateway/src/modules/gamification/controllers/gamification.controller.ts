import {
    Controller,
    Get,
    Post,
    Body,
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
    async getProfile(@Req() req: Request) {
        const user = req.user as any;
        try {
            const result = await firstValueFrom(
                this.natsClient.send('gamification.getProfile', { userId: user.sub })
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to get profile for user ${user.sub}`, error.stack);
            return errorResponse(error.message || 'Failed to fetch profile');
        }
    }

    @Get('streak')
    async getStreak(@Req() req: Request) {
        const user = req.user as any;
        try {
            const result = await firstValueFrom(
                this.natsClient.send('gamification.getStreak', { userId: user.sub })
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to get streak for user ${user.sub}`, error.stack);
            return errorResponse(error.message || 'Failed to fetch streak status');
        }
    }

    @Get('achievements')
    async getAchievements(@Req() req: Request) {
        const user = req.user as any;
        try {
            const result = await firstValueFrom(
                this.natsClient.send('gamification.getAchievements', { userId: user.sub })
            );
            return successResponse({ achievements: result });
        } catch (error: any) {
            this.logger.error(`Failed to get achievements for user ${user.sub}`, error.stack);
            return errorResponse(error.message || 'Failed to fetch achievements');
        }
    }

    @Get('shop')
    async getShopItems() {
        try {
            const result = await firstValueFrom(
                this.natsClient.send('gamification.getShopItems', {})
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to get shop items`, error.stack);
            return errorResponse('Failed to fetch shop items');
        }
    }

    @Post('shop/buy')
    async buyItem(@Req() req: Request, @Body() body: { itemCode: string }) {
        const user = req.user as any;
        try {
            const result = await firstValueFrom(
                this.natsClient.send('gamification.buyItem', {
                    userId: user.sub,
                    itemCode: body.itemCode
                })
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to buy item for user ${user.sub}`, error.stack);
            return errorResponse(error.message || 'Failed to buy item');
        }
    }

    @Get('leaderboard')
    async getLeaderboard() {
        try {
            const result = await firstValueFrom(
                this.natsClient.send('gamification.getLeaderboard', {})
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to get leaderboard`, error.stack);
            return errorResponse('Failed to fetch leaderboard');
        }
    }
}
