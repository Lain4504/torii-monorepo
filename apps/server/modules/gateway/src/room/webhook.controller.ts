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
import { firstValueFrom } from 'rxjs';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly liveKitService: LiveKitService,
    @Inject('ROOM_SERVICE') private readonly roomClient: ClientProxy,
  ) {}

  @Post('livekit')
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

      // Forward to RoomService for processing
      this.roomClient.emit({ cmd: 'webhook.event' }, event);

      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Error validating webhook: ${error.message}`);
      throw new UnauthorizedException('Invalid Webhook Signature');
    }
  }
}

