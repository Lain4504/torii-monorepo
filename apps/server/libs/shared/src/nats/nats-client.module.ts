import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        ConfigModule.forRoot(),
        ClientsModule.registerAsync([
            {
                name: 'NATS_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => {
                    const natsUrl = configService.get('NATS_URL') || 'nats://localhost:4222';
                    const nkeySeed = configService.get('NATS_NKEY_SEED');

                    const options: any = {
                        servers: [natsUrl],
                    };

                    // Add NKEY authentication if provided
                    if (nkeySeed) {
                        const { nkeyAuthenticator } = require('nats');
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
