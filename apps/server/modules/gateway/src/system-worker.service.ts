import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsService } from '@server/shared';
import {
    NatsMsgClientToServer,
    NatsMsgClientToServerEvents,
    NatsMsgServerToClientEvents,
    NatsInitialData,
    MediaServerConnInfo,
    NatsMsgServerToClient,
} from '@server/proto';
import { AccessToken } from 'livekit-server-sdk';
import { StringCodec } from 'nats';

@Injectable()
export class SystemWorkerService implements OnModuleInit {
    private readonly logger = new Logger(SystemWorkerService.name);
    private readonly sc = StringCodec();

    constructor(
        private readonly natsService: NatsService,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit() {
        this.subscribeToSystemWorker().catch((err) =>
            this.logger.error('Failed to subscribe to system worker', err),
        );
    }

    private async subscribeToSystemWorker() {
        // Subject pattern: sysJsWorker.> (matches sysJsWorker.ROOM_ID.USER_ID)
        const subject = 'sysJsWorker.>';
        const queue = 'sysJsWorkerQueue'; // Use a queue group for load balancing

        await this.natsService.subscribe(subject, queue, async (m) => {
            try {
                const data = m.data;
                const sub = m.subject;
                const parts = sub.split('.');
                // sysJsWorker.roomId.userId
                if (parts.length !== 3) {
                    return;
                }
                const roomId = parts[1];
                const userId = parts[2];

                const req = NatsMsgClientToServer.decode(data);
                await this.handleClientRequest(roomId, userId, req);
            } catch (e) {
                this.logger.error('Error handling system worker message', e);
            }
        });
        this.logger.log('Subscribed to sysJsWorker.>');
    }

    private async handleClientRequest(
        roomId: string,
        userId: string,
        req: NatsMsgClientToServer,
    ) {
        switch (req.event) {
            case NatsMsgClientToServerEvents.REQ_INITIAL_DATA:
                await this.handleInitialData(roomId, userId);
                break;
            case NatsMsgClientToServerEvents.PING:
                // Optional: Handle ping if needed, usually just keeps connection alive
                break;
            default:
                // this.logger.warn(`Unhandled event: ${req.event}`);
                break;
        }
    }

    private async handleInitialData(roomId: string, userId: string) {
        this.logger.debug(
            `Handling REQ_INITIAL_DATA for room: ${roomId}, user: ${userId}`,
        );

        // 1. Get Room Info
        const roomInfo = await this.natsService.getRoomInfo(roomId);
        if (!roomInfo || !roomInfo.roomId) {
            this.logger.error(`Room info not found for ${roomId}`);
            // Send error?
            return;
        }

        // 2. Get User Info
        const userInfo = await this.natsService.getUserInfo(roomId, userId);
        if (!userInfo || !userInfo.userId) {
            this.logger.error(`User info not found for ${userId} in room ${roomId}`);
            return;
        }

        // 3. Generate LiveKit Token (Response to RES_MEDIA_SERVER_DATA logic)
        const mediaServerInfo = await this.generateMediaServerInfo(
            roomId,
            userId,
            userInfo,
        );

        // 4. Construct Response
        const initialData: NatsInitialData = {
            room: roomInfo,
            localUser: userInfo,
            mediaServerInfo: mediaServerInfo,
        };

        // 5. Send Response
        // Use broadcastSystemEvent with specific event type
        // The client expects the 'msg' field to be a JSON string of the NatsInitialData object.
        await this.natsService.broadcastSystemEvent(
            NatsMsgServerToClientEvents.RES_INITIAL_DATA,
            roomId,
            JSON.stringify(initialData),
            userId,
        );

        this.logger.debug(`Sent RES_INITIAL_DATA to ${userId}`);
    }

    private async generateMediaServerInfo(
        roomId: string,
        userId: string,
        userInfo: any,
    ): Promise<MediaServerConnInfo | undefined> {
        const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
        const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
        const livekitHost = this.configService.get<string>('LIVEKIT_URL', 'ws://localhost:7880');

        if (!apiKey || !apiSecret) {
            this.logger.error('LiveKit API Key/Secret not configured');
            return undefined;
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: userId,
            name: userInfo.name,
            metadata: userInfo.metadata,
        });

        at.addGrant({
            roomJoin: true,
            room: roomId,
            canPublish: true, // TODO: refine based on user role/permissions
            canSubscribe: true,
        });

        const token = await at.toJwt();

        return {
            url: livekitHost,
            token: token,
            enabledE2ee: false,
        };
    }
}
