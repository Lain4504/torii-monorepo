/**
 * Webhook Controller (Gateway)
 *
 * Handles incoming webhook events from LiveKit via Gateway -> NATS -> Meet Service
 * Validates token and forwards to room-service via NATS
 */

import {
    Controller,
    Post,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { verifyWebhookRequest } from '@server/shared/utils/webhook_verify';

/**
 * WebhookAuthService validates LiveKit webhook tokens
 */
class WebhookAuthService {
    private readonly logger = new Logger(WebhookAuthService.name);
    private readonly livekitApiKey: string;
    private readonly livekitApiSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.livekitApiKey =
            this.configService.get<string>('LIVEKIT_API_KEY') || '';
        this.livekitApiSecret =
            this.configService.get<string>('LIVEKIT_API_SECRET') || '';
    }

    /**
     * ValidateLivekitWebhookToken validates webhook token
     */
    validateLivekitWebhookToken(body: Buffer, token: string): boolean {
        try {
            return verifyWebhookRequest(
                body,
                this.livekitApiKey,
                this.livekitApiSecret,
                token,
            );
        } catch (error) {
            this.logger.error(
                `Failed to validate LiveKit webhook token: ${error.message}`,
            );
            return false;
        }
    }
}

/**
 * WebhookController handles LiveKit webhook events
 */
@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);
    private readonly authService: WebhookAuthService;

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
        private readonly configService: ConfigService,
    ) {
        // Initialize AuthService
        this.authService = new WebhookAuthService(configService);
    }

    /**
     * HandleWebhook processes incoming webhook events from LiveKit
     *
     * @route POST /webhook
     */
    @Post('livekit')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Body() body: any,
        @Headers('authorization') authHeader: string,
    ): Promise<void> {
        // Read request body (JSON from room-service webhook notifier)
        if (!body) {
            this.logger.error('No body found in request');
            throw new Error('No body');
        }

        // Convert JSON body to bytes for verification
        const data = Buffer.from(JSON.stringify(body), 'utf-8');

        // Extract Authorization header
        const token = authHeader;
        if (!token) {
            this.logger.error('No authorization header - returning Forbidden');
            throw new Error('Forbidden');
        }

        // Validate the webhook token using LiveKit secret
        const isValid = this.authService.validateLivekitWebhookToken(data, token);
        if (!isValid) {
            this.logger.error('Invalid webhook token - returning Forbidden');
            throw new Error('Forbidden');
        }

        // Unmarshal the webhook event
        // LiveKit sends webhooks as JSON, so we parse as plain JSON object
        // The protobuf unmarshaling is for validation, but JSON works fine for forwarding
        let event: any;
        try {
            event = JSON.parse(data.toString('utf-8'));

            // Basic validation - ensure it's a webhook event with required fields
            if (!event.event) {
                throw new Error('Invalid webhook event: missing event field');
            }
        } catch (error) {
            this.logger.error(`Failed to parse webhook event: ${error.message}`);
            throw new Error('Unprocessable Entity');
        }

        // Handle the webhook event asynchronously via NATS
        this.natsClient.emit({ cmd: 'webhook.handle' }, event).subscribe({
            error: (err) => {
                this.logger.error(
                    `Failed to emit webhook event to NATS: ${err.message}`,
                );
            },
        });

        this.logger.log(`Webhook event processed: ${event.event}`);
    }
}
