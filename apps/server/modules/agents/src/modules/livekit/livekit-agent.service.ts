import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ServerOptions, AgentServer, initializeLogger } from '@livekit/agents';
import { SharedModule, AppConfigService } from '@server/shared';
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
                if (now - time > 60000) { // Clear after 1 minute
                    this.activeJoins.delete(room);
                }
            }
        }, 30000);

        const { apiKey: googleApiKey } = this.appConfig.thirdParty.gemini;
        const { wsUrl: livekitUrl } = this.appConfig.livekitRoleplay;

        if (!googleApiKey || !livekitUrl) {
            this.logger.log('Missing Gemini API Key or LiveKit URL in config. LiveKit Agent will not start.');
            this.logger.warn('Missing Gemini API Key or LiveKit URL in config. LiveKit Agent will not start.');
            return;
        }

        // Set GOOGLE_API_KEY in environment for the worker
        process.env.GOOGLE_API_KEY = googleApiKey;

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

        // Prevent duplicate joins within a very short window (5s) to allow for F5 reconnects
        const lastJoinTime = this.activeJoins.get(roomName);
        if (lastJoinTime && Date.now() - lastJoinTime < 5000) {
            this.logger.log(`Join request ignored: Agent already joining/active in room ${roomName}`);
            return { success: true, alreadyJoining: true };
        }

        this.activeJoins.set(roomName, Date.now());

        if (!this.server) {
            this.logger.log('Server not initialized, cannot join room');
            this.activeJoins.delete(roomName); // Reset on error
            throw new Error('Agent server not started');
        }

        try {
            this.logger.log(`Simulating job for room: ${roomName} (participant: ${participantIdentity})`);

            // Retry loop for simulateJob because the participant might take a second to connect
            let attempts = 0;
            const maxAttempts = 5;
            let lastError: any;

            while (attempts < maxAttempts) {
                try {
                    await this.server.simulateJob(roomName, participantIdentity);
                    this.logger.log(`simulateJob called successfully on attempt ${attempts + 1}`);
                    return { success: true };
                } catch (e: any) {
                    lastError = e;
                    // If not found, wait and retry
                    if (e.message?.includes('not found') || e.status === 404 || e.message?.includes('does not exist')) {
                        this.logger.log(`Participant not found yet, retrying in 1s... (Attempt ${attempts + 1}/${maxAttempts})`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        attempts++;
                    } else {
                        this.activeJoins.delete(roomName); // Reset on unexpected error
                        throw e; // Rethrow other errors
                    }
                }
            }
            this.logger.log(`Error simulating job after ${maxAttempts} attempts: ${lastError.message}`);
            this.activeJoins.delete(roomName); // Reset on fail
            throw lastError;
        } catch (e: any) {
            this.logger.log(`Error simulating job: ${e.message}`);
            this.activeJoins.delete(roomName); // Ensure reset
            throw e;
        }
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
