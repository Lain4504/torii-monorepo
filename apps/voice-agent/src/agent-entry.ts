import { AutoSubscribe, JobContext, voice, defineAgent } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { EndSensitivity, StartSensitivity } from '@google/genai';
import { getGraph } from './graphs';

type SessionMetadata = {
    graphName?: string;
    instructions?: string;
    model?: string;
    voice?: string;
    temperature?: number;
    maxOutputTokens?: number | 'inf';
    modalities?: string[];
    geminiApiKey?: string;
};

type SessionConfig = {
    graphName: string;
    instructions: string;
    model: string;
    voice: string;
    temperature: number;
    maxOutputTokens?: number | 'inf';
    modalities?: string[];
    geminiApiKey?: string;
};

function parseModalities(input: unknown): string[] | undefined {
    if (Array.isArray(input)) {
        const values = input
            .filter((v): v is string => typeof v === 'string')
            .map(v => v.toUpperCase())
            .filter(v => v === 'TEXT' || v === 'AUDIO');
        return values.length > 0 ? values : undefined;
    }

    if (typeof input !== 'string') {
        return undefined;
    }

    const value = input.toLowerCase();
    if (value === 'text_and_audio') return ['TEXT', 'AUDIO'];
    if (value === 'text_only') return ['TEXT'];
    if (value === 'audio_only') return ['AUDIO'];
    return undefined;
}

function parseSessionConfigObject(data: Record<string, unknown>): SessionMetadata {
    const temperature = Number(data.temperature);
    const maxOutputRaw = data.max_output_tokens ?? data.maxOutputTokens;
    const maxOutputTokens =
        maxOutputRaw === 'inf'
            ? 'inf'
            : typeof maxOutputRaw === 'string' && maxOutputRaw.trim().length === 0
                ? undefined
                : Number.isFinite(Number(maxOutputRaw))
                    ? Number(maxOutputRaw)
                    : undefined;

    const graphName =
        typeof data.graphName === 'string'
            ? data.graphName
            : typeof data.graph_name === 'string'
                ? data.graph_name
                : undefined;

    const geminiKeyRaw = data.gemini_api_key ?? data.geminiApiKey;
    const geminiApiKey =
        typeof geminiKeyRaw === 'string' && geminiKeyRaw.trim().length > 0
            ? geminiKeyRaw.trim()
            : undefined;

    return {
        graphName,
        instructions: typeof data.instructions === 'string' ? data.instructions : undefined,
        model: typeof data.model === 'string' ? data.model : undefined,
        voice: typeof data.voice === 'string' ? data.voice : undefined,
        temperature: Number.isFinite(temperature) ? temperature : undefined,
        maxOutputTokens,
        modalities: parseModalities(data.modalities),
        geminiApiKey,
    };
}

function parseSessionMetadata(raw: string | undefined): SessionMetadata {
    if (!raw) {
        return {};
    }

    try {
        const data = JSON.parse(raw) as Record<string, unknown>;
        return parseSessionConfigObject(data);
    } catch (error) {
        console.warn('[Agent] Failed to parse participant metadata config, using defaults.', error);
        return {};
    }
}

function buildSessionConfig(graphName: string, overrides: SessionMetadata): SessionConfig {
    const graph = getGraph(graphName);
    return {
        graphName: graph.name,
        instructions: overrides.instructions || graph.systemPrompt,
        model: overrides.model || graph.model,
        voice: overrides.voice || graph.voice,
        temperature: overrides.temperature ?? graph.temperature ?? 0.8,
        maxOutputTokens: overrides.maxOutputTokens,
        modalities: overrides.modalities,
        geminiApiKey: overrides.geminiApiKey,
    };
}

function mergeSessionConfig(current: SessionConfig, patch: SessionMetadata): SessionConfig {
    const base =
        patch.graphName && patch.graphName !== current.graphName
            ? buildSessionConfig(patch.graphName, { geminiApiKey: current.geminiApiKey })
            : { ...current };

    return {
        ...base,
        graphName: patch.graphName ? getGraph(patch.graphName).name : base.graphName,
        instructions: patch.instructions ?? base.instructions,
        model: patch.model ?? base.model,
        voice: patch.voice ?? base.voice,
        temperature: patch.temperature ?? base.temperature,
        maxOutputTokens: patch.maxOutputTokens ?? base.maxOutputTokens,
        modalities: patch.modalities ?? base.modalities,
        geminiApiKey: patch.geminiApiKey ?? base.geminiApiKey,
    };
}

function sameStringArray(a?: string[], b?: string[]): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((value, idx) => value === b[idx]);
}

function areConfigsEqual(a: SessionConfig, b: SessionConfig): boolean {
    return (
        a.graphName === b.graphName &&
        a.instructions === b.instructions &&
        a.model === b.model &&
        a.voice === b.voice &&
        a.temperature === b.temperature &&
        a.maxOutputTokens === b.maxOutputTokens &&
        a.geminiApiKey === b.geminiApiKey &&
        sameStringArray(a.modalities, b.modalities)
    );
}

export default defineAgent({
    entry: async (ctx: JobContext) => {
        const roomName = ctx.job.room?.name || 'unknown';
        console.log(`[Agent] Joining room: ${roomName}`);

        // Wait for room connection
        await ctx.connect(undefined, AutoSubscribe.AUDIO_ONLY);
        // Make our presence known to other agents immediately
        const myJoiningTimeStr = Date.now().toString();
        // We use metadata as it's more standard and triggers specific events
        await ctx.room.localParticipant.updateMetadata(JSON.stringify({ joinedAt: myJoiningTimeStr }));
        // Also update name for legacy compatibility with older agents until they are all restarted
        await ctx.room.localParticipant.updateName(myJoiningTimeStr);

        // ─── Continuous Agent Safety (Anti-Double Agent) ─────────────────────────
        const myIdentity = `agent-${ctx.job.id}`;
        let shouldQuit = false;

        const checkSafety = async () => {
            const myTime = parseInt(myJoiningTimeStr, 10);

            let newestPeerId = '';
            let newestPeerTime = 0;

            for (const [, p] of ctx.room.remoteParticipants) {
                if (p.identity.startsWith('agent-')) {
                    // Try to get peer join time from their metadata first
                    let peerTime = 0;
                    try {
                        const meta = JSON.parse(p.metadata || '{}');
                        peerTime = parseInt(meta.joinedAt || '0', 10) || 0;
                    } catch (e) {
                        // Not JSON, fallback to name
                    }

                    // Fallback to name (for legacy compatibility)
                    if (peerTime === 0) {
                        peerTime = parseInt(p.name || '0', 10) || 0;
                    }

                    if (peerTime > newestPeerTime || (peerTime === newestPeerTime && p.identity > newestPeerId)) {
                        newestPeerTime = peerTime;
                        newestPeerId = p.identity;
                    }
                }
            }

            if (newestPeerId) {
                // If peer joined AFTER me (larger timestamp), I am the OLD agent. I should quit.
                // If timestamps are equal, use identity as tie-breaker.
                if (newestPeerTime > myTime || (newestPeerTime === myTime && myIdentity > newestPeerId)) {
                    if (!shouldQuit) {
                        console.log(`[Agent] [Safety] Newer peer agent detected: ${newestPeerId} (Newer: ${newestPeerTime} > MyTime: ${myTime}). Quitting OLD job: ${myIdentity}`);
                        shouldQuit = true;
                        await ctx.room.disconnect();
                    }
                    return true;
                }
                console.log(`[Agent] [Safety] Peer agent detected: ${newestPeerId} (Older: ${newestPeerTime} <= MyTime: ${myTime}). Proceeding...`);
            }
            return false;
        };

        // 1. Initial check with minimal jitter to avoid race conditions
        const jitter = Math.floor(Math.random() * 100) + 50; // Just 50-150ms
        await new Promise(resolve => setTimeout(resolve, jitter));

        if (await checkSafety()) return;

        // Removed retry loop for legacy name propagation to minimize initial delay.
        // Modern agents use metadata which is much faster.

        // 2. Continuous monitoring for new agents joining or updating info
        ctx.room.on('participantConnected', async (p) => {
            if (p.identity.startsWith('agent-')) {
                console.log(`[Agent] [Safety] New agent joined: ${p.identity}. Re-running safety check in 1s...`);
                await new Promise(r => setTimeout(r, 1000));
                await checkSafety();
            }
        });

        // Instant reaction if another agent updates its metadata/name
        const onPeerUpdate = async (p: any) => {
            if (p.identity.startsWith('agent-') && p.identity !== myIdentity) {
                console.log(`[Agent] [Safety] Peer agent ${p.identity} updated info. Re-checking safety...`);
                await checkSafety();
            }
        };

        ctx.room.on('participantMetadataChanged', (_, p) => onPeerUpdate(p));
        ctx.room.on('participantNameChanged', (_, p) => onPeerUpdate(p));

        // 3. Disconnect when human leaves
        ctx.room.on('participantDisconnected', (p) => {
            if (!p.identity.startsWith('agent-')) {
                const learnersLeft = Array.from(ctx.room.remoteParticipants.values()).filter(rem =>
                    !rem.identity.startsWith('agent-')
                ).length;

                if (learnersLeft === 0) {
                    console.log(`[Agent] No human participants left. Job ${myIdentity} disconnecting...`);
                    setTimeout(() => ctx.room.disconnect(), 1000);
                }
            }
        });




        console.log(`[Agent] Connected to room: ${roomName} (Job: ${ctx.job.id})`);

        // ─── Participant Discovery ──────────────────────────────────────────────
        const participant = await ctx.waitForParticipant();
        const participantCfg = parseSessionMetadata(participant.metadata);

        // ─── Graph Detection ────────────────────────────────────────────────────
        let graphName = participantCfg.graphName || 'japanese_tutor';
        try {
            if (!participantCfg.graphName && ctx.job.metadata) {
                const meta = typeof ctx.job.metadata === 'string' ? JSON.parse(ctx.job.metadata) : ctx.job.metadata;
                graphName = meta.graphName || graphName;
            } else if (!participantCfg.graphName) {
                // Fallback: Parse from room name
                // Format: roleplay-<graphName>-<userId>-<sessionId>
                const parts = roomName.split('-');
                if (parts.length >= 2) {
                    const potentialGraph = parts[1];
                    if (potentialGraph === 'japanese_tutor' || potentialGraph === 'roleplay' || potentialGraph === 'free_conversation') {
                        graphName = potentialGraph;
                        console.log(`[Agent] Detected graph from room name: ${graphName}`);
                    }
                }
            }
        } catch (e) {
            console.warn(`[Agent] Failed to detect graph: ${e}`);
        }

        const graph = getGraph(graphName);
        const initialConfig = buildSessionConfig(graph.name, participantCfg);

        console.log(`[Agent] Target participant: ${participant?.identity || 'None'}`);
        console.log(`[Agent] Using graph: ${initialConfig.graphName} (${graph.displayName})`);
        if (participantCfg.model || participantCfg.voice || participantCfg.instructions) {
            console.log('[Agent] Applying session config from participant metadata.');
        }

        const createModel = (config: SessionConfig) =>
            new google.beta.realtime.RealtimeModel({
                model: config.model,
                voice: config.voice as any,
                temperature: config.temperature,
                instructions: config.instructions,
                apiKey: config.geminiApiKey,
                maxOutputTokens: config.maxOutputTokens === 'inf' ? undefined : config.maxOutputTokens,
                modalities: config.modalities as any,
                // ─── Latency Optimization ──────────────────────────────────────────
                // Use high speech sensitivity and shorter silence window for faster turn-end detection.
                realtimeInputConfig: {
                    automaticActivityDetection: {
                        startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
                        endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
                        silenceDurationMs: 220,
                        prefixPaddingMs: 120,
                    },
                },
                // Disable reasoning/thinking budget to reduce voice reply latency.
                thinkingConfig: {
                    thinkingBudget: 0,
                },
            });

        const createSession = (config: SessionConfig) =>
            new voice.AgentSession({
                llm: createModel(config),
                // Keep endpointing tight to reduce handoff delay from user speech to model response.
                voiceOptions: {
                    preemptiveGeneration: true,
                    minEndpointingDelay: 120,
                    maxEndpointingDelay: 1200,
                },
            });

        const createAgent = (config: SessionConfig, chatCtx?: any) =>
            new voice.Agent({
                instructions: config.instructions,
                ...(chatCtx ? { chatCtx } : {}),
            });

        let userSpeechStartedAt = 0;
        let userSpeechEndedAt = 0;
        const attachLatencyTracking = (session: voice.AgentSession) => {
            session.on(voice.AgentSessionEventTypes.UserStateChanged, (ev: any) => {
                if (ev?.newState === 'speaking') {
                    userSpeechStartedAt = Date.now();
                    // Reset end marker at start of a new user turn to avoid stale carry-over.
                    userSpeechEndedAt = 0;
                }
                if (ev?.oldState === 'speaking' && ev?.newState === 'listening') {
                    userSpeechEndedAt = Date.now();
                    console.log(`[Agent] User speech ended at ${userSpeechEndedAt}`);
                }
            });

            session.on(voice.AgentSessionEventTypes.AgentStateChanged, (ev: any) => {
                if (ev?.newState === 'speaking') {
                    const now = Date.now();
                    const hasValidEndMarker = userSpeechEndedAt > 0 && userSpeechEndedAt >= userSpeechStartedAt;
                    const fromUserEnd = hasValidEndMarker ? now - userSpeechEndedAt : -1;
                    const fromUserStart = userSpeechStartedAt > 0 ? now - userSpeechStartedAt : -1;
                    if (fromUserEnd >= 0) {
                        console.log(`[Agent] Latency stop-speaking->agent-speaking: ${fromUserEnd}ms (start->speak: ${fromUserStart}ms)`);
                    } else {
                        console.log(`[Agent] Agent speaking (no user end marker yet, start->speak: ${fromUserStart}ms)`);
                    }
                }
            });
        };

        let activeConfig = initialConfig;
        let activeSession: voice.AgentSession | null = null;
        let activeAgent: voice.Agent | null = null;

        const startSession = async (config: SessionConfig, chatCtx?: any, announceUpdate = false) => {
            const session = createSession(config);
            const agent = createAgent(config, chatCtx);

            attachLatencyTracking(session);
            await (session as any).start({ agent, room: ctx.room });

            activeConfig = config;
            activeSession = session;
            activeAgent = agent;

            console.log(`[Agent] Session started for room: ${roomName} using model: ${config.model}`);

            if (announceUpdate) {
                try {
                    await session.generateReply({
                        instructions:
                            'Briefly acknowledge that your configuration has been updated and you are ready to continue speaking Japanese.',
                    });
                } catch (error) {
                    console.warn('[Agent] Failed to send post-update acknowledgement.', error);
                }
            }
        };

        const replaceSession = async (nextConfig: SessionConfig) => {
            if (!activeSession || !activeAgent) {
                return;
            }

            const previousSession = activeSession;
            const preservedChatCtx = previousSession.history;

            console.log(`[Agent] Replacing session with updated config for participant ${participant.identity}`);
            try {
                await previousSession.close();
            } catch (error) {
                console.warn('[Agent] Failed to close previous session cleanly, continuing replacement.', error);
            }

            await startSession(nextConfig, preservedChatCtx, true);
        };

        let replaceQueue: Promise<void> = Promise.resolve();
        const queueSessionReplacement = async (nextConfig: SessionConfig) => {
            replaceQueue = replaceQueue
                .then(async () => {
                    await replaceSession(nextConfig);
                })
                .catch((error) => {
                    console.error('[Agent] Session replacement queue failed.', error);
                });
            await replaceQueue;
        };

        await startSession(initialConfig);

        ctx.room.localParticipant.registerRpcMethod('pg.updateConfig', async (data: any) => {
            try {
                if (!activeSession || data?.callerIdentity !== participant.identity) {
                    return JSON.stringify({ changed: false });
                }

                const incomingPatch = parseSessionMetadata(
                    typeof data?.payload === 'string' ? data.payload : undefined,
                );
                const nextConfig = mergeSessionConfig(activeConfig, incomingPatch);

                if (areConfigsEqual(activeConfig, nextConfig)) {
                    return JSON.stringify({ changed: false });
                }

                await queueSessionReplacement(nextConfig);
                return JSON.stringify({ changed: true });
            } catch (error) {
                console.error('[Agent] pg.updateConfig failed.', error);
                return JSON.stringify({ changed: false, error: 'update_failed' });
            }
        });

        // ─── Token Tracking & Billing (DISABLED) ───────────────────────────────────
        /*
        session.on(voice.AgentSessionEventTypes.MetricsCollected, async (ev: any) => {
            try {
                const metrics = ev.metrics;
                if (!metrics) return;

                // Send billing update to frontend
                const payload = JSON.stringify({
                    type: 'billing_update',
                    inputTokens: metrics.inputTokens || 0,
                    outputTokens: metrics.outputTokens || 0,
                    totalTokens: (metrics.inputTokens || 0) + (metrics.outputTokens || 0),
                    timestamp: Date.now()
                });

                const data = new TextEncoder().encode(payload);
                await ctx.room.localParticipant.publishData(data, {
                    topic: 'billing_update',
                    reliable: true
                });

                // Optional: Log token usage periodically or based on a condition
                // console.log(`[Agent] [Billing] Sent update: +${metrics.inputTokens} prompt, +${metrics.outputTokens} completion`);
            } catch (error) {
                console.error('[Agent] [Billing] Error sending billing update:', error);
            }
        });
        */

        // Wait for disconnection
        await new Promise((resolve) => {
            ctx.room.on('disconnected', resolve);
        });

        console.log(`[Agent] Finished session for room: ${roomName}`);
    },
});
