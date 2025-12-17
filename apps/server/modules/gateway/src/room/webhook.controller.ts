import {
  Controller,
  Post,
  Headers,
  Body,
  Inject,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LiveKitService } from '@server/shared';
import { UserTrackingService } from '../user-tracking.service';
import { firstValueFrom } from 'rxjs';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly liveKitService: LiveKitService,
    private readonly userTrackingService: UserTrackingService,
    @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
  ) { }

  @Post()
  async handleWebhook(
    @Headers('authorization') authHeader: string,
    @Body() body: any,
  ) {
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    try {
      // Validate and verify the event
      const event = await this.liveKitService
        .getWebhookReceiver()
        .receive(body, authHeader);

      this.logger.log(
        `Received Webhook Event: ${event.event} for room ${event.room?.name}`,
      );

      // Handle participant events locally
      await this.handleParticipantEvents(event);

      // Forward to RoomService for other processing
      this.roomClient.emit({ cmd: 'webhook.event' }, event);

      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Error validating webhook: ${error.message}`);
      throw new UnauthorizedException('Invalid Webhook Signature');
    }
  }

  private async handleParticipantEvents(event: any) {
    const roomName = event.room?.name;
    const participantId = event.participant?.identity;

    if (!roomName || !participantId) {
      return;
    }

    // Handle participant_joined
    if (event.event === 'participant_joined') {
      this.logger.log(
        `Participant joined: ${participantId} in room ${roomName}`,
      );

      // For internal agents (ingress, TTS), manually trigger OnAfterUserJoined
      // because they don't use plugNmeet client interface
      if (
        participantId.startsWith('ingres_') ||
        participantId.startsWith('pnm_tts_agent-') ||
        participantId.startsWith('pnm_agent-')
      ) {
        await this.userTrackingService.onAfterUserJoined(
          roomName,
          participantId,
        );
      }
    }

    // Handle participant_left
    if (event.event === 'participant_left') {
      this.logger.log(`Participant left: ${participantId} in room ${roomName}`);

      // For internal agents
      if (
        participantId.startsWith('ingres_') ||
        participantId.startsWith('pnm_tts_agent-') ||
        participantId.startsWith('pnm_agent-')
      ) {
        await this.userTrackingService.onAfterUserDisconnected(
          roomName,
          participantId,
        );
      }
    }
  }
}

