import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  Req,
  UseGuards,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  successResponse,
  errorResponse,
  GatewayAuthGuard,
  ReqWithRequester,
  AppConfigService,
  generateLivekitAccessToken,
} from '@server/shared';
import { WajlcTokenClaimsSchema } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';

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
    private readonly appConfig: AppConfigService,
  ) {}

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
          { requester, ...body },
        ),
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
          { requester, ...body },
        ),
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
          { requester, ...body },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Flashcard creation failed for user ${userId}`,
        error.stack,
      );
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
          { requester, ...body },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Drill generation failed for user ${userId}`,
        error.stack,
      );
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
          { requester, ...body },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Conversation simulation failed for user ${userId}`,
        error.stack,
      );
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
          { requester, ...body },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Resource recommendation failed for user ${userId}`,
        error.stack,
      );
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
          { requester, ...body },
        ),
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
          { requester, ...body },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(`Roleplay failed`, error.stack);
      return errorResponse(error.message || 'Failed to process roleplay');
    }
  }

  @Post('tts')
  @UseGuards(GatewayAuthGuard)
  async tts(
    @Req() req: ReqWithRequester,
    @Body() body: { text: string; voice?: string },
  ) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'agents.sensei.tts' },
          { text: body.text, voice: body.voice },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(`TTS generation failed`, error.stack);
      return errorResponse(error.message || 'Failed to generate TTS');
    }
  }

  @Post('livekit-token')
  @UseGuards(GatewayAuthGuard)
  async getLivekitToken(@Req() req: ReqWithRequester) {
    const requester = req.requester;
    const userId = requester?.sub;

    try {
      this.logger.log(
        `🔑 Fetching LiveKit Token for Roleplay Cloud from user ${userId}`,
      );

      // Check usage and deduct coins (featureType 'live' for live voice roleplay)
      const usageResult = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'billing.quota.checkAndConsume' },
          {
            userId,
            featureType: 'live',
          },
        ),
      );

      if (!usageResult || !usageResult.allowed) {
        return errorResponse(
          usageResult?.message ||
            'Bạn đã hết lượt sử dụng miễn phí và không đủ Coins.',
        );
      }

      const { apiKey, apiSecret, wsUrl } = this.appConfig.livekitRoleplay;
      const tokenValidity = 7200; // 2 hours
      // Unique room per-session: prevents old agent from interfering with new session
      const sessionId = Date.now().toString(36);
      const roomId = `roleplay-${userId}-${sessionId}`;

      const claims = create(WajlcTokenClaimsSchema, {
        roomId: roomId,
        name: (requester as any)?.name || 'Student',
        userId: userId,
        isAdmin: false,
      });

      const token = await generateLivekitAccessToken(
        apiKey,
        apiSecret,
        tokenValidity,
        claims,
      );

      return successResponse({
        token,
        wsUrl,
        roomId,
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to generate LiveKit token for user ${userId}`,
        error.stack,
      );
      return errorResponse(error.message || 'Failed to generate token');
    }
  }

  @Get('sensei/quota-status')
  @UseGuards(GatewayAuthGuard)
  async getQuotaStatus(@Req() req: ReqWithRequester) {
    const userId = req.requester?.sub;
    try {
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'billing.quota.getStatus' },
          {
            userId,
            featureType: 'roleplay',
          },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Failed to get quota status for user ${userId}`,
        error.stack,
      );
      return errorResponse(error.message || 'Failed to fetch quota status');
    }
  }

  private joinCooldowns = new Map<string, number>();

  @Post('livekit-join')
  @UseGuards(GatewayAuthGuard)
  async livekitJoin(
    @Req() req: ReqWithRequester,
    @Body() body: { roomName: string },
  ) {
    const requester = req.requester;
    const userId = requester?.sub;

    if (userId) {
      const now = Date.now();
      const lastJoin = this.joinCooldowns.get(userId);
      if (lastJoin && now - lastJoin < 2500) {
        // 2.5s cooldown
        this.logger.warn(
          `[cooldown] User ${userId} requested join too quickly. Ignoring duplicate.`,
        );
        return successResponse({ success: true, alreadyJoining: true });
      }
      this.joinCooldowns.set(userId, now);
    }

    try {
      this.logger.log(
        `📡 Triggering Room Join for room ${body.roomName} from user ${userId}`,
      );
      await firstValueFrom(
        this.natsClient.send(
          { cmd: 'agents.livekit.joinRoom' },
          {
            roomName: body.roomName,
            participantIdentity: userId,
          },
        ),
      );
      return successResponse({ success: true });
    } catch (error: any) {
      this.logger.error(`❌ Failed to trigger Room Join: ${error.message}`);
      return errorResponse(error.message || 'Failed to join room');
    }
  }

  /**
   * Called by the frontend when the live voice session ends.
   * Triggers reliable token-based billing via NATS, as a fallback / complement
   * to the LiveKit agent's metrics-based billing (which may not fire for Gemini native audio).
   */
  @Post('livekit-end')
  @UseGuards(GatewayAuthGuard)
  async livekitEnd(
    @Req() req: ReqWithRequester,
    @Body()
    body: {
      roomName: string;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      durationSec?: number;
    },
  ) {
    const requester = req.requester;
    const userId = requester?.sub;

    try {
      this.logger.log(
        `🔚 LiveKit session ended for room ${body.roomName}, user=${userId}, tokens=${body.totalTokens}, duration=${body.durationSec ?? 0}s`,
      );

      if (body.totalTokens > 0) {
        // Primary: token-based billing
        this.natsClient.emit(
          { cmd: 'billing.quota.recordTokenUsage' },
          {
            userId,
            taskType: 'live_voice',
            usage: {
              promptTokenCount: body.inputTokens || 0,
              candidatesTokenCount: body.outputTokens || 0,
              totalTokenCount: body.totalTokens,
              model: 'gemini-2.5-flash-native-audio-latest',
            },
          },
        );
        this.logger.log(
          `[billing] Emitted token billing for user=${userId}, tokens=${body.totalTokens}`,
        );
      } else if ((body.durationSec ?? 0) > 10) {
        // Fallback: duration-based billing (when Gemini native audio doesn't emit metrics)
        // Rate: ~3 Coins/second based on Gemini 2.5 Flash native audio pricing at avg usage
        const durationSec = body.durationSec!;
        const estimatedCoins = Math.ceil(durationSec * 3); // 3 coins/sec ≈ reasonable estimate
        this.natsClient.emit(
          { cmd: 'billing.user_balance.deduct' },
          {
            userId,
            amount: estimatedCoins,
            reason: `Sử dụng Live Voice (thời lượng): ${Math.floor(durationSec / 60)}m ${durationSec % 60}s`,
          },
        );
        this.logger.log(
          `[billing] Duration fallback billing for user=${userId}: ${durationSec}s → ${estimatedCoins} coins`,
        );
      } else {
        this.logger.warn(
          `[billing] livekit-end: user=${userId} has 0 tokens and <10s duration. Skipping deduction.`,
        );
      }

      return successResponse({
        billed: body.totalTokens > 0 || (body.durationSec ?? 0) > 10,
      });
    } catch (error: any) {
      this.logger.error(
        `❌ Failed to bill live session for user ${userId}: ${error.message}`,
      );
      return errorResponse(error.message || 'Failed to bill session');
    }
  }
}
