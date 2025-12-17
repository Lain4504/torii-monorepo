import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsService } from '@server/shared';
import { UserTrackingService } from './user-tracking.service';
import * as jwt from 'jsonwebtoken';

/**
 * NATS Connection Event Listener
 * Subscribes to $SYS.ACCOUNT.{account}.> to track user connections
 * Matches Go server: pkg/controllers/nats.go subscribeToUsersConnEvents
 */
@Injectable()
export class NatsConnectionListener implements OnModuleInit {
    private readonly logger = new Logger(NatsConnectionListener.name);

    constructor(
        private readonly natsService: NatsService,
        private readonly userTrackingService: UserTrackingService,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit() {
        await this.subscribeToUsersConnEvents();
    }

    /**
     * Subscribe to NATS system connection events
     * Matches: NatsController.subscribeToUsersConnEvents() in Go
     */
    private async subscribeToUsersConnEvents() {
        const accountName = this.configService.get<string>('NATS_ACCOUNT_NAME', 'PNM');
        const subject = `$SYS.ACCOUNT.${accountName}.>`;
        const queueGroup = 'pnm-conn-event-queue';

        // Wait for NATS connection
        let retries = 0;
        while (retries < 10) {
            const nc = this.natsService.getConnection();
            if (nc && !nc.isClosed()) {
                try {
                    const subscription = nc.subscribe(subject, {
                        queue: queueGroup,
                    });

                    this.logger.log(`Subscribed to NATS connection events: ${subject}`);

                    // Start processing loop
                    this.processConnectionEvents(subscription);
                    return;
                } catch (e) {
                    this.logger.error(`Failed to subscribe to connection events: ${e.message}`);
                }
            }
            await new Promise(r => setTimeout(r, 1000));
            retries++;
        }

        this.logger.error('Could not subscribe to NATS connection events after retries');
    }

    /**
     * Process connection events loop
     */
    private async processConnectionEvents(subscription: any) {
        try {
            for await (const msg of subscription) {
                const subj = msg.subject;
                const isConnect = subj.includes('.CONNECT');
                const isDisconnect = subj.includes('.DISCONNECT');

                if (!isConnect && !isDisconnect) {
                    continue;
                }

                // Copy data to avoid race conditions (NATS message buffer is reused)
                const dataCopy = new Uint8Array(msg.data);

                // Process in background (non-blocking like Go's goroutine)
                setImmediate(() => this.handleUserConnectionEvent(dataCopy, isConnect));
            }
        } catch (err) {
            this.logger.warn(`Connection event loop exited: ${err.message}`);
        }
    }

    /**
     * Handle individual connection event
     * Matches: NatsController.handleUserConnectionEvent() in Go
     */
    private async handleUserConnectionEvent(data: Uint8Array, isConnect: boolean) {
        try {
            const eventData = JSON.parse(new TextDecoder().decode(data));

            this.logger.debug(`Connection event - type: ${eventData.type}, isConnect: ${isConnect}`);

            // DEBUG: Log full event structure
            this.logger.debug(`Full event data: ${JSON.stringify(eventData, null, 2)}`);

            // Only process websocket client connections
            const clientType = eventData.client?.client_type;
            if (clientType && clientType !== 'websocket') {
                this.logger.debug(`Ignoring non-websocket connection: ${clientType}`);
                return;
            }

            // Extract user token from client info
            const userToken = eventData.client?.user;
            if (!userToken) {
                this.logger.warn('No user token in connection event');
                return;
            }

            this.logger.debug(`Found user token, length: ${userToken.length}`);

            // Parse JWT to get roomId and userId
            // IMPORTANT: Unsafe parse without verification (like Go's UnsafeClaimsWithoutVerification)
            // Because we just need to extract roomId/userId, not validate the token
            const decoded: any = jwt.decode(userToken);
            if (!decoded) {
                this.logger.warn('Failed to decode user token');
                return;
            }

            // DEBUG: Log decoded JWT claims
            this.logger.debug(`Decoded JWT claims: ${JSON.stringify(decoded, null, 2)}`);

            // Extract roomId from video.room (LiveKit JWT format)
            const roomId = decoded.video?.room || decoded.roomId || decoded.room_id;
            const userId = decoded.sub || decoded.userId || decoded.user_id;

            if (!roomId || !userId) {
                this.logger.warn(`Missing roomId or userId in token claims. roomId=${roomId}, userId=${userId}`);
                this.logger.debug(`Available claims: ${Object.keys(decoded).join(', ')}`);
                return;
            }

            // Skip recorder bot (PLUGNMEET_RECORDER_AUTH)
            if (decoded.name === 'PLUGNMEET_RECORDER_AUTH') {
                return;
            }

            this.logger.log(`User ${isConnect ? 'connected' : 'disconnected'}: ${userId} in room ${roomId}`);

            // Trigger appropriate handler
            if (isConnect) {
                await this.userTrackingService.onAfterUserJoined(roomId, userId);
            } else {
                await this.userTrackingService.onAfterUserDisconnected(roomId, userId);
            }

        } catch (error) {
            this.logger.error(`Error handling connection event: ${error.message}`);
        }
    }
}
