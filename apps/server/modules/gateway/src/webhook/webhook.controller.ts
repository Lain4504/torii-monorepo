/**
 * Webhook Controller (Gateway)
 * Equivalent to Go: plugNmeet-server/pkg/controllers/webhook.go
 * 
 * Handles incoming webhook events from LiveKit
 * Validates token and forwards to room-service via NATS
 */

import {
    Controller,
    Post,
    Headers,
    HttpCode,
    HttpStatus,
    Inject,
    Req,
    Logger,
} from '@nestjs/common';
import * as express from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { verifyWebhookRequest } from '@server/shared/utils/webhook_verify';

/**
 * WebhookAuthService validates LiveKit webhook tokens
 * Equivalent to Go: AuthModel (used by WebhookController)
 */
class WebhookAuthService {
    private readonly logger = new Logger(WebhookAuthService.name);
    private readonly livekitApiKey: string;
    private readonly livekitApiSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.livekitApiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
        this.livekitApiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';
    }

    /**
     * ValidateLivekitWebhookToken validates webhook token
     * Equivalent to Go: authModel.ValidateLivekitWebhookToken (auth.go:72-74)
     */
    validateLivekitWebhookToken(body: Buffer, token: string): boolean {
        try {
            return verifyWebhookRequest(
                body,
                this.livekitApiKey,
                this.livekitApiSecret,
                token
            );
        } catch (error) {
            this.logger.error(`Failed to validate LiveKit webhook token: ${error.message}`);
            return false;
        }
    }
}

/**
 * WebhookController handles LiveKit webhook events
 * Equivalent to Go: WebhookController (webhook.go:10-21)
 */
@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);
    private readonly authService: WebhookAuthService;

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
        private readonly configService: ConfigService,
    ) {
        // Initialize AuthService (equivalent to Go: authModel field)
        this.authService = new WebhookAuthService(configService);
    }

    /**
     * HandleWebhook processes incoming webhook events from LiveKit
     * Equivalent to Go: wc.HandleWebhook (webhook.go:24-49)
     * 
     * @route POST /webhook
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Req() req: express.Request & { rawBody?: Buffer },
        @Headers('authorization') authHeader: string,
    ): Promise<void> {
        // Read raw request body
        // Equivalent to Go: data := c.Body()
        const data = req.rawBody;
        if (!data) {
            this.logger.error('No raw body found in request');
            throw new Error('No body');
        }

        // Extract Authorization header
        // Equivalent to Go: token := c.Get("Authorization")
        const token = authHeader;
        if (!token) {
            this.logger.error('No authorization header - returning Forbidden');
            throw new Error('Forbidden');
        }

        // Validate the webhook token using LiveKit secret
        // Equivalent to Go: if _, err := wc.AuthModel.ValidateLivekitWebhookToken(data, token); err != nil
        const isValid = this.authService.validateLivekitWebhookToken(data, token);
        if (!isValid) {
            this.logger.error('Invalid webhook token - returning Forbidden');
            throw new Error('Forbidden');
        }

        // Unmarshal the webhook event
        // Equivalent to Go: event := new(livekit.WebhookEvent); unmarshalOpts.Unmarshal(data, event)
        // LiveKit sends webhooks as JSON, so we parse as plain JSON object
        // The protobuf unmarshaling in Go is for validation, but JSON works fine for forwarding
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

        // Handle the webhook event asynchronously
        // Equivalent to Go: go wc.WebhookModel.HandleWebhookEvents(event)
        this.natsClient
            .emit({ cmd: 'webhook.handle' }, event)
            .subscribe({
                error: (err) => {
                    this.logger.error(`Failed to emit webhook event to NATS: ${err.message}`);
                }
            });

        this.logger.log(`Webhook event processed: ${event.event}`);
    }
}
