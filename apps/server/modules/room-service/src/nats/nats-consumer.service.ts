/**
 * NATS Consumer Service
 *
 * Creates JetStream consumers for different subject types and returns permissions
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsStreamService } from './nats-stream.service';

@Injectable()
export class NatsConsumerService {
    private readonly logger = new Logger(NatsConsumerService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly streamService: NatsStreamService,
    ) { }

    /**
     * Create chat consumer for a user in a room
     */
    async createChatConsumer(roomId: string, userId: string): Promise<string[]> {
        const chat = this.configService.get<string>('NATS_SUBJECT_CHAT') || 'chat';

        try {
            // Create or update consumer using your existing stream service
            await this.streamService.createConsumer(roomId, {
                durable_name: `${chat}:${userId}`,
                filter_subjects: [`${roomId}:${chat}.>`],
            });

            // Return permission strings that will be added to user's NATS permissions
            return [
                `$JS.API.CONSUMER.INFO.${roomId}.${chat}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${chat}:${userId}`,
                `${roomId}:${chat}.${userId}`,
                `$JS.ACK.${roomId}.${chat}:${userId}.>`,
            ];
        } catch (error) {
            this.logger.error(`Error creating chat consumer for ${userId} in ${roomId}:`, error);
            // Return basic permissions even if consumer creation fails
            return [
                `$JS.API.CONSUMER.INFO.${roomId}.${chat}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${chat}:${userId}`,
                `${roomId}:${chat}.${userId}`,
                `$JS.ACK.${roomId}.${chat}:${userId}.>`,
            ];
        }
    }

    /**
     * Create system public consumer

     */
    async createSystemPublicConsumer(roomId: string, userId: string): Promise<string[]> {
        const sysPublic = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PUBLIC') || 'sysPublic';

        try {
            await this.streamService.createConsumer(roomId, {
                durable_name: `${sysPublic}:${userId}`,
                deliver_policy: 'new',
                filter_subjects: [`${roomId}:${sysPublic}.>`],
            });

            return [
                `$JS.API.CONSUMER.INFO.${roomId}.${sysPublic}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${sysPublic}:${userId}`,
                `$JS.ACK.${roomId}.${sysPublic}:${userId}.>`,
            ];
        } catch (error) {
            this.logger.error(`Error creating system public consumer for ${userId} in ${roomId}:`, error);
            return [
                `$JS.API.CONSUMER.INFO.${roomId}.${sysPublic}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${sysPublic}:${userId}`,
                `$JS.ACK.${roomId}.${sysPublic}:${userId}.>`,
            ];
        }
    }

    /**
     * Create system private consumer

     */
    async createSystemPrivateConsumer(roomId: string, userId: string): Promise<string[]> {
        const sysPrivate = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PRIVATE') || 'sysPrivate';

        try {
            await this.streamService.createConsumer(roomId, {
                durable_name: `${sysPrivate}:${userId}`,
                deliver_policy: 'new',
                filter_subjects: [`${roomId}:${sysPrivate}.${userId}.>`],
            });

            return [
                `$JS.API.CONSUMER.INFO.${roomId}.${sysPrivate}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${sysPrivate}:${userId}`,
                `$JS.ACK.${roomId}.${sysPrivate}:${userId}.>`,
            ];
        } catch (error) {
            this.logger.error(`Error creating system private consumer for ${userId} in ${roomId}:`, error);
            return [
                `$JS.API.CONSUMER.INFO.${roomId}.${sysPrivate}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${sysPrivate}:${userId}`,
                `$JS.ACK.${roomId}.${sysPrivate}:${userId}.>`,
            ];
        }
    }

    /**
     * Create whiteboard consumer

     */
    async createWhiteboardConsumer(roomId: string, userId: string): Promise<string[]> {
        const whiteboard = this.configService.get<string>('NATS_SUBJECT_WHITEBOARD') || 'whiteboard';

        try {
            await this.streamService.createConsumer(roomId, {
                durable_name: `${whiteboard}:${userId}`,
                deliver_policy: 'new',
                filter_subjects: [`${roomId}:${whiteboard}.>`],
            });

            return [
                `$JS.API.CONSUMER.INFO.${roomId}.${whiteboard}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${whiteboard}:${userId}`,
                `${roomId}:${whiteboard}.${userId}`,
                `$JS.ACK.${roomId}.${whiteboard}:${userId}.>`,
            ];
        } catch (error) {
            this.logger.error(`Error creating whiteboard consumer for ${userId} in ${roomId}:`, error);
            return [
                `$JS.API.CONSUMER.INFO.${roomId}.${whiteboard}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${whiteboard}:${userId}`,
                `${roomId}:${whiteboard}.${userId}`,
                `$JS.ACK.${roomId}.${whiteboard}:${userId}.>`,
            ];
        }
    }

    /**
     * Create data channel consumer

     */
    async createDataChannelConsumer(roomId: string, userId: string): Promise<string[]> {
        const dataChannel = this.configService.get<string>('NATS_SUBJECT_DATA_CHANNEL') || 'dataChannel';

        try {
            await this.streamService.createConsumer(roomId, {
                durable_name: `${dataChannel}:${userId}`,
                deliver_policy: 'new',
                filter_subjects: [`${roomId}:${dataChannel}.>`],
            });

            return [
                `$JS.API.CONSUMER.INFO.${roomId}.${dataChannel}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${dataChannel}:${userId}`,
                `${roomId}:${dataChannel}.${userId}`,
                `$JS.ACK.${roomId}.${dataChannel}:${userId}.>`,
            ];
        } catch (error) {
            this.logger.error(`Error creating data channel consumer for ${userId} in ${roomId}:`, error);
            return [
                `$JS.API.CONSUMER.INFO.${roomId}.${dataChannel}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${dataChannel}:${userId}`,
                `${roomId}:${dataChannel}.${userId}`,
                `$JS.ACK.${roomId}.${dataChannel}:${userId}.>`,
            ];
        }
    }

    /**
     * Delete all consumers for a user in a room

     */
    async deleteConsumer(roomId: string, userId: string): Promise<void> {
        const subjects = [
            this.configService.get<string>('NATS_SUBJECT_CHAT') || 'chat',
            this.configService.get<string>('NATS_SUBJECT_SYSTEM_PUBLIC') || 'sysPublic',
            this.configService.get<string>('NATS_SUBJECT_SYSTEM_PRIVATE') || 'sysPrivate',
            this.configService.get<string>('NATS_SUBJECT_WHITEBOARD') || 'whiteboard',
            this.configService.get<string>('NATS_SUBJECT_DATA_CHANNEL') || 'dataChannel',
        ];

        for (const subject of subjects) {
            try {
                await this.streamService.deleteConsumer(roomId, `${subject}:${userId}`);
            } catch (error) {
                // Ignore errors during deletion
                this.logger.warn(`Failed to delete consumer ${subject}:${userId} in ${roomId}`);
            }
        }
    }
}
