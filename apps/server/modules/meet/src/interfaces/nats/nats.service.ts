/**
 * NATS Service - Base Service
 *
 * Main NATS service with metadata marshaling utilities
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { create, toJson, fromJson, toJsonString, fromJsonString } from '@bufbuild/protobuf';
import type { RoomMetadata, UserMetadata } from '@workspace/protocol';
import { RoomMetadataSchema, UserMetadataSchema } from '@workspace/protocol';
import { NatsCacheService } from './nats-cache.service';
import {
    connect,
    NatsConnection,
    JetStreamClient,
    JetStreamManager,
    nkeyAuthenticator,
    DeliverPolicy,
} from 'nats';

// Constants
const NATS_PREFIX = 'wajlc-';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds (standard for JS/TS)

/**
 * Proto JSON options
 */
const PROTO_JSON_OPTIONS = {
    alwaysEmitImplicit: true,  // equivalent to EmitUnpopulated
    useProtoFieldName: true,    // equivalent to UseProtoNames
};

/**
 * NatsService is the main NATS service
 *
 * type NatsService struct {
 *   ctx    context.Context
 *   app    *config.AppConfig
 *   nc     *nats.Conn           ← NATS connection
 *   js     jetstream.JetStream  ← JetStream
 *   cs     *NatsCacheService    ← Cache service
 *   logger *logrus.Entry
 * }
 */
@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger('NatsService');

    // NATS connection variables
    private nc: NatsConnection;       // NATS connection
    private js: JetStreamClient;      // JetStream
    private jsm: JetStreamManager;    // JetStream Manager (for admin operations)
    private cs: NatsCacheService;     // Cache Service

    constructor(
        private readonly configService: ConfigService,
        private readonly cacheService: NatsCacheService,
    ) {
        // Initialize cs field
        this.cs = cacheService;
    }

    /**
     * Initialize NATS connection for JetStream/KV operations
     * 
     * IMPORTANT: This connection is SEPARATE from NestJS microservice transport!
     * 
     * Two NATS connections exist in this service:
     * 1. NestJS Microservice Connection (from createNatsServiceConfig in main.ts)
     *    - Used for @MessagePattern subscriptions (room.create, room.isActive, etc.)
     *    - Managed by NestJS framework automatically
     * 
     * 2. JetStream Connection (this.nc, created here)
     *    - Used for JetStream KV operations (webhook data, room info caching)
     *    - Used for NATS pub/sub (webhook cleanup broadcasts)
     *    - Managed by this service directly
     * 
     * These two connections do NOT conflict - they serve different purposes!
     */
    async onModuleInit() {
        this.logger.log('Initializing NATS Service...');
        await this.connectToNats(); // For JetStream/KV operations
        this.logger.log('NATS Service initialized with JetStream connection');
    }

    async onModuleDestroy() {
        this.logger.log('Closing NATS JetStream connection...');
        await this.closeNatsConnection();
        this.logger.log('NATS Service closed');
    }

    /**
     * Connect to NATS with optional NKEY authentication
     */
    private async connectToNats(): Promise<void> {
        try {
            const natsUrl = this.configService.get<string>('NATS_URL') || 'nats://localhost:4222';
            const nkeySeed = this.configService.get<string>('NATS_NKEY_SEED');

            const options: any = {
                servers: [natsUrl],
                name: 'nestjs-room-service',
            };

            // Add NKEY authentication if provided
            if (nkeySeed) {
                options.authenticator = nkeyAuthenticator(
                    new TextEncoder().encode(nkeySeed)
                );
                this.logger.log('NATS NKEY authentication enabled');
            }

            // Connect to NATS
            this.nc = await connect(options);

            // Initialize JetStream
            this.js = this.nc.jetstream();

            // Initialize JetStream Manager for admin operations
            this.jsm = await this.nc.jetstreamManager();

            this.logger.log(`Connected to NATS: ${natsUrl}`);
        } catch (error) {
            this.logger.error(`Failed to connect to NATS: ${error.message}`);
            throw error;
        }
    }

    /**
     * Close NATS connection gracefully
     */
    private async closeNatsConnection(): Promise<void> {
        if (this.nc) {
            await this.nc.drain();
            await this.nc.close();
        }
    }

    // ============================================================================
    // Metadata Marshaling Methods
    // ============================================================================

    /**
     * MarshalToProtoJson converts protobuf message to JSON string
     *
     * Uses options:
     * - EmitUnpopulated: true (include default values)
     * - UseProtoNames: true (use snake_case field names)
     */
    marshalToProtoJson<T>(message: T, schema: any): string {
        // Using @bufbuild/protobuf's toJsonString with options
        // Note: @bufbuild/protobuf uses different option names than protobuf-js
        return toJsonString(schema, message as any, {
            alwaysEmitImplicit: true,
            useProtoFieldName: true,
        });
    }

    /**
     * MarshalRoomMetadata converts RoomMetadata to JSON string
     *
     * Adds metadataId before marshaling
     */
    marshalRoomMetadata(metadata: RoomMetadata): string {
        // Add metadata ID
        const metadataWithId = create(RoomMetadataSchema, {
            ...metadata,
            metadataId: uuidv4(),
        });

        return this.marshalToProtoJson(metadataWithId, RoomMetadataSchema);
    }

    /**
     * UnmarshalRoomMetadata converts JSON string to RoomMetadata
     */
    unmarshalRoomMetadata(metadataJson: string): RoomMetadata {
        if (!metadataJson) {
            return create(RoomMetadataSchema, {});
        }

        // Using @bufbuild/protobuf's fromJsonString
        return fromJsonString(RoomMetadataSchema, metadataJson);
    }

    /**
     * MarshalUserMetadata converts UserMetadata to JSON string
     *
     * Adds metadataId before marshaling
     */
    marshalUserMetadata(metadata: UserMetadata): string {
        // Add metadata ID
        const metadataWithId = create(UserMetadataSchema, {
            ...metadata,
            metadataId: uuidv4(),
        });

        return this.marshalToProtoJson(metadataWithId, UserMetadataSchema);
    }

    /**
     * UnmarshalUserMetadata converts JSON string to UserMetadata
     */
    unmarshalUserMetadata(metadataJson: string): UserMetadata {
        if (!metadataJson) {
            return create(UserMetadataSchema, {});
        }

        // Using @bufbuild/protobuf's fromJsonString
        return fromJsonString(UserMetadataSchema, metadataJson);
    }

    // ============================================================================
    // Getters for internal services
    // ============================================================================

    /**
     * Get NATS connection
     */
    getNatsConnection(): any {
        return this.nc;
    }

    /**
   * Get JetStream
   */
    getJetStream(): JetStreamClient {
        return this.js;
    }

    /**
     * Get JetStream Manager  
     */
    getJetStreamManager(): JetStreamManager {
        return this.jsm;
    }

    /**
     * Get Cache Service
     */
    getCacheService(): NatsCacheService {
        return this.cs;
    }

    // ============================================================================
    // Webhook Methods
    // ============================================================================

    /**
     * Webhook KV bucket name
     */
    private static readonly WEBHOOK_KV_KEY = `${NATS_PREFIX}webhookData`;

    /**
     * Webhook cleanup NATS subject
     */
    static readonly WEBHOOK_CLEANUP_SUBJECT = `${NATS_PREFIX}webhookCleanup`;

    /**
     * AddWebhookData stores webhook data for a room in NATS KV
     */
    async addWebhookData(roomId: string, val: string): Promise<void> {
        try {
            // Create or update KV bucket
            const kv = await this.js.views.kv(NatsService.WEBHOOK_KV_KEY, {
                history: 1,
                ttl: DEFAULT_TTL, // Already in nanoseconds
                replicas: this.configService.get<number>('NATS_NUM_REPLICAS') || 1,
            });

            // Store webhook data
            await kv.put(roomId, new TextEncoder().encode(val));
        } catch (error) {
            throw new Error(`Failed to add webhook data: ${error.message}`);
        }
    }

    /**
     * GetWebhookData retrieves webhook data for a room from NATS KV
     *
     * Returns null if bucket or key not found
     */
    async getWebhookData(roomId: string): Promise<string | null> {
        try {
            // Get KV bucket
            const kv = await this.js.views.kv(NatsService.WEBHOOK_KV_KEY);

            // Get entry
            const entry = await kv.get(roomId);

            if (!entry || !entry.value) {
                return null;
            }

            return new TextDecoder().decode(entry.value);
        } catch (error) {
            // Handle errors
            if (error.message && error.message.includes('bucket not found')) {
                return null;
            }
            if (error.message && error.message.includes('key not found')) {

                return null;
            }
            throw error;
        }
    }

    /**
     * DeleteWebhookData deletes webhook data for a room from NATS KV
     *
     * Silently succeeds if bucket not found
     */
    async deleteWebhookData(roomId: string): Promise<void> {
        try {
            // Get KV bucket
            const kv = await this.js.views.kv(NatsService.WEBHOOK_KV_KEY);

            // Purge the key (delete all revisions)
            await kv.purge(roomId);
        } catch (error) {
            // Handle errors matching
            if (error.message && error.message.includes('bucket not found')) {
                return;
            }
            throw error;
        }
    }

    // ============================================================================
    // JetStream Consumer Management
    // ============================================================================

    /**
     * CreateChatConsumer creates or updates a chat consumer for a user
     *
     * @param roomId - Room ID
     * @param userId - User ID
     * @returns Array of permission strings for JWT
     */
    async createChatConsumer(roomId: string, userId: string): Promise<string[]> {
        const chatSubject = this.configService.get<string>('NATS_SUBJECT_CHAT') || 'chat';

        try {
            // Create or update consumer
            await this.jsm.consumers.add(roomId, {
                durable_name: `${chatSubject}:${userId}`,
                filter_subjects: [`${roomId}:${chatSubject}.>`],
            });

            // Return permission list for JWT
            const permissions = [
                `$JS.API.CONSUMER.INFO.${roomId}.${chatSubject}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${chatSubject}:${userId}`,
                `${roomId}:${chatSubject}.${userId}`,
                `$JS.ACK.${roomId}.${chatSubject}:${userId}.>`,
            ];

            return permissions;
        } catch (error) {
            this.logger.error(`Failed to create chat consumer: ${error.message}`);
            throw error;
        }
    }

    /**
     * CreateSystemPublicConsumer creates or updates a system public consumer for a user
     */
    async createSystemPublicConsumer(roomId: string, userId: string): Promise<string[]> {
        const sysPublicSubject = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PUBLIC') || 'sysPublic';

        try {
            await this.jsm.consumers.add(roomId, {
                durable_name: `${sysPublicSubject}:${userId}`,
                deliver_policy: DeliverPolicy.New,
                filter_subjects: [`${roomId}:${sysPublicSubject}.>`],
            });

            const permissions = [
                `$JS.API.CONSUMER.INFO.${roomId}.${sysPublicSubject}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${sysPublicSubject}:${userId}`,
                `$JS.ACK.${roomId}.${sysPublicSubject}:${userId}.>`,
            ];

            return permissions;
        } catch (error) {
            this.logger.error(`Failed to create system public consumer: ${error.message}`);
            throw error;
        }
    }

    /**
     * CreateSystemPrivateConsumer creates or updates a system private consumer for a user
     */
    async createSystemPrivateConsumer(roomId: string, userId: string): Promise<string[]> {
        const sysPrivateSubject = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PRIVATE') || 'sysPrivate';

        try {
            await this.jsm.consumers.add(roomId, {
                durable_name: `${sysPrivateSubject}:${userId}`,
                deliver_policy: DeliverPolicy.New,
                filter_subjects: [`${roomId}:${sysPrivateSubject}.${userId}.>`],
            });

            const permissions = [
                `$JS.API.CONSUMER.INFO.${roomId}.${sysPrivateSubject}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${sysPrivateSubject}:${userId}`,
                `$JS.ACK.${roomId}.${sysPrivateSubject}:${userId}.>`,
            ];

            return permissions;
        } catch (error) {
            this.logger.error(`Failed to create system private consumer: ${error.message}`);
            throw error;
        }
    }

    /**
     * CreateWhiteboardConsumer creates or updates a whiteboard consumer for a user
     */
    async createWhiteboardConsumer(roomId: string, userId: string): Promise<string[]> {
        const whiteboardSubject = this.configService.get<string>('NATS_SUBJECT_WHITEBOARD') || 'whiteboard';

        try {
            await this.jsm.consumers.add(roomId, {
                durable_name: `${whiteboardSubject}:${userId}`,
                deliver_policy: DeliverPolicy.New,
                filter_subjects: [`${roomId}:${whiteboardSubject}.>`],
            });

            const permissions = [
                `$JS.API.CONSUMER.INFO.${roomId}.${whiteboardSubject}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${whiteboardSubject}:${userId}`,
                `${roomId}:${whiteboardSubject}.${userId}`,
                `$JS.ACK.${roomId}.${whiteboardSubject}:${userId}.>`,
            ];

            return permissions;
        } catch (error) {
            this.logger.error(`Failed to create whiteboard consumer: ${error.message}`);
            throw error;
        }
    }

    /**
     * CreateDataChannelConsumer creates or updates a data channel consumer for a user
     */
    async createDataChannelConsumer(roomId: string, userId: string): Promise<string[]> {
        const dataChannelSubject = this.configService.get<string>('NATS_SUBJECT_DATA_CHANNEL') || 'dataChannel';

        try {
            await this.jsm.consumers.add(roomId, {
                durable_name: `${dataChannelSubject}:${userId}`,
                deliver_policy: DeliverPolicy.New,
                filter_subjects: [`${roomId}:${dataChannelSubject}.>`],
            });

            const permissions = [
                `$JS.API.CONSUMER.INFO.${roomId}.${dataChannelSubject}:${userId}`,
                `$JS.API.CONSUMER.MSG.NEXT.${roomId}.${dataChannelSubject}:${userId}`,
                `${roomId}:${dataChannelSubject}.${userId}`,
                `$JS.ACK.${roomId}.${dataChannelSubject}:${userId}.>`,
            ];

            return permissions;
        } catch (error) {
            this.logger.error(`Failed to create data channel consumer: ${error.message}`);
            throw error;
        }
    }

    /**
     * DeleteConsumer deletes all consumers for a user in a room
     */
    async deleteConsumer(roomId: string, userId: string): Promise<void> {
        const chatSubject = this.configService.get<string>('NATS_SUBJECT_CHAT') || 'chat';
        const sysPublicSubject = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PUBLIC') || 'sysPublic';
        const sysPrivateSubject = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PRIVATE') || 'sysPrivate';
        const whiteboardSubject = this.configService.get<string>('NATS_SUBJECT_WHITEBOARD') || 'whiteboard';
        const dataChannelSubject = this.configService.get<string>('NATS_SUBJECT_DATA_CHANNEL') || 'dataChannel';

        // Delete all consumers
        try {
            await this.jsm.consumers.delete(roomId, `${chatSubject}:${userId}`);
        } catch (error) {
            // Silent fail
        }

        try {
            await this.jsm.consumers.delete(roomId, `${sysPublicSubject}:${userId}`);
        } catch (error) {
            // Silent fail
        }

        try {
            await this.jsm.consumers.delete(roomId, `${sysPrivateSubject}:${userId}`);
        } catch (error) {
            // Silent fail
        }

        try {
            await this.jsm.consumers.delete(roomId, `${whiteboardSubject}:${userId}`);
        } catch (error) {
            // Silent fail
        }

        try {
            await this.jsm.consumers.delete(roomId, `${dataChannelSubject}:${userId}`);
        } catch (error) {
            // Silent fail
        }

        this.logger.log(`Deleted all consumers for user ${userId} in room ${roomId}`);
    }
}
