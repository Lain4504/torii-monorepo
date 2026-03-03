import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ServerOptions, AgentServer, initializeLogger } from '@livekit/agents';
import { WorkerMessage, JobType } from '@livekit/protocol';
import { Room, ParticipantInfo } from 'livekit-server-sdk';
import { AppConfigService } from '@server/shared';
import * as path from 'path';

@Injectable()
export class LivekitAgentService implements OnModuleInit {
    private readonly logger = new Logger(LivekitAgentService.name);
    private server?: AgentServer;
    private activeJoins = new Map<string, number>();

    constructor(private readonly appConfig: AppConfigService) { }

    async onModuleInit() {
        this.logger.log('Service initialized');
        // Clean up activeJoins map periodically
        setInterval(() => {
            const now = Date.now();
            for (const [room, time] of this.activeJoins.entries()) {
                if (now - time > 600000) { // Clear after 10 minutes
                    this.activeJoins.delete(room);
                }
            }
        }, 60000);

        const { apiKey: googleApiKey } = this.appConfig.thirdParty.gemini;
        const { wsUrl: livekitUrl } = this.appConfig.livekitRoleplay;

        if (!googleApiKey || !livekitUrl) {
            this.logger.log('Missing Gemini API Key or LiveKit URL in config. LiveKit Agent will not start.');
            this.logger.warn('Missing Gemini API Key or LiveKit URL in config. LiveKit Agent will not start.');
            return;
        }

        // Set environment variables for the worker process (agent-entry.ts has no DI context)
        process.env.GOOGLE_API_KEY = googleApiKey;
        process.env.NATS_URL = this.appConfig.nats?.url || 'nats://localhost:4222';
        process.env.NATS_NKEY_SEED = this.appConfig.nats?.nkeySeed || '';
        process.env.REDIS_HOST = this.appConfig.redis?.host || 'localhost';
        process.env.REDIS_PORT = String(this.appConfig.redis?.port || 6379);
        process.env.REDIS_PASSWORD = this.appConfig.redis?.password || '';

        this.logger.log('Starting LiveKit Agent worker...');

        // Initialize LiveKit logger first
        initializeLogger({ pretty: true, level: 'debug' });

        this.startWorker().catch((err) => {
            this.logger.log(`Failed to start LiveKit Agent worker: ${err.message}`);
            this.logger.error('Failed to start LiveKit Agent worker', err);
        });
    }

    async joinRoom(roomName: string, participantIdentity?: string) {
        this.logger.log(`Received joinRoom request for: ${roomName}`);

        // Dedup by roomName: prevent retries to the same room
        const lastJoinTime = this.activeJoins.get(roomName);
        if (lastJoinTime && Date.now() - lastJoinTime < 300000) {
            this.logger.log(`Join request ignored: Agent already joining/active in room ${roomName}`);
            return { success: true, alreadyJoining: true };
        }

        // Dedup by participantIdentity: prevent same user from spawning 2 agents
        // (catches React StrictMode double-invocation with different timestamp-based room IDs)
        if (participantIdentity) {
            const userKey = `user:${participantIdentity}`;
            const lastUserJoin = this.activeJoins.get(userKey);
            if (lastUserJoin && Date.now() - lastUserJoin < 300000) {
                this.logger.log(`Join request ignored: User ${participantIdentity} already has an active agent`);
                return { success: true, alreadyJoining: true };
            }
            this.activeJoins.set(userKey, Date.now());
        }

        this.activeJoins.set(roomName, Date.now());

        if (!this.server) {
            this.logger.log('Server not initialized, cannot join room');
            this.activeJoins.delete(roomName);
            throw new Error('Agent server not started');
        }

        try {
            this.logger.log(`Dispatching local job for room: ${roomName} (participant: ${participantIdentity})`);
            this.dispatchJobLocally(roomName, participantIdentity);
            this.logger.log(`Job dispatched successfully for room: ${roomName}`);
            return { success: true };
        } catch (e: any) {
            this.logger.error(`Error dispatching job: ${e.message}`);
            this.activeJoins.delete(roomName);
            if (participantIdentity) this.activeJoins.delete(`user:${participantIdentity}`);
            throw e;
        }
    }

    /**
     * Bypass simulateJob() which calls the LiveKit Cloud REST API (createRoom + getParticipant).
     * Instead, emit the worker_msg event directly into AgentServer's EventEmitter with
     * minimal Room/Participant stubs — this is exactly what simulateJob does after the REST calls.
     */
    /**
     * Clear join locks for a user and room to allow immediate re-entry.
     * Called via NATS from agent-entry.ts when a session finishes.
     */
    clearJoinLock(roomName: string, userId?: string) {
        this.logger.log(`Clearing join locks for room: ${roomName}, user: ${userId}`);
        this.activeJoins.delete(roomName);
        if (userId) {
            this.activeJoins.delete(`user:${userId}`);
        }
    }

    private dispatchJobLocally(roomName: string, participantIdentity?: string) {
        const room = new Room({ name: roomName, sid: `RM_${roomName}` });

        let participant: InstanceType<typeof ParticipantInfo> | undefined;
        if (participantIdentity) {
            participant = new ParticipantInfo({
                identity: participantIdentity,
                sid: `PA_${participantIdentity}`,
                name: participantIdentity,
            });
        }

        (this.server as any).event.emit(
            'worker_msg',
            new WorkerMessage({
                message: {
                    case: 'simulateJob',
                    value: {
                        type: JobType.JT_PUBLISHER,
                        room: room as any,
                        participant: participant as any,
                    },
                },
            }),
        );
    }

    private async startWorker() {
        // Point to the compiled Javascript file
        const agentFile = path.resolve(__dirname, 'agent-entry.js');
        this.logger.log(`Agent file path: ${agentFile}`);

        const { wsUrl: wsURL, apiKey, apiSecret } = this.appConfig.livekitRoleplay;

        const serverOptions = new ServerOptions({
            agent: agentFile,
            wsURL,
            apiKey,
            apiSecret,
            production: false,
            logLevel: 'debug'
        });

        this.server = new AgentServer(serverOptions);

        try {
            this.logger.log('Starting AgentServer.run()');
            await this.server.run();
            this.logger.log('AgentServer.run() finished');
        } catch (e: any) {
            this.logger.log(`AgentServer error: ${e.message}`);
            throw e;
        }
    }
}
