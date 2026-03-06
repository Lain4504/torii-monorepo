import { JobContext, voice, defineAgent } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { getGraph } from './graphs';

export default defineAgent({
    entry: async (ctx: JobContext) => {
        const roomName = ctx.job.room?.name || 'unknown';
        console.log(`[Agent] Joining room: ${roomName}`);

        // Wait for room connection
        await ctx.connect();
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

        // 1. Initial check with jitter to allow for name propagation from other agents
        const jitter = Math.floor(Math.random() * 800) + 400;
        await new Promise(resolve => setTimeout(resolve, jitter));

        // Wait up to 2 seconds for peer names to potentially propagate
        let attempts = 0;
        while (attempts < 3) {
            if (await checkSafety()) return;
            const hasZombiePeers = Array.from(ctx.room.remoteParticipants.values()).some(p =>
                p.identity.startsWith('agent-') && (!p.name || p.name === '0')
            );
            if (!hasZombiePeers) break;

            console.log(`[Agent] [Safety] Peer agent(s) found but name hasn't propagated. Waiting... (Attempt ${attempts + 1})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }

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
        const humanParticipants = Array.from(ctx.room.remoteParticipants.values()).filter(p =>
            !p.identity.startsWith('agent-')
        );
        const participant = humanParticipants[0];

        // ─── Graph Detection ────────────────────────────────────────────────────
        let graphName = 'japanese_tutor';
        try {
            if (ctx.job.metadata) {
                const meta = typeof ctx.job.metadata === 'string' ? JSON.parse(ctx.job.metadata) : ctx.job.metadata;
                graphName = meta.graphName || graphName;
            } else {
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

        console.log(`[Agent] Target participant: ${participant?.identity || 'None'}`);
        console.log(`[Agent] Using graph: ${graph.name} (${graph.displayName})`);

        const llm = new google.beta.realtime.RealtimeModel({
            model: graph.model,
            voice: graph.voice as any,
            temperature: graph.temperature || 0.8,
            instructions: graph.systemPrompt,
        });

        const session = new voice.AgentSession({
            llm,
        });

        const agent = new voice.Agent({
            instructions: "You are a helpful Japanese language tutor.",
        });

        // Start the session
        await (session as any).start({ agent, room: ctx.room });
        console.log(`[Agent] Session started for room: ${roomName} using model: ${llm.model}`);

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
