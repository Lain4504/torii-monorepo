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
 * Assessment Gateway Handler
 * Handles Assessment AI agent requests from clients
 * Forwards to agents service via NATS
 */
@Controller('api/agents')
export class AssessmentHandler {
    private readonly logger = new Logger(AssessmentHandler.name);

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('test/generate')
    @UseGuards(GatewayAuthGuard)
    async generateTest(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`📝 Test generation request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.assessment.generateTest' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Test generation failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to generate test');
        }
    }

    @Post('test/evaluate')
    @UseGuards(GatewayAuthGuard)
    async evaluateTest(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`✅ Test evaluation request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.assessment.evaluateTest' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Test evaluation failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to evaluate test');
        }
    }

    @Post('assessment/benchmark')
    @UseGuards(GatewayAuthGuard)
    async getProgressBenchmark(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`📊 Progress benchmark request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.assessment.progressBenchmark' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Benchmark request failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to get benchmark');
        }
    }

    @Post('test/schedule')
    @UseGuards(GatewayAuthGuard)
    async scheduleTest(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`📅 Test scheduling request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.assessment.scheduleTest' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Test scheduling failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to schedule test');
        }
    }

    @Post('placement/test')
    @UseGuards(GatewayAuthGuard)
    async generatePlacementTest(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`🎯 Placement test generation request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.assessment.placementTest' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Placement test generation failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to generate placement test');
        }
    }

    @Post('placement/evaluate')
    @UseGuards(GatewayAuthGuard)
    async evaluatePlacementTest(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`📈 Placement test evaluation request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.assessment.evaluatePlacement' },
                    { userId: userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Placement test evaluation failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to evaluate placement test');
        }
    }
}
