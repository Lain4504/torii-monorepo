/**
 * Webhook Controller (Room-Service)
 * Equivalent to Go: plugNmeet-server/pkg/models/webhook.go
 * 
 * Handles webhook events forwarded from gateway via NATS
 * Dispatches events to appropriate handlers
 */

import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WebhookService } from './webhook.service';

/**
 * WebhookController handles NATS messages for webhook events
 * Equivalent to Go: WebhookModel.HandleWebhookEvents
 */
@Controller()
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(
        private readonly webhookService: WebhookService,
    ) { }

    /**
     * HandleWebhookEvent receives webhook events from gateway via NATS
     * Equivalent to Go: WebhookModel.HandleWebhookEvents (webhook.go:53-70)
     * 
     * @pattern webhook.handle
     */
    @MessagePattern({ cmd: 'webhook.handle' })
    async handleWebhookEvent(@Payload() event: any): Promise<void> {
        if (!event || !event.event) {
            this.logger.warn('Received invalid webhook event');
            return;
        }

        this.logger.log(`Processing webhook event: ${event.event}`);

        // Dispatch to appropriate handler based on event type
        // Equivalent to Go's switch statement
        switch (event.event) {
            case 'room_started':
                await this.webhookService.roomStarted(event);
                break;
            case 'room_finished':
                await this.webhookService.roomFinished(event);
                break;
            case 'participant_joined':
                await this.webhookService.participantJoined(event);
                break;
            case 'participant_left':
                await this.webhookService.participantLeft(event);
                break;
            case 'track_published':
                await this.webhookService.trackPublished(event);
                break;
            case 'track_unpublished':
                await this.webhookService.trackUnpublished(event);
                break;
            case 'room_created':
                // Internal event from room-service, not a LiveKit event
                // Ignore - already processed by room creation logic
                break;
            default:
                this.logger.warn(`Unknown webhook event type: ${event.event}`);
        }
    }
}
