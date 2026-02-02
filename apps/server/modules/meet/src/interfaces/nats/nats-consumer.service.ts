/**
 * NATS Consumer Service
 *
 * Creates JetStream consumers for different subject types and returns permissions
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsStreamService } from './nats-stream.service';
import { NatsService } from './nats.service';

@Injectable()
export class NatsConsumerService {
    private readonly logger = new Logger(NatsConsumerService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly streamService: NatsStreamService,
        private readonly natsService: NatsService,
    ) { }

    /**
     * CreateUserConsumer creates a single consumer per user for public and private system messages.
     * Matches Go: pkg/services/nats/js_stream.go -> CreateUserConsumer
     */
    async createUserConsumer(roomId: string, userId: string): Promise<string[]> {
        const streamName = this.natsService.getRoomStreamName();
        // Go: DurableNameTpl = "%s_%s"
        const durableName = `${roomId}_${userId}`;

        const sysPublic = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PUBLIC') || 'sysPublic';
        const sysPrivate = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PRIVATE') || 'sysPrivate';

        try {
            // Create or update consumer
            await this.streamService.createConsumer(streamName, {
                durable_name: durableName,
                deliver_policy: 'new', // DeliverNew
                filter_subjects: [
                    `${sysPublic}.${roomId}.>`,
                    `${sysPrivate}.${roomId}.${userId}.>`,
                ],
            });

            // Return permission strings that will be added to user's NATS permissions (from nats_auth_controller.go)
            return [
                `$JS.API.CONSUMER.INFO.${streamName}.${durableName}`,
                `$JS.API.CONSUMER.MSG.NEXT.${streamName}.${durableName}`,
                `$JS.ACK.${streamName}.${durableName}.>`,
            ];
        } catch (error) {
            this.logger.error(`Error creating user consumer for ${userId} in ${roomId}:`, error);
            return [
                `$JS.API.CONSUMER.INFO.${streamName}.${durableName}`,
                `$JS.API.CONSUMER.MSG.NEXT.${streamName}.${durableName}`,
                `$JS.ACK.${streamName}.${durableName}.>`,
            ];
        }
    }



    /**
     * Delete consumer for a user
     * Matches Go: pkg/services/nats/js_stream.go -> DeleteConsumer
     */
    async deleteConsumer(roomId: string, userId: string): Promise<void> {
        const streamName = this.natsService.getRoomStreamName();
        const durableName = `${roomId}_${userId}`;

        try {
            await this.streamService.deleteConsumer(streamName, durableName);
            this.logger.log(`Deleted consumer ${durableName} from stream ${streamName}`);
        } catch (error) {
            // Ignore errors during deletion
        }
    }
}
