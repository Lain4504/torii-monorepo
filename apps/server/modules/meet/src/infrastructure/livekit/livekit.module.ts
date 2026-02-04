import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoomServiceClient, IngressClient } from 'livekit-server-sdk';
import { LiveKitService } from './livekit.service';
import { LIVEKIT_ROOM_SERVICE, LIVEKIT_INGRESS_CLIENT } from './livekit.constants';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: LIVEKIT_ROOM_SERVICE,
            useFactory: (configService: ConfigService) => {
                const host = configService.get<string>('LIVEKIT_API_URL');
                const apiKey = configService.get<string>('LIVEKIT_API_KEY');
                const apiSecret = configService.get<string>('LIVEKIT_API_SECRET');
                if (!host || !apiKey || !apiSecret) {
                    throw new Error('LiveKit configuration is missing. Please check LIVEKIT_API_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET');
                }
                return new RoomServiceClient(host, apiKey, apiSecret);
            },
            inject: [ConfigService],
        },
        {
            provide: LIVEKIT_INGRESS_CLIENT,
            useFactory: (configService: ConfigService) => {
                const host = configService.get<string>('LIVEKIT_API_URL');
                const apiKey = configService.get<string>('LIVEKIT_API_KEY');
                const apiSecret = configService.get<string>('LIVEKIT_API_SECRET');
                if (!host || !apiKey || !apiSecret) {
                    throw new Error('LiveKit configuration is missing');
                }
                return new IngressClient(host, apiKey, apiSecret);
            },
            inject: [ConfigService],
        },
        LiveKitService,
    ],
    exports: [LiveKitService, LIVEKIT_ROOM_SERVICE, LIVEKIT_INGRESS_CLIENT],
})
export class LiveKitModule { }
