/**
 * NATS Stream Service
 * Equivalent to Go: plugNmeet-server/pkg/services/nats/js_stream.go
 * 
 * Handles NATS JetStream stream creation and deletion
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsService } from './nats.service';

/**
 * NatsStreamService handles JetStream stream operations
 * Equivalent to Go: NatsService.CreateRoomNatsStreams / DeleteRoomNatsStream
 */
@Injectable()
export class NatsStreamService {
    private readonly logger = new Logger(NatsStreamService.name);

    // Subject names (matching Go config)
    private readonly subjects = {
        chat: 'chat',
        systemPublic: 'systemPublic',
        systemPrivate: 'systemPrivate',
        whiteboard: 'whiteboard',
        dataChannel: 'dataChannel',
    };

    constructor(
        private readonly configService: ConfigService,
        private readonly natsService: NatsService,
    ) { }

    /**
     * CreateRoomNatsStreams creates JetStream for a room
     * Equivalent to Go: s.Create RoomNatsStreams
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

        // Build subjects array (matching Go)
        const subjects = [
            `${roomId}:${this.subjects.chat}.*`,
            `${roomId}:${this.subjects.systemPublic}.*`,
            `${roomId}:${this.subjects.systemPrivate}.*.*`,
            `${roomId}:${this.subjects.whiteboard}.*`,
            `${roomId}:${this.subjects.dataChannel}.*`,
        ];

        try {
            const jsm = this.natsService.getJetStreamManager();

            // Try to get existing stream
            const existingStream = await jsm.streams.info(roomId).catch(() => null);

            if (existingStream) {
                // Update existing stream
                this.logger.debug(`Updating existing stream: ${roomId}`);
                await jsm.streams.update(roomId, {
                    subjects,
                });
            } else {
                // Create new stream (matching Go: CreateOrUpdateStream)
                this.logger.debug(`Creating new stream: ${roomId}`);
                await jsm.streams.add({
                    name: roomId,
                    subjects,
                    num_replicas: numReplicas,
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
     * Equivalent to Go: s.DeleteRoomNatsStream
     */
    async deleteRoomNatsStream(roomId: string): Promise<void> {
        this.logger.log(`Deleting NATS stream: ${roomId}`);

        try {
            const jsm = this.natsService.getJetStreamManager();
            await jsm.streams.delete(roomId);

            this.logger.log(`NATS stream deleted successfully: ${roomId}`);
        } catch (error) {
            // Ignore if stream not found (matching Go error handling)
            if (error.message && error.message.includes('stream not found')) {
                this.logger.debug(`Stream already deleted: ${roomId}`);
                return;
            }
            throw new Error(`Failed to delete NATS stream: ${error.message}`);
        }
    }
}
