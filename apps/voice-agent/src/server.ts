import path from 'path';
import dotenv from 'dotenv';

// Load .env from the current service directory
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

import express from 'express';
import cors from 'cors';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { ServerOptions, AgentServer, initializeLogger } from '@livekit/agents';
import { WorkerMessage, JobType } from '@livekit/protocol';
import { Room, ParticipantInfo } from 'livekit-server-sdk';
import { VOICE_GRAPHS } from './graphs';
import fs from 'fs';

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '8082', 10);
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';

console.log(`[Server] Environment loaded from: ${envPath}`);
console.log(`[Server] LiveKit Config: URL=${LIVEKIT_URL}, Key=${LIVEKIT_API_KEY.substring(0, 5)}...`);
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';

if (!GOOGLE_API_KEY) {
    console.error('[Server] GOOGLE_API_KEY is not set.');
    process.exit(1);
}

// ─── Setup ───────────────────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());

// ─── LiveKit Agent Server ────────────────────────────────────────────────────
let agentServer: AgentServer | null = null;
const activeRoomJobs = new Map<string, { jobId: string, timestamp: number }>();

async function startAgentWorker() {
    console.log('[Server] Starting LiveKit Agent worker...');

    // Initialize LiveKit logger
    initializeLogger({ pretty: true, level: 'debug' });

    // Determine agent file extension (use .ts in dev, .js in prod)
    const isTs = __filename.endsWith('.ts');
    const agentFile = path.resolve(__dirname, isTs ? 'agent-entry.ts' : 'agent-entry.js');

    console.log(`[Server] Environment loaded from: ${envPath}`);
    console.log(`[Server] Agent file path: ${agentFile}`);
    console.log(`[Server] LiveKit Config: URL=${LIVEKIT_URL}, Key=${LIVEKIT_API_KEY.substring(0, 5)}...`);

    const serverOptions = new ServerOptions({
        agent: agentFile,
        wsURL: LIVEKIT_URL,
        apiKey: LIVEKIT_API_KEY,
        apiSecret: LIVEKIT_API_SECRET,
        production: !isTs, // Enable dev mode when running TS files
    });

    agentServer = new AgentServer(serverOptions);

    try {
        // Run the server in a way that handles workers
        agentServer.run().catch(err => {
            console.error('[Server] AgentServer encountered an error:', err);
        });

        // Use simple time-based locking instead of complex event tracking
        // as job.room is often undefined during worker dispatch events.
        console.log('[Server] AgentServer is running.');
    } catch (err) {
        console.error('[Server] Failed to run AgentServer:', err);
    }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /start
 * Triggers a LiveKit agent to join a specified room.
 * Replaces the old WebSocket-based session start.
 */
app.post('/start', async (req, res) => {
    const {
        channel_name, // LiveKit room name
        user_id,      // Target participant identity
        graph_name = 'roleplay',
    } = req.body;

    if (!channel_name) {
        return res.status(400).json({ success: false, message: 'channel_name (room) is required' });
    }

    if (!agentServer) {
        return res.status(503).json({ success: false, message: 'Agent server not initialized' });
    }

    try {
        // ─── Room Lock Check ─────────────────────────────────────────────────────
        const lock = activeRoomJobs.get(channel_name);
        const now = Date.now();
        if (lock && now - lock.timestamp < 10000) { // 10s cooldown
            console.log(`[Server] [Safety] Join request for ${channel_name} ignored (job ${lock.jobId} active/pending)`);
            return res.json({ success: true, message: 'Agent already joining this room', roomId: channel_name });
        }

        console.log(`[Server] Dispatching job for room ${channel_name}, graph ${graph_name}...`);

        // Use simulateJob pattern to force the agent to join the room
        const room = new Room({ name: channel_name });
        const participant = new ParticipantInfo({
            identity: user_id || 'unknown',
            name: user_id || 'Learner',
        });

        // Provide graphName to the worker via job metadata
        const jobMetadata = JSON.stringify({ graphName: graph_name });

        // Set an immediate, unyielding 15-second lock to absolutely block any React Strict Mode double-fetches
        activeRoomJobs.set(channel_name, { jobId: 'pending', timestamp: now });

        (agentServer as any).event.emit(
            'worker_msg',
            new WorkerMessage({
                message: {
                    case: 'simulateJob',
                    value: {
                        type: JobType.JT_PUBLISHER,
                        room: room as any,
                        participant: participant as any,
                        metadata: jobMetadata,
                    } as any, // Cast to any to avoid property mismatch in older protocol versions
                },
            }),
        );

        return res.json({
            success: true,
            room: channel_name,
            message: `Agent dispatched to room ${channel_name}`,
        });
    } catch (err: any) {
        console.error('[Server] Failed to dispatch job:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * POST /stop
 */
app.post('/stop', (req, res) => {
    const { channel_name } = req.body;
    console.log(`[Server] Stop requested for ${channel_name} (actual stop handled by room disconnection)`);
    return res.json({ success: true, message: 'Stop signal received.' });
});

/**
 * GET /graphs
 */
app.get('/graphs', (_req, res) => {
    const graphs = Object.values(VOICE_GRAPHS).map(g => ({
        name: g.name,
        displayName: g.displayName,
        language: g.language,
        voice: g.voice,
    }));
    return res.json({ success: true, graphs });
});

/**
 * GET /health
 */
app.get('/health', (_req, res) => {
    return res.json({ status: 'ok', agentServer: !!agentServer });
});

// ─── Start ───────────────────────────────────────────────────────────────────
httpServer.listen(PORT, async () => {
    console.log(`\n🎙️  Torii LiveKit Voice Agent Server`);
    console.log(`   HTTP: http://localhost:${PORT}`);
    console.log(`   Internal LiveKit URL: ${LIVEKIT_URL}\n`);

    await startAgentWorker();
});

// Graceful shutdown and cleanup for tsx watch
const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    // Immediately stop accepting new HTTP connections to free port 8123
    httpServer.close();

    // In dev mode (tsx watch), we want to exit quickly so the new process
    // can bind to the port without EADDRINUSE. LiveKit's internal graceful 
    // shutdown delays the exit, so we force an exit.
    setTimeout(() => {
        process.exit(0);
    }, 500);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
