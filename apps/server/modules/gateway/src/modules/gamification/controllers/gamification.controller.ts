import {
    Controller,
    Get,
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
}
