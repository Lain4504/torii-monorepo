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
 * Sensei Gateway Handler
 * Handles Sensei AI agent requests from clients
 * Forwards to agents service via NATS
 */
@Controller('api/agents')
export class SenseiHandler {
    private readonly logger = new Logger(SenseiHandler.name);

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('grammar-check')
    @UseGuards(GatewayAuthGuard)
    async grammarCheck(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`📝 Grammar check request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.sensei.grammarCheck' },
                    { userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Grammar check failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to check grammar');
        }
    }

    @Post('translate')
    @UseGuards(GatewayAuthGuard)
    async translate(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`🌐 Translation request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.sensei.translate' },
                    { userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Translation failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to translate');
        }
    }

    @Post('flashcard')
    @UseGuards(GatewayAuthGuard)
    async createFlashcard(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`📇 Flashcard creation request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.sensei.createFlashcard' },
                    { userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Flashcard creation failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to create flashcard');
        }
    }

    @Post('drill/generate')
    @UseGuards(GatewayAuthGuard)
    async generateDrill(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`🎯 Drill generation request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.sensei.generateDrill' },
                    { userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Drill generation failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to generate drill');
        }
    }

    @Post('conversation/simulate')
    @UseGuards(GatewayAuthGuard)
    async simulateConversation(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`💬 Conversation simulation request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.sensei.simulateConversation' },
                    { userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Conversation simulation failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to simulate conversation');
        }
    }

    @Post('resources/recommend')
    @UseGuards(GatewayAuthGuard)
    async recommendResources(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`📚 Resource recommendation request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.sensei.recommendResources' },
                    { userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Resource recommendation failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to recommend resources');
        }
    }

    @Post('chat')
    @UseGuards(GatewayAuthGuard)
    async chat(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`💬 Chat request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.sensei.chat' },
                    { userId, ...body }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Chat failed for user ${userId}`, error.stack);
            return errorResponse(error.message || 'Failed to chat');
        }
    }

    @Post('roleplay')
    @UseGuards(GatewayAuthGuard)
    async roleplay(@Req() req: ReqWithRequester, @Body() body: any) {
        const requester = req.requester;
        const userId = requester?.sub;
        try {
            this.logger.log(`🎭 Roleplay request from user ${userId}`);
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.sensei.roleplay' },
                    { userId, ...body }
                )
            );
            return successResponse(result);

        } catch (error: any) {
            this.logger.error(`Roleplay failed`, error.stack);
            return errorResponse(error.message || 'Failed to process roleplay');
        }
    }

    @Post('tts')
    @UseGuards(GatewayAuthGuard)
    async tts(@Req() req: ReqWithRequester, @Body() body: { text: string; voice?: string }) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'agents.sensei.tts' },
                    { text: body.text, voice: body.voice }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`TTS generation failed`, error.stack);
            return errorResponse(error.message || 'Failed to generate TTS');
        }
    }
}
