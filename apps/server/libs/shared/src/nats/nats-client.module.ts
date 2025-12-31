/**
 * NATS Client Module
 * Provides NATS client for gateway and services to communicate with microservices
 * 
 * Exports a ClientProxy with name 'NATS_SERVICE' that can be injected
 * Example: @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy
 */

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { nkeyAuthenticator } from 'nats';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'NATS_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => {
                    const natsUrl = configService.get<string>('NATS_URL');
                    const nkeySeed = configService.get<string>('NATS_NKEY_SEED');

                    const options: any = {
                        servers: [natsUrl],
                        queue: 'torii_queue', // IMPORTANT: Must match service config queue
                    };

                    // Add NKEY authentication if provided
                    if (nkeySeed) {
                        options.authenticator = nkeyAuthenticator(
                            new TextEncoder().encode(nkeySeed)
                        );
                    }

                    return {
                        transport: Transport.NATS,
                        options,
                    };
                },
                inject: [ConfigService],
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class NatsClientModule { }
