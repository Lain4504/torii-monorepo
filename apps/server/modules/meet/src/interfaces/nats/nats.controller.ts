/**
 * NATS Controller
 *
 * Main controller that bootstraps all NATS-related services:
 * - Worker pool for async job processing
 * - System worker stream & consumer
 * - Transcoder stream & consumer  
 * - User connection events tracking
 * - Auth callout service
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsService } from './nats.service';
import { WajlcAuthService } from '../../modules/auth/wajlc-auth.service';
import { NatsUserService } from './nats-user.service';
import { NatsAuthCalloutService } from './nats-auth-callout.service';
import { RetentionPolicy, AckPolicy } from 'nats';
import { NatsSystemEventsService } from './nats-system-events.service';
import { fromBinary } from '@bufbuild/protobuf';
import { NatsMsgClientToServerSchema, NatsMsgClientToServerEvents } from '@workspace/protocol';
import { RoomUserService } from '../../modules/room/room-user.service';

// Constants
const DEFAULT_NUM_WORKERS = 20; //50
const DEFAULT_JOB_QUEUE_SIZE = 500; //1000
const NATS_AUTH_SERVICE_ENDPOINT_SUBJECT = '$SYS.REQ.USER.AUTH';
const NATS_CONNECTION_EVENT_SUBJECT_FORMAT = '$SYS.ACCOUNT.%s.>';
const PREFIX = 'wajlc-';
const NATS_AUTH_SERVICE_NAME = PREFIX + 'auth';
const NATS_AUTH_SERVICE_QUEUE_GROUP = PREFIX + 'auth-queue';
const NATS_CONNECTION_EVENT_QUEUE_GROUP = PREFIX + 'conn-event-queue';
const WEBSOCKET_CLIENT_TYPE = 'websocket';
const TRANSCODER_CONSUMER_DURABLE = 'transcoderWorker';

interface NatsJob {
    handler: () => void | Promise<void>;
}

interface ConnectionEvent {
    type: string;
    client: Record<string, any>;
    reason?: string;
}

/**
 * NatsController manages the lifecycle of NATS services
 */
@Injectable()
export class NatsController implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(NatsController.name);
    private jobQueue: NatsJob[] = [];
    private workers: Promise<void>[] = [];
    private isRunning = true;
    private sysWorkerSubscription: any;
    private connectionEventSubscription: any;
    private authCalloutSubscription: any;

    constructor(
        private readonly configService: ConfigService,
        private readonly natsService: NatsService,
        private readonly authService: WajlcAuthService,
        private readonly natsUserService: NatsUserService,
        private readonly authCalloutService: NatsAuthCalloutService,
        private readonly natsSystemEventsService: NatsSystemEventsService,
        private readonly roomUserService: RoomUserService,
    ) { }

    /**
     * Bootstrap all NATS services on module initialization
     */
    async onModuleInit() {
        this.logger.log('Bootstrapping NATS Controller...');

        try {
            // Wait for NATS connection to be ready
            await this.waitForNatsConnection();

            // Start worker pool
            this.startWorkerPool();

            // Subscribe to auth callout (BEFORE creating streams)
            await this.subscribeToAuthCallout();

            // Create system worker stream
            await this.createSystemWorkerStream();

            // Subscribe to system worker
            await this.subscribeToSystemWorker();

            // Create transcoder stream
            await this.createTranscoderStream();

            // Subscribe to connection events
            await this.subscribeToUsersConnEvents();

            this.logger.log('✅ NATS Controller bootstrapped successfully');
        } catch (error) {
            this.logger.error('Failed to bootstrap NATS Controller:', error);
            throw error;
        }
    }

    /**
     * Wait for NATS connection to be ready
     */
    private async waitForNatsConnection(maxRetries = 10, delayMs = 500): Promise<void> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const jsm = this.natsService.getJetStreamManager();
                if (jsm) {
                    this.logger.log('NATS JetStream connection ready');
                    return;
                }
            } catch (error) {
                // Connection not ready yet
            }

            this.logger.debug(`Waiting for NATS connection... (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        throw new Error('NATS connection timeout - JetStream not ready');
    }

    /**
     * Cleanup on module destroy
     */
    async onModuleDestroy() {
        this.logger.log('Shutting down NATS Controller...');
        this.isRunning = false;

        // Unsubscribe from all subscriptions
        if (this.sysWorkerSubscription) {
            await this.sysWorkerSubscription.unsubscribe?.();
        }
        if (this.connectionEventSubscription) {
            await this.connectionEventSubscription.unsubscribe();
        }

        // Wait for workers to finish
        await Promise.all(this.workers);

        this.logger.log('NATS Controller shut down');
    }

    /**
     * Start worker pool for async job processing
     */
    private startWorkerPool() {
        this.logger.log(`Starting ${DEFAULT_NUM_WORKERS} workers...`);

        for (let i = 0; i < DEFAULT_NUM_WORKERS; i++) {
            const worker = this.worker(i);
            this.workers.push(worker);
        }
    }

    /**
     * Worker function - processes jobs from queue
     */
    private async worker(workerId: number) {
        this.logger.debug(`Worker ${workerId} started`);

        while (this.isRunning) {
            if (this.jobQueue.length > 0) {
                const job = this.jobQueue.shift();
                if (job) {
                    try {
                        await job.handler();
                    } catch (error) {
                        this.logger.error(`Worker ${workerId} error:`, error);
                    }
                }
            } else {
                // Sleep briefly if no jobs
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        this.logger.debug(`Worker ${workerId} stopped`);
    }

    /**
     * Add job to queue
     */
    private enqueueJob(job: NatsJob) {
        if (this.jobQueue.length >= DEFAULT_JOB_QUEUE_SIZE) {
            this.logger.warn('Job queue full, dropping job');
            return;
        }
        this.jobQueue.push(job);
    }

    /**
     * Subscribe to auth callout requests
     */
    private async subscribeToAuthCallout() {
        this.logger.log(`Subscribing to auth callout: ${NATS_AUTH_SERVICE_ENDPOINT_SUBJECT}`);

        try {
            const nc = this.natsService.getNatsConnection();

            // Subscribe with queue group (for load balancing)
            const sub = nc.subscribe(NATS_AUTH_SERVICE_ENDPOINT_SUBJECT, {
                queue: NATS_AUTH_SERVICE_QUEUE_GROUP,
                callback: async (err, msg) => {
                    if (err) {
                        this.logger.error('Auth callout error:', err);
                        return;
                    }

                    // Extract xKey from headers
                    const xKey = msg.headers?.get('Nats-Server-Xkey');

                    // Handle auth callout with raw data
                    try {
                        const response = await this.authCalloutService.handleAuthCallout(
                            msg.data,
                            xKey,
                            null as any, // context not needed
                        );

                        // Respond back to NATS server
                        msg.respond(response);
                    } catch (error) {
                        this.logger.error('Error handling auth callout:', error);
                        // Send error response
                        const errorResponse = Buffer.from(JSON.stringify({ error: error.message }));
                        msg.respond(errorResponse);
                    }
                },
            });

            this.authCalloutSubscription = sub;

            this.logger.log(`✅ Subscribed to auth callout: ${NATS_AUTH_SERVICE_ENDPOINT_SUBJECT}`);
        } catch (error) {
            this.logger.error(`Failed to subscribe to auth callout:`, error);
            throw error;
        }
    }

    /**
     * Create system worker stream
     */
    private async createSystemWorkerStream() {
        const sysJsWorker = this.configService.get<string>('NATS_SUBJECT_SYSTEM_JS_WORKER') || 'sysJsWorker';
        const numReplicas = this.configService.get<number>('NATS_NUM_REPLICAS') || 1;

        this.logger.log(`Creating system worker stream: ${sysJsWorker}`);

        try {
            const jsm = this.natsService.getJetStreamManager();

            // Create or update stream
            await jsm.streams.add({
                name: sysJsWorker,
                subjects: [`${sysJsWorker}.*.*`],
                num_replicas: numReplicas,
                retention: RetentionPolicy.Workqueue, // WorkQueuePolicy
            }).catch(async (err) => {
                // If exists, update it
                if (err.message?.includes('already in use')) {
                    await jsm.streams.update(sysJsWorker, {
                        subjects: [`${sysJsWorker}.*.*`],
                    });
                } else {
                    throw err;
                }
            });

            this.logger.log(`✅ System worker stream created: ${sysJsWorker}`);
        } catch (error) {
            this.logger.error(`Failed to create system worker stream:`, error);
            throw error;
        }
    }

    /**
     * Subscribe to system worker stream
     */
    private async subscribeToSystemWorker() {
        const sysJsWorker = this.configService.get<string>('NATS_SUBJECT_SYSTEM_JS_WORKER') || 'sysJsWorker';

        this.logger.log(`Subscribing to system worker: ${sysJsWorker}`);

        try {
            const jsm = this.natsService.getJetStreamManager();
            const js = this.natsService.getJetStream();

            // Create consumer
            const consumer = await jsm.consumers.add(sysJsWorker, {
                durable_name: `${PREFIX}${sysJsWorker}`,
                ack_policy: AckPolicy.Explicit,
            });

            // Get consumer instance and subscribe to messages
            const c = await js.consumers.get(sysJsWorker, `${PREFIX}${sysJsWorker}`);
            const messages = await c.consume();

            // Process messages
            (async () => {
                for await (const msg of messages) {
                    // Enqueue job for worker pool
                    this.enqueueJob({
                        handler: async () => {
                            await this.handleSystemWorkerMessage(msg);
                            msg.ack();
                        },
                    });
                }
            })().catch(err => {
                this.logger.error('Error in system worker consumer:', err);
            });

            this.sysWorkerSubscription = messages;

            this.logger.log(`✅ Subscribed to system worker: ${sysJsWorker}`);
        } catch (error) {
            this.logger.error(`Failed to subscribe to system worker:`, error);
            throw error;
        }
    }

    /**
     * Handle system worker message
     */
    /**
     * Handle system worker message
     */
    private async handleSystemWorkerMessage(msg: any) {
        try {
            const subject = msg.subject;
            const data = msg.data;

            // Parse subject: sysJsWorker.{roomId}.{userId}
            const parts = subject.split('.');
            if (parts.length !== 3) {
                this.logger.warn(`Invalid subject format: ${subject}`);
                return;
            }

            const [, roomId, userId] = parts;

            // Decode protobuf message
            let req;
            try {
                req = fromBinary(NatsMsgClientToServerSchema, data);
            } catch (err) {
                this.logger.error(`Failed to decode NatsMsgClientToServer: ${err.message}`);
                return;
            }

            this.logger.debug(`System worker received event: ${NatsMsgClientToServerEvents[req.event]} from user: ${userId} in room: ${roomId}`);

            switch (req.event) {
                case NatsMsgClientToServerEvents.REQ_INITIAL_DATA:
                    await this.natsSystemEventsService.handleInitialData(roomId, userId);
                    break;

                case NatsMsgClientToServerEvents.REQ_JOINED_USERS_LIST:
                    await this.natsSystemEventsService.handleSendUsersList(roomId, userId);
                    break;

                case NatsMsgClientToServerEvents.REQ_MEDIA_SERVER_DATA:
                    // CRITICAL: Must pass broadcast: true so client receives LiveKit connection info
                    await this.natsSystemEventsService.handleMediaServerInfo(roomId, userId, undefined, true);
                    break;

                case NatsMsgClientToServerEvents.REQ_RENEW_WAJLC_TOKEN:
                    // Message format is roomI:userId but usually token is sent

                    await this.natsSystemEventsService.renewWajlcToken(roomId, userId, req.msg);
                    break;

                case NatsMsgClientToServerEvents.PING:
                    await this.natsSystemEventsService.handleClientPing(roomId, userId);
                    break;

                case NatsMsgClientToServerEvents.REQ_RAISE_HAND:
                    // User raises hand - notify admins
                    await this.roomUserService.raisedHand(roomId, userId, req.msg);
                    break;

                case NatsMsgClientToServerEvents.REQ_LOWER_HAND:
                    // User lowers their own hand
                    await this.roomUserService.lowerHand(roomId, userId);
                    break;

                case NatsMsgClientToServerEvents.REQ_LOWER_OTHER_USER_HAND:
                    // Admin lowers another user's hand
                    // req.msg contains the target userId
                    await this.roomUserService.lowerHand(roomId, req.msg);
                    break;

                case NatsMsgClientToServerEvents.PUSH_ANALYTICS_DATA:
                    // Analytics data from client - currently not implemented
                    // TODO: Implement analytics service
                    this.logger.debug(`Analytics data received from ${userId}, not yet implemented`);
                    break;

                default:
                    this.logger.debug(`Unhandled system event: ${NatsMsgClientToServerEvents[req.event]}`);
                    break;
            }

        } catch (error) {
            this.logger.error('Error handling system worker message:', error);
        }
    }

    /**
     * Create transcoder stream for recorder

     */
    private async createTranscoderStream() {
        const transcodingJobs = this.configService.get<string>('NATS_TRANSCODING_JOBS') || 'recorderTranscoderJobs';
        const numReplicas = this.configService.get<number>('NATS_NUM_REPLICAS') || 1;

        this.logger.log(`Creating transcoder stream: ${transcodingJobs}`);

        try {
            const jsm = this.natsService.getJetStreamManager();

            // Create or update stream
            await jsm.streams.add({
                name: transcodingJobs,
                subjects: [transcodingJobs],
                num_replicas: numReplicas,
                retention: RetentionPolicy.Workqueue,
            }).catch(async (err) => {
                if (err.message?.includes('already in use')) {
                    await jsm.streams.update(transcodingJobs, {
                        subjects: [transcodingJobs],
                    });
                } else {
                    throw err;
                }
            });

            // Create consumer
            await jsm.consumers.add(transcodingJobs, {
                durable_name: TRANSCODER_CONSUMER_DURABLE,
                ack_policy: AckPolicy.Explicit,
            }).catch(() => {
                // Consumer might already exist
            });

            this.logger.log(`✅ Transcoder stream created: ${transcodingJobs}`);
        } catch (error) {
            this.logger.error(`Failed to create transcoder stream:`, error);
            throw error;
        }
    }

    /**
     * Subscribe to user connection events

     */
    private async subscribeToUsersConnEvents() {
        const account = this.configService.get<string>('NATS_ACCOUNT_NAME') || 'PNM';
        const subject = NATS_CONNECTION_EVENT_SUBJECT_FORMAT.replace('%s', account);

        this.logger.log(`Subscribing to connection events: ${subject}`);

        try {
            const nc = this.natsService.getNatsConnection();

            // Subscribe with queue group
            const sub = nc.subscribe(subject, {
                queue: NATS_CONNECTION_EVENT_QUEUE_GROUP,
                callback: (err, msg) => {
                    if (err) {
                        this.logger.error('Connection event error:', err);
                        return;
                    }

                    const isConnect = msg.subject.includes('.CONNECT');
                    const isDisconnect = msg.subject.includes('.DISCONNECT');

                    if (!isConnect && !isDisconnect) {
                        return;
                    }

                    // Copy data to avoid race conditions
                    const dataCopy = Buffer.from(msg.data);

                    // Enqueue job for worker pool
                    this.enqueueJob({
                        handler: () => this.handleUserConnectionEvent(dataCopy, isConnect),
                    });
                },
            });

            this.connectionEventSubscription = sub;

            this.logger.log(`✅ Subscribed to connection events: ${subject}`);
        } catch (error) {
            this.logger.error(`Failed to subscribe to connection events:`, error);
            throw error;
        }
    }

    /**
     * Handle user connection event (CONNECT/DISCONNECT)

     */
    private handleUserConnectionEvent(data: Buffer, isConnect: boolean) {
        try {
            // Parse JSON event
            const event: ConnectionEvent = JSON.parse(data.toString());

            this.logger.debug('Connection event received', {
                type: event.type,
                isConnect,
                client: event.client,
                reason: event.reason,
            });

            // Check if websocket client
            const clientType = event.client?.client_type;
            if (clientType && clientType !== WEBSOCKET_CLIENT_TYPE) {
                this.logger.debug(`Ignoring non-websocket connection: ${clientType}`);
                return;
            }

            // Extract user token from client info
            const userToken = event.client?.user;
            if (!userToken || typeof userToken !== 'string') {
                this.logger.debug('No user token in connection event');
                return;
            }

            // Get claims without verification (unsafe but needed here)
            const claims = this.authService.unsafeClaimsWithoutVerification(userToken);
            if (!claims) {
                this.logger.warn('Failed to parse claims from connection event');
                return;
            }

            // Skip recorder connections
            if (claims.name === 'RECORDER') {
                return;
            }

            // Update user status
            if (isConnect) {
                this.logger.log(`User connected: ${claims.userId} in room ${claims.roomId}`);
                this.natsUserService.onAfterUserJoined(claims.roomId, claims.userId);
            } else {
                this.logger.log(`User disconnected: ${claims.userId} from room ${claims.roomId}`);
                this.natsUserService.onAfterUserDisconnected(claims.roomId, claims.userId);
            }
        } catch (error) {
            this.logger.error('Error handling connection event:', error);
        }
    }
}
