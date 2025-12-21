import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ActiveRoomInfo, CommonNotifyEvent, CommonNotifyEventSchema, NotifyEventRoomSchema } from '@workspace/protocol';
import { create, toJsonString } from '@bufbuild/protobuf';

/**
 * WebhookService - Handles webhook notifications for room events
 * 
 */
@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);
    private readonly webhookRegistry = new Map<string, { roomId: string; roomSid: string; webhookUrl?: string }>();

    constructor(private readonly configService: ConfigService) { }

    /**
     * Register a room for webhook notifications
     * Stores room info and webhook URL for later use
     */
    registerWebhook(roomId: string, roomSid: string, webhookUrl?: string) {
        this.webhookRegistry.set(roomId, { roomId, roomSid, webhookUrl });
        this.logger.log(`Registered webhook for room: ${roomId}`);
    }

    /**
     * Unregister a room from webhook notifications
     */
    unregisterWebhook(roomId: string) {
        this.webhookRegistry.delete(roomId);
        this.logger.log(`Unregistered webhook for room: ${roomId}`);
    }

    /**
     * Send room_created webhook notification
     */
    async sendRoomCreatedWebhook(
        info: ActiveRoomInfo,
        emptyTimeout?: number,
        maxParticipants?: number,
    ): Promise<void> {
        try {
            const event = 'room_created';
            const creationTime = BigInt(info.creationTime);

            const msg = create(CommonNotifyEventSchema, {
                event: event,
                room: create(NotifyEventRoomSchema, {
                    roomId: info.roomId,
                    sid: info.sid,
                    creationTime: creationTime.toString(), // Convert bigint to string
                    metadata: info.metadata,
                    emptyTimeout: emptyTimeout,
                    maxParticipants: maxParticipants,
                }),
            });

            await this.sendWebhookEvent(msg, info.webhookUrl);
        } catch (error) {
            this.logger.error(`Error sending room created webhook: ${error.message}`, error.stack);
        }
    }

    /**
     * Send room_finished webhook notification
     */
    async sendRoomFinishedWebhook(
        roomId: string,
        roomSid: string,
        metadata?: string,
    ): Promise<void> {
        try {
            const event = 'room_finished';

            const msg = create(CommonNotifyEventSchema, {
                event: event,
                room: create(NotifyEventRoomSchema, {
                    roomId: roomId,
                    sid: roomSid,
                    metadata: metadata || '',
                }),
            });

            const roomInfo = this.webhookRegistry.get(roomId);
            await this.sendWebhookEvent(msg, roomInfo?.webhookUrl);
        } catch (error) {
            this.logger.error(`Error sending room finished webhook: ${error.message}`, error.stack);
        }
    }

    /**
     * Send webhook event to configured URL
     */
    private async sendWebhookEvent(msg: CommonNotifyEvent, webhookUrl?: string): Promise<void> {
        // Get webhook URL from room-specific config or global config
        const url = webhookUrl || this.configService.get<string>('WEBHOOK_URL');

        if (!url) {
            this.logger.debug('No webhook URL configured, skipping webhook notification');
            return;
        }

        try {
            // Convert protobuf message to JSON string (snake_case)
            const payload = toJsonString(CommonNotifyEventSchema, msg);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: payload,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.logger.log(`Webhook sent successfully to ${url}`);
        } catch (error) {
            this.logger.error(
                `Failed to send webhook to ${url}: ${error.message}`,
                error.stack,
            );
            // Don't throw - webhook failures shouldn't break room operations
        }
    }
}
