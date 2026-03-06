import { JobContext, voice, defineAgent } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { getGraph } from './graphs';

export default defineAgent({
    entry: async (ctx: JobContext) => {
        const roomName = ctx.job.room?.name || 'unknown';
        console.log(`[Agent] Joining room: ${roomName}`);

        // Wait for room connection
        await ctx.connect();
        // Make our joining time accessible to other agents
        await ctx.room.localParticipant.updateName(Date.now().toString());

        // ─── Continuous Agent Safety (Anti-Double Agent) ─────────────────────────
        const myIdentity = `agent-${ctx.job.id}`; // Ensure we include the 'agent-' prefix for accurate string comparison
        let shouldQuit = false;

        const checkSafety = async () => {
            const thisJob = ctx.job;
            if (!thisJob) return false;

            const myTime = parseInt(ctx.room.localParticipant?.name || '0', 10) || 0;

            let newestPeerId = '';
            let newestPeerTime = 0;

            for (const [, p] of ctx.room.remoteParticipants) {
                if (p.identity.startsWith('agent-')) {
                    const peerTime = parseInt(p.name || '0', 10) || 0;
                    if (peerTime > newestPeerTime || (peerTime === newestPeerTime && p.identity > newestPeerId)) {
                        newestPeerTime = peerTime;
                        newestPeerId = p.identity;
                    }
                }
            }

            if (newestPeerId) {
                // If a peer is newer (larger timestamp), OR it's a tie and my identity is "larger" (string sorting), I should quit.
                // We want to KEEP the NEWEST agent, so the old agents must quit. Wait, the old logic was: "If a peer is newer... I should quit". Let's verify this carefully.
                // Wait. We want exactly 1 agent. A zombie is OLD. The new agent is NEW.
                // If we want the NEW agent to survive, the OLD agent must quit.
                // So if `myTime < peerTime`, I am OLD, I should quit.
                if (newestPeerTime > myTime || (newestPeerTime === myTime && myIdentity > newestPeerId)) {
                    if (!shouldQuit) {
                        console.log(`[Agent] [Safety] Peer agent detected: ${newestPeerId} (newer/tie-breaker won). Quitting current OLD job: ${myIdentity}`);
                        shouldQuit = true;
                        await ctx.room.disconnect();
                    }
                    return true; // Quit
                }
                console.log(`[Agent] [Safety] Peer agent detected: ${newestPeerId}, but I am newer/won tie-breaker. Proceeding...`);
            }
            return false;
        };

        // 1. Initial check with jitter
        const jitter = Math.floor(Math.random() * 800) + 200;
        await new Promise(resolve => setTimeout(resolve, jitter));
        if (await checkSafety()) return;

        // 2. Continuous monitoring for new agents joining later
        ctx.room.on('participantConnected', async (p) => {
            if (p.identity.startsWith('agent-')) {
                console.log(`[Agent] [Safety] New agent joined: ${p.identity}. Re-running safety check...`);
                await checkSafety();
            }
        });

        // 3. Disconnect when human leaves so we don't become a zombie
        ctx.room.on('participantDisconnected', (p) => {
            if (!p.identity.startsWith('agent-')) {
                console.log(`[Agent] Human participant ${p.identity} left. Disconnecting agent from room...`);
                setTimeout(() => ctx.room.disconnect(), 500);
            }
        });


        console.log(`[Agent] Connected to room: ${roomName} (Job: ${ctx.job.id})`);

        // ─── Participant Discovery ──────────────────────────────────────────────
        // Find the human participant (student) to interact with.
        const humanParticipants = Array.from(ctx.room.remoteParticipants.values()).filter(p =>
            !p.identity.startsWith('agent-')
        );
        const participant = humanParticipants[0];

        // ─── Graph Detection ────────────────────────────────────────────────────
        // 1. Try from job metadata
        // 2. Fallback: Parse from room name (format: roleplay-<graph>-<user>-<session>)
        let graphName = 'roleplay';
        try {
            if (ctx.job.metadata) {
                const meta = typeof ctx.job.metadata === 'string' ? JSON.parse(ctx.job.metadata) : ctx.job.metadata;
                graphName = meta.graphName || 'roleplay';
            } else {
                const parts = roomName.split('-');
                if (parts.length >= 4 && parts[0] === 'roleplay') {
                    graphName = parts[1]; // e.g. 'japanese_tutor'
                    console.log(`[Agent] Detected graph from room name: ${graphName}`);
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

        // ─── Token Tracking & Billing ───────────────────────────────────────────
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

        // Wait for disconnection
        await new Promise((resolve) => {
            ctx.room.on('disconnected', resolve);
        });

        console.log(`[Agent] Finished session for room: ${roomName}`);
    },
});
