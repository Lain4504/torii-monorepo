import { JobContext, voice, defineAgent } from '@livekit/agents';
import type { MetricsCollectedEvent } from '@livekit/agents/dist/voice/events.js';
import type { RealtimeModelMetrics } from '@livekit/agents/dist/metrics/base.js';
import * as google from '@livekit/agents-plugin-google';
import Redis from 'ioredis';
import { connect, JSONCodec, nkeyAuthenticator } from 'nats';

// NOTE: Redis is initialized lazily inside entry() so that process.env.REDIS_HOST
// is guaranteed to be set by LivekitAgentService.onModuleInit() before first use.

export default defineAgent({
    entry: async (ctx: JobContext) => {
        // Lazy-init Redis here, not at module level, so env vars are already set
        const redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || '',
            lazyConnect: true,
            enableOfflineQueue: false,
            retryStrategy: () => null, // Don't retry — fail fast if misconfigured
        });
        const roomName = ctx.job.room?.name || 'unknown';

        // Find the real user ID from the room (exclude the agent themselves)
        // Fallback to a special UUID if no user is found to prevent Prisma crashes
        const SYSTEM_DEFAULT_USER = '00000000-0000-0000-0000-000000000000';
        let userId = ctx.job.participant?.identity || SYSTEM_DEFAULT_USER;

        const participants = Array.from(ctx.room.remoteParticipants.values()).filter(p => !p.identity.startsWith('agent-'));
        if (participants.length > 0) {
            userId = participants[0].identity;
            console.log(`[entry] Detected user identity from room: ${userId}`);
        } else if (userId === SYSTEM_DEFAULT_USER || userId.startsWith('agent-')) {
            console.warn(`[entry] No human participants found in room ${roomName}.`);
            // Try to parse from room name if it follows roleplay-<graph>-<user>-<session>
            const parts = roomName.split('-');
            if (parts.length >= 4 && parts[0] === 'roleplay') {
                userId = parts[2]; // Potential user UUID
                console.log(`[entry] Extracted potential user identity from room name: ${userId}`);
            }
        }

        const startTime = Date.now();
        console.log(`LiveKit Agent connected to room: ${roomName} (resolved user: ${userId})`);

        // Session-based billing accumulators
        let accumulatedInputTokens = 0;
        let accumulatedOutputTokens = 0;
        let accumulatedTotalTokens = 0;

        // Persistent NATS connection for per-turn billing (reused across turns)
        const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
        const nkeySeed = process.env.NATS_NKEY_SEED;
        const jc = JSONCodec();
        let nc: Awaited<ReturnType<typeof connect>> | null = null;
        try {
            const natsOptions: any = { servers: natsUrl };
            if (nkeySeed) {
                natsOptions.authenticator = nkeyAuthenticator(new TextEncoder().encode(nkeySeed));
            }
            nc = await connect(natsOptions);
            console.log(`[billing] NATS connected for room ${roomName}`);
        } catch (natsErr) {
            console.warn(`[billing] NATS unavailable — per-turn billing disabled: ${natsErr}`);
        }

        try {
            await ctx.connect();
            console.log(`Connected to room: ${roomName}`);

            const llm = new google.beta.realtime.RealtimeModel({
                model: "gemini-2.5-flash-native-audio-latest",
                voice: "Puck",
                temperature: 0.8,
                instructions: `You are Sensei, a friendly Japanese language tutor having a live voice conversation.

LANGUAGE RULES:
- Speak Japanese as much as possible during roleplay practice.
- You MAY use Vietnamese to explain grammar, vocabulary, or when the student seems confused.
- If the student speaks Vietnamese, you can respond briefly in Vietnamese then continue in Japanese.
- Keep your responses short and natural — this is a spoken conversation, not a lecture.

GREETING:
- Always greet the student first when they join. Say something like: "こんにちは！私はSenseiです。今日は日本語で話しましょう！準備はいいですか？" then briefly in Vietnamese: "Chào bạn! Hôm nay mình sẽ luyện nói tiếng Nhật nhé. Bạn đã sẵn sàng chưa?"
- After greeting, wait for the student to respond and guide the conversation naturally.

STYLE:
- Be encouraging and patient.
- Gently correct mistakes by repeating the correct form naturally.
- Ask short follow-up questions to keep the conversation going.`,
            });

            const session = new voice.AgentSession({
                llm,
                voiceOptions: {
                    userAwayTimeout: 300, // 5 minutes
                }
            });
            (session as any).options.userAwayTimeout = 300; // Explicit override
            console.log(`[entry] Session options: ${JSON.stringify((session as any).options)}`);

            const agent = new voice.Agent({ instructions: "" });

            await session.start({ agent, room: ctx.room });
            console.log(`[entry] AgentSession started for room: ${roomName}`);

            // Per-turn billing: publish data to room after each agent response
            const handleMetrics = async (eventOrMetrics: any) => {
                console.log(`[billing] Received metrics event: ${JSON.stringify(eventOrMetrics)}`);
                const metrics = eventOrMetrics?.metrics || eventOrMetrics;
                if (metrics && !metrics.cancelled) {
                    const inputTokens = metrics.inputTokens || metrics.promptTokens || metrics.promptTokenCount || 0;
                    const outputTokens = metrics.outputTokens || metrics.completionTokens || metrics.responseTokenCount || 0;
                    const totalTokens = metrics.totalTokens || metrics.totalTokenCount || (inputTokens + outputTokens);

                    console.log(`[billing] Raw metrics: ${JSON.stringify(metrics)}`);

                    if (totalTokens === 0) {
                        console.log(`[billing] Turn tokens is 0, skipping deduction.`);
                        return;
                    }

                    console.log(`[billing] Turn tokens for user=${userId} — in:${inputTokens} out:${outputTokens} total:${totalTokens}`);

                    // Accumulate tokens for session-based billing
                    accumulatedInputTokens += inputTokens;
                    accumulatedOutputTokens += outputTokens;
                    accumulatedTotalTokens += totalTokens;
                    console.log(`[billing] Session accumulated: ${accumulatedTotalTokens} tokens`);

                    // 2. Notify frontend to refresh balance display
                    const localParticipant = ctx.room.localParticipant;
                    if (localParticipant) {
                        try {
                            const payload = JSON.stringify({
                                type: 'billing_update',
                                inputTokens,
                                outputTokens,
                                totalTokens,
                                timestamp: Date.now()
                            });
                            await localParticipant.publishData(
                                new TextEncoder().encode(payload),
                                { reliable: true, topic: 'billing_update' }
                            );
                            console.log(`[billing] Published DataPacket to room (topic: billing_update)`);
                        } catch (e) {
                            console.warn(`[billing] Failed to publish billing_update to room: ${e}`);
                        }
                    }
                }
            };

            // Listen on various objects to ensure we catch the metrics per-turn
            console.log(`[billing] Setting up metrics listeners...`);

            // Listen for metrics on the AgentSession. 
            // AgentActivity already aggregates all metrics (LLM, STT, TTS, Realtime) 
            // and re-emits them as 'metrics_collected' on the session.
            console.log(`[billing] Attaching metrics_collected listener to AgentSession...`);
            (session as any).on('metrics_collected', (event: any) => {
                console.log(`[billing] AgentSession metrics_collected received`);
                handleMetrics(event);
            });

            // diagnostic logs
            (session as any).on('user_speech_started', () => console.log(`[session] User started speaking`));
            (session as any).on('user_speech_finished', () => console.log(`[session] User finished speaking`));

            // Wait for the room to be disconnected or session to end
            await new Promise((resolve) => {
                ctx.room.on('disconnected', resolve);
            });

        } catch (e: any) {
            console.error(`Error in agentEntry for room ${roomName}: ${e}`);
        } finally {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            if (duration > 0) {
                console.log(`Recording usage for room ${roomName}: ${duration}s | Tokens: ${accumulatedTotalTokens}`);

                // Final Session-Based Billing Deduction
                if (accumulatedTotalTokens > 0) {
                    try {
                        const payloadData = {
                            userId,
                            taskType: 'live_voice',
                            usage: {
                                promptTokenCount: accumulatedInputTokens,
                                candidatesTokenCount: accumulatedOutputTokens,
                                totalTokenCount: accumulatedTotalTokens,
                                model: "gemini-2.5-flash-native-audio-latest"
                            }
                        };
                        const eventSubject = JSON.stringify({ cmd: 'billing.quota.recordTokenUsage' });
                        const natsPayload = jc.encode(payloadData);

                        const natsConn = nc || await connect({ servers: natsUrl }); // Fallback reconnect if needed
                        natsConn.publish(eventSubject, natsPayload);
                        await natsConn.flush();
                        console.log(`[billing] Final session deduction published to NATS subject='${eventSubject}' (${accumulatedTotalTokens} tokens)`);
                    } catch (e) {
                        console.error(`[billing] Failed to publish final session deduction: ${e}`);
                    }
                }

                const key = `wajlc:insights:live_voice:usage:${roomName}`;
                try {
                    await redis.hincrby(key, 'total_duration', duration);
                    await redis.expire(key, 86400); // 24h
                } catch (redisErr) {
                    console.warn(`Redis unavailable — skipping usage record for room ${roomName}: ${redisErr}`);
                }

                // Notify artifact generation via NATS
                try {
                    if (nc) {
                        nc.publish('agents.analytics.createUsageArtifacts', jc.encode({
                            roomId: roomName,
                            userId,
                            type: 'voice'
                        }));
                        await nc.flush();
                    } else {
                        const natsOptions: any = { servers: natsUrl };
                        if (nkeySeed) {
                            natsOptions.authenticator = nkeyAuthenticator(new TextEncoder().encode(nkeySeed));
                        }
                        const tempNc = await connect(natsOptions);
                        tempNc.publish('agents.analytics.createUsageArtifacts', jc.encode({
                            roomId: roomName,
                            userId,
                            type: 'voice'
                        }));
                        await tempNc.flush();
                        await tempNc.close();
                    }
                    console.log(`NATS notification sent for room ${roomName}`);
                } catch (natsErr) {
                    console.error(`Failed to notify artifact generation via NATS: ${natsErr}`);
                }
            }
            // 3. Clear join lock in LivekitAgentService
            try {
                const unlockSubject = JSON.stringify({ cmd: 'agents.livekit.clearJoinLock' });
                const unlockPayload = jc.encode({ roomName, userId });
                const natsConn = nc || await connect({ servers: natsUrl });
                natsConn.publish(unlockSubject, unlockPayload);
                await natsConn.flush();
                console.log(`[entry] Published unlock signal to NATS for user: ${userId}`);
            } catch (e) {
                console.error(`[entry] Failed to publish unlock signal: ${e}`);
            }

            // Close persistent NATS connection
            try { await nc?.drain(); } catch { /* ignore */ }
            redis.disconnect();

            console.log(`[entry] Session finished for room ${roomName}.`);
        }
    },
});
