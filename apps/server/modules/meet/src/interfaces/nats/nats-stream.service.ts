/**
 * NATS Stream Service
 *
 * Handles NATS JetStream stream creation and deletion
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsService } from './nats.service';

/**
 * NatsStreamService handles JetStream stream operations
 */
@Injectable()
export class NatsStreamService {
    private readonly logger = new Logger(NatsStreamService.name);

    // Subject names
    private readonly subjects = {
        chat: 'chat',
        systemPublic: 'sysPublic',   // Fixed: sysPublic (was systemPublic)
        systemPrivate: 'sysPrivate', // Fixed: sysPrivate (was systemPrivate)
        whiteboard: 'whiteboard',
        dataChannel: 'dataChannel',
    };

    constructor(
        private readonly configService: ConfigService,
        private readonly natsService: NatsService,
    ) { }

    /**
     * CreateRoomNatsStreams creates JetStream for a room
     *
     * Creates stream with name = roomId
     * Subjects:
     * - {roomId}:chat.*
     * - {roomId}:systemPublic.*
     * - {roomId}:systemPrivate.*.*
     * - {roomId}:whiteboard.*
     * - {roomId}:dataChannel.*
     */
    async createRoomNatsStreams(roomId: string): Promise<void> {
        this.logger.log(`Creating NATS streams for room: ${roomId}`);

        const numReplicas = this.configService.get<number>('NATS_NUM_REPLICAS') || 1;

        // Build subjects array
        const subjects = [
            `${roomId}:${this.subjects.chat}.*`,
            `${roomId}:${this.subjects.systemPublic}.*`,
            `${roomId}:${this.subjects.systemPrivate}.*.*`,
        ];

        try {
            const jsm = this.natsService.getJetStreamManager();

            // Try to get existing stream
            const existingStream = await jsm.streams.info(roomId).catch(() => null);

            // Define 1 second in nanoseconds
            const ONE_SECOND_NS = 1_000_000_000;
            const sevenDaysNs = 7 * 24 * 60 * 60 * ONE_SECOND_NS;

            if (existingStream) {
                // Update existing stream
                this.logger.debug(`Updating existing stream: ${roomId}`);

                await jsm.streams.update(roomId, {
                    subjects,
                    max_age: sevenDaysNs,
                });
            } else {
                // Create new stream
                this.logger.debug(`Creating new stream: ${roomId}`);

                this.logger.debug(`Creating stream ${roomId} with max_age: ${sevenDaysNs}`);

                await jsm.streams.add({
                    name: roomId,
                    subjects,
                    num_replicas: numReplicas,
                    max_age: sevenDaysNs,
                });
            }

            this.logger.log(`NATS streams created/updated successfully: ${roomId}`);
        } catch (error) {
            this.logger.error(`Error creating NATS streams for ${roomId}: ${error.message}`);
            throw new Error(`Failed to create NATS streams: ${error.message}`);
        }
    }

    /**
     * DeleteRoomNatsStream deletes JetStream for a room
     */
    async deleteRoomNatsStream(roomId: string): Promise<void> {
        this.logger.log(`Deleting NATS stream: ${roomId}`);

        try {
            const jsm = this.natsService.getJetStreamManager();
            await jsm.streams.delete(roomId);

            this.logger.log(`NATS stream deleted successfully: ${roomId}`);
        } catch (error) {
            // Ignore if stream not found
            if (error.message && error.message.includes('stream not found')) {
                this.logger.debug(`Stream already deleted: ${roomId}`);
                return;
            }
            throw new Error(`Failed to delete NATS stream: ${error.message}`);
        }
    }

    /**
     * Create a JetStream consumer for a stream
     * Used by NATS auth callout to set up user permissions
     */
    async createConsumer(streamName: string, config: any): Promise<void> {
        try {
            const jsm = this.natsService.getJetStreamManager();

            // Check if consumer already exists
            const existingConsumer = await jsm.consumers.info(streamName, config.durable_name).catch(() => null);

            if (existingConsumer) {
                // Update existing consumer
                this.logger.debug(`Updating consumer ${config.durable_name} in stream ${streamName}`);
                // Note: NATS.js doesn't have direct update, we delete and recreate
                await jsm.consumers.delete(streamName, config.durable_name).catch(() => { });
            }

            // Create consumer
            this.logger.debug(`Creating consumer ${config.durable_name} in stream ${streamName}`);
            await jsm.consumers.add(streamName, config);
        } catch (error) {
            // Don't throw - just log warning, consumer will be created on first use
            this.logger.warn(`Error creating consumer ${config.durable_name}: ${error.message}`);
        }
    }

    /**
     * Delete a JetStream consumer
     * Used when user disconnects
     */
    async deleteConsumer(streamName: string, consumerName: string): Promise<void> {
        try {
            const jsm = this.natsService.getJetStreamManager();
            await jsm.consumers.delete(streamName, consumerName);
            this.logger.debug(`Deleted consumer ${consumerName} from stream ${streamName}`);
        } catch (error) {
            // Ignore if consumer doesn't exist
            this.logger.debug(`Consumer ${consumerName} not found in stream ${streamName}`);
        }
    }
}
