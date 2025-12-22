/**
 * NATS Service - Base Service
 * Equivalent to Go: plugNmeet-server/pkg/services/nats/nats_service.go
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
} from 'nats';

// Constants matching Go
const NATS_PREFIX = 'pnm-';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Proto JSON options matching Go
 * Go: protoJsonOpts = protojson.MarshalOptions{
 *   EmitUnpopulated: true,
 *   UseProtoNames:   true,
 * }
 * 
 * @bufbuild/protobuf uses:
 * - alwaysEmitImplicit: true  (equivalent to EmitUnpopulated)
 * - useProtoFieldName: true   (equivalent to UseProtoNames)
 */
const PROTO_JSON_OPTIONS = {
    alwaysEmitImplicit: true,  // equivalent to EmitUnpopulated
    useProtoFieldName: true,    // equivalent to UseProtoNames
};

/**
 * NatsService is the main NATS service
 * Equivalent to Go: NatsService struct
 * 
 * Go struct:
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

    // NATS connection variables (matching Go struct)
    private nc: NatsConnection;       // NATS connection (matching Go: nc *nats.Conn)
    private js: JetStreamClient;      // JetStream (matching Go: js jetstream.JetStream)
    private jsm: JetStreamManager;    // JetStream Manager (for admin operations)
    private cs: NatsCacheService;     // Cache Service (matching Go: cs *NatsCacheService)

    constructor(
        private readonly configService: ConfigService,
        private readonly cacheService: NatsCacheService,
    ) {
        // Initialize cs field (matching Go: cs: GetNatsCacheService(app, log.Logger))
        this.cs = cacheService;
    }

    async onModuleInit() {
        this.logger.log('Initializing NATS Service...');
        await this.connectToNats();
        this.logger.log('NATS Service initialized');
    }

    async onModuleDestroy() {
        this.logger.log('Closing NATS connection...');
        await this.closeNatsConnection();
        this.logger.log('NATS connection closed');
    }

    /**
     * Connect to NATS with optional NKEY authentication
     * Equivalent to Go: app.NatsConn initialization
     */
    private async connectToNats(): Promise<void> {
        try {
            const natsUrl = this.configService.get<string>('NATS_URL') || 'nats://localhost:4222';
            const nkeySeed = this.configService.get<string>('NATS_NKEY_SEED');

            const options: any = {
                servers: [natsUrl],
                name: 'nestjs-room-service',
            };

            // Add NKEY authentication if provided (matching Go's auth setup)
            if (nkeySeed) {
                options.authenticator = nkeyAuthenticator(
                    new TextEncoder().encode(nkeySeed)
                );
                this.logger.log('NATS NKEY authentication enabled');
            }

            // Connect to NATS (matching Go: app.NatsConn, err := nats.Connect(...))
            this.nc = await connect(options);

            // Initialize JetStream (matching Go: app.JetStream = jetstream.New(nc))
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
    // Metadata Marshaling Methods (matching Go exactly)
    // ============================================================================

    /**
     * MarshalToProtoJson converts protobuf message to JSON string
     * Equivalent to Go: s.MarshalToProtoJson
     * 
     * Uses options:
     * - EmitUnpopulated: true (include default values)
     * - UseProtoNames: true (use snake_case field names)
     */
    marshalToProtoJson<T>(message: T, schema: any): string {
        // Using @bufbuild/protobuf's toJsonString with options
        // Note: @bufbuild/protobuf uses different option names than protobuf-js
        return toJsonString(schema, message as any, {
            alwaysEmitImplicit: true,  // equivalent to Go's EmitUnpopulated
            useProtoFieldName: true,    // equivalent to Go's UseProtoNames (snake_case)
        });
    }

    /**
     * MarshalRoomMetadata converts RoomMetadata to JSON string
     * Equivalent to Go: s.MarshalRoomMetadata
     * 
     * Adds metadataId before marshaling (matching Go)
     */
    marshalRoomMetadata(metadata: RoomMetadata): string {
        // Add metadata ID (matching Go: mId := uuid.NewString(); meta.MetadataId = &mId)
        const metadataWithId = {
            ...metadata,
            metadataId: uuidv4(),
        };

        return this.marshalToProtoJson(metadataWithId, RoomMetadataSchema);
    }

    /**
     * UnmarshalRoomMetadata converts JSON string to RoomMetadata
     * Equivalent to Go: s.UnmarshalRoomMetadata
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
     * Equivalent to Go: s.MarshalUserMetadata
     * 
     * Adds metadataId before marshaling (matching Go)
     */
    marshalUserMetadata(metadata: UserMetadata): string {
        // Add metadata ID (matching Go: mId := uuid.NewString(); meta.MetadataId = &mId)
        const metadataWithId = {
            ...metadata,
            metadataId: uuidv4(),
        };

        return this.marshalToProtoJson(metadataWithId, UserMetadataSchema);
    }

    /**
     * UnmarshalUserMetadata converts JSON string to UserMetadata
     * Equivalent to Go: s.UnmarshalUserMetadata
     */
    unmarshalUserMetadata(metadataJson: string): UserMetadata {
        if (!metadataJson) {
            return create(UserMetadataSchema, {});
        }

        // Using @bufbuild/protobuf's fromJsonString
        return fromJsonString(UserMetadataSchema, metadataJson);
    }

    // ============================================================================
    // Getters for internal services (matching Go struct access)
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
     * Equivalent to Go: s.cs field access
     */
    getCacheService(): NatsCacheService {
        return this.cs;
    }

    // ============================================================================
    // Webhook Methods (from webhook.go)
    // ============================================================================

    /**
     * Webhook KV bucket name
     * Equivalent to Go: WebhookKvKey = Prefix + "webhookData"
     */
    private static readonly WEBHOOK_KV_KEY = `${NATS_PREFIX}webhookData`;

    /**
     * Webhook cleanup NATS subject
     * Equivalent to Go: WebhookCleanupSubject = Prefix + "webhookCleanup"
     */
    static readonly WEBHOOK_CLEANUP_SUBJECT = `${NATS_PREFIX}webhookCleanup`;

    /**
     * AddWebhookData stores webhook data for a room in NATS KV
     * Equivalent to Go: s.AddWebhookData
     */
    async addWebhookData(roomId: string, val: string): Promise<void> {
        try {
            // Create or update KV bucket
            const kv = await this.js.views.kv(NatsService.WEBHOOK_KV_KEY, {
                history: 1,
                ttl: DEFAULT_TTL * 1000000, // Convert to nanoseconds
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
     * Equivalent to Go: s.GetWebhookData
     * 
     * Returns null if bucket or key not found (matching Go behavior)
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
            // Handle errors matching Go's switch statement
            if (error.message && error.message.includes('bucket not found')) {
                // Equivalent to Go: errors.Is(err, jetstream.ErrBucketNotFound)
                return null;
            }
            if (error.message && error.message.includes('key not found')) {
                // Equivalent to Go: errors.Is(err, jetstream.ErrKeyNotFound)
                return null;
            }
            throw error;
        }
    }

    /**
     * DeleteWebhookData deletes webhook data for a room from NATS KV
     * Equivalent to Go: s.DeleteWebhookData
     * 
     * Silently succeeds if bucket not found (matching Go behavior)
     */
    async deleteWebhookData(roomId: string): Promise<void> {
        try {
            // Get KV bucket
            const kv = await this.js.views.kv(NatsService.WEBHOOK_KV_KEY);

            // Purge the key (delete all revisions)
            await kv.purge(roomId);
        } catch (error) {
            // Handle errors matching Go's switch statement
            if (error.message && error.message.includes('bucket not found')) {
                // Equivalent to Go: errors.Is(err, jetstream.ErrBucketNotFound) → return nil
                return;
            }
            throw error;
        }
    }
}
