import { MicroserviceOptions, Transport } from '@nestjs/microservices';

/**
 * Create NATS microservice configuration with optional NKEY authentication
 * @returns MicroserviceOptions configured for NATS transport
 */
export const createNatsServiceConfig = (): MicroserviceOptions => {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
    const nkeySeed = process.env.NATS_NKEY_SEED;

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
};
