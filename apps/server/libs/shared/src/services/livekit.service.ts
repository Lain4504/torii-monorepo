import { Injectable, OnModuleInit } from '@nestjs/common';
import {
    RoomServiceClient,
    WebhookReceiver,
    AccessToken,
    AccessTokenOptions,
    VideoGrant,
} from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LiveKitService implements OnModuleInit {
    private roomService: RoomServiceClient;
    private webhookReceiver: WebhookReceiver;
    private apiKey: string;
    private apiSecret: string;
    private host: string;

    constructor(private readonly configService: ConfigService) {
        this.host = this.configService.get<string>('LIVEKIT_API_URL') || 'http://localhost:7880';
        this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || 'devkey';
        this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || 'secret';
    }

    onModuleInit() {
        this.roomService = new RoomServiceClient(this.host, this.apiKey, this.apiSecret);
        this.webhookReceiver = new WebhookReceiver(this.apiKey, this.apiSecret);
    }

    getRoomClient(): RoomServiceClient {
        return this.roomService;
    }

    getWebhookReceiver(): WebhookReceiver {
        return this.webhookReceiver;
    }

    async createAccessToken(
        identity: string,
        name: string,
        grants: VideoGrant,
        metadata?: string,
        ttl: string | number = '1h',
    ): Promise<string> {
        const at = new AccessToken(this.apiKey, this.apiSecret, {
            identity,
            name,
            metadata,
            ttl,
        });
        at.addGrant(grants);
        return at.toJwt();
    }
}
