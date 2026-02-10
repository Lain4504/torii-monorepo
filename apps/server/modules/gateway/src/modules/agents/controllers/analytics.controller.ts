import {
    Controller,
    Post,
    Body,
    Inject,
    Req,
    UseGuards,
    Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { successResponse, errorResponse, GatewayAuthGuard, ReqWithRequester } from '@server/shared';

/**
 * Analytics Gateway Handler
 * Handles Analytics AI agent requests from clients
 * Forwards to agents service via NATS
 */
@Controller('api/agents')
export class AnalyticsHandler {
    private readonly logger = new Logger(AnalyticsHandler.name);

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('progress/track')
    @UseGuards(GatewayAuthGuard)
    async trackProgress(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`📈 Progress tracking request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.analytics.trackProgress' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Progress tracking failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to track progress');
        }
    }

    @Post('path/suggest')
    @UseGuards(GatewayAuthGuard)
    async suggestStudyPath(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`🗺️ Study path suggestion request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.analytics.suggestStudyPath' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Study path suggestion failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to suggest study path');
        }
    }

    @Post('analytics/weaknesses')
    @UseGuards(GatewayAuthGuard)
    async identifyWeaknesses(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`🔍 Weakness identification request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.analytics.identifyWeaknesses' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Weakness identification failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to identify weaknesses');
        }
    }

    @Post('analytics/readiness')
    @UseGuards(GatewayAuthGuard)
    async predictReadiness(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`🎯 Readiness prediction request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.analytics.predictReadiness' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Readiness prediction failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to predict readiness');
        }
    }

    @Post('analytics/report')
    @UseGuards(GatewayAuthGuard)
    async generateReport(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`📄 Report generation request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.analytics.generateReport' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Report generation failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to generate report');
        }
    }
}
