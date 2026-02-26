import { JobContext, voice, defineAgent } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';

export default defineAgent({
    entry: async (ctx: JobContext) => {
        const roomName = ctx.job.room?.name || 'unknown';
        console.log(`LiveKit Agent connected to room: ${roomName}`);

        try {
            await ctx.connect();
            console.log(`Connected to room: ${roomName}`);

            const session = new voice.AgentSession({
                llm: new google.beta.realtime.RealtimeModel({
                    model: "gemini-2.5-flash-native-audio-latest",
                    voice: "Puck",
                    temperature: 0.8,
                    instructions: "You are a helpful Japanese language sensei. Teach vocabulary, sentence structure and grammar points naturally to your user. Always answer using Japanese unless requested otherwise. Keep your responses concise and friendly. If the user stops talking, you can ask a short follow-up question in Japanese.",
                }),
            });

            const agent = new voice.Agent({ instructions: "" });

            await session.start({ agent, room: ctx.room });
            console.log(`AgentSession started for room: ${roomName}`);
        } catch (e: any) {
            console.error(`Error in agentEntry for room ${roomName}: ${e}`);
        }
    },
});
