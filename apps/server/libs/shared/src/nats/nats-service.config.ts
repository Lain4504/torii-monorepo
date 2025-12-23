/**
 * NATS Service Configuration
 * Provides configuration for NestJS NATS microservices
 * 
 * Used by all microservices (room-service, ai-service, etc.) in their main.ts
 */

import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { nkeyAuthenticator } from 'nats';

/**
 * Creates NATS microservice configuration
 * Used in microservice main.ts files with NestFactory.createMicroservice()
 * 
 * @returns MicroserviceOptions for Transport.NATS
 */
export function createNatsServiceConfig(): MicroserviceOptions {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
    const nkeySeed = process.env.NATS_NKEY_SEED;

    const options: any = {
        servers: [natsUrl],
        queue: 'torii_queue', // IMPORTANT: Queue group for load balancing across instances
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
}
