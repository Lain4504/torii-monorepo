"use client";

import { useState, useCallback, useEffect } from "react";
import {
    LiveKitRoom,
    RoomAudioRenderer,
    BarVisualizer,
    useVoiceAssistant,
    DisconnectButton,
    TrackToggle,
    useRoomContext,
    useConnectionState,
    useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { Button } from "@workspace/ui/components/button";
import { Mic } from "lucide-react";
import { Spinner } from "@workspace/ui/components/spinner";
import { apiClient, extractErrorMessage } from "@/lib/api/api-client";
import { toast } from "sonner";

export function LivekitVoiceAgent() {
    const [connectionData, setConnectionData] = useState<{ token: string; wsUrl: string; roomId: string } | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const connectToVoice = useCallback(async () => {
        setIsConnecting(true);
        try {
            const response = await apiClient.post("/api/agents/livekit-token");
            if (response.data?.success) {
                setConnectionData(response.data.data);
            } else {
                toast.error("Failed to connect: " + response.data?.message);
            }
        } catch (error: any) {
            toast.error(extractErrorMessage(error));
        } finally {
            setIsConnecting(false);
        }
    }, []);

    if (!connectionData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full gap-6">
                <div className="bg-primary/10 p-6 rounded-full">
                    <Mic className="size-12 text-primary" />
                </div>
                <div className="space-y-4 max-w-md">
                    <h3 className="text-2xl font-bold tracking-tight">Voice Roleplay with Sensei</h3>
                    <p className="text-muted-foreground">
                        Luyện tập giao tiếp trực tiếp với Sensei bằng giọng nói. Sensei có thể nghe, hiểu và phản hồi lại bạn bằng tiếng Nhật chuẩn với độ trễ cực thấp.
                    </p>
                </div>
                <Button onClick={connectToVoice} disabled={isConnecting} size="lg" className="rounded-full px-8 mt-4">
                    {isConnecting ? (
                        <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Connecting to Roleplay Cloud...
                        </>
                    ) : (
                        "Start Voice Roleplay"
                    )}
                </Button>
            </div>
        );
    }

    return (
        <LiveKitRoom
            serverUrl={connectionData.wsUrl}
            token={connectionData.token}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={() => setConnectionData(null)}
            className="h-full flex flex-col w-full"
        >
            <ConnectionHandler roomName={connectionData.roomId} />
            <div className="flex-1 flex flex-col items-center justify-between p-8 w-full max-w-5xl mx-auto py-12 relative animate-in fade-in zoom-in-95 duration-1000 ease-out">
                {/* Top Actions - Glassmorphism "End Session" */}
                <div className="absolute top-8 right-8 z-50">
                    <DisconnectButton className="bg-white/5 backdrop-blur-xl hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-300 uppercase tracking-[0.2em] shadow-2xl active:scale-95">
                        End Session
                    </DisconnectButton>
                </div>

                <div className="w-full flex-1 flex items-center justify-center">
                    <AgentVisualizer />
                </div>

                <div className="flex flex-col items-center gap-16 w-full relative">
                    <UserVisualizer />

                    {/* Mic Orb with Breathing Glow */}
                    <div className="relative group">
                        {/* Glow Circle */}
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-700 animate-pulse scale-150" />

                        {/* Circular Container */}
                        <div className="relative w-20 h-20 rounded-full border border-white/20 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all duration-500 flex items-center justify-center shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden z-10">
                            <TrackToggle
                                source={Track.Source.Microphone}
                                className="!w-full !h-full !bg-transparent !border-none !text-white hover:!bg-transparent focus-within:!ring-0"
                            />
                        </div>
                    </div>
                </div>

                <RoomAudioRenderer />
            </div>
        </LiveKitRoom>
    );
}

function ConnectionHandler({ roomName }: { roomName: string }) {
    const connectionState = useConnectionState();
    const room = useRoomContext();
    const [triggered, setTriggered] = useState(false);

    // Robust cleanup logic
    useEffect(() => {
        const cleanup = () => {
            if (room.state !== "disconnected") {
                console.log("Cleanup: Disconnecting from room explicitly");
                room.disconnect();
            }
        };

        window.addEventListener('beforeunload', cleanup);

        return () => {
            console.log("Component unmounting, running cleanup");
            cleanup();
            window.removeEventListener('beforeunload', cleanup);
        };
    }, [room]);

    useEffect(() => {
        console.log(`LiveKit Room State: ${connectionState}`);
        if (connectionState === "connected" && !triggered) {
            setTriggered(true);
            toast.promise(
                apiClient.post("/api/agents/livekit-join", { roomName }),
                {
                    loading: 'Calling Sensei to the room...',
                    success: 'Sensei is joining! Please say Konnichiwa.',
                    error: 'Failed to call Sensei. Please retry.',
                }
            );
        }
    }, [connectionState, roomName, triggered]);

    return null;
}

function AgentVisualizer() {
    const { state, audioTrack } = useVoiceAssistant();

    return (
        <div className="flex flex-col items-center gap-12 w-full transition-all duration-500">
            <div className="relative flex items-center justify-center">
                {/* Outer Glow / Space Effect */}
                <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 opacity-40 ${state === 'speaking' ? 'bg-cyan-400 scale-125' :
                    state === 'thinking' ? 'bg-amber-400 scale-110' : 'bg-primary/10 scale-90'
                    }`} />

                {/* The Orb */}
                <div className={`relative w-48 h-48 md:w-56 md:h-56 rounded-full transition-all duration-700 flex items-center justify-center overflow-hidden border-[4px] ${state === 'speaking' ? 'border-white/20 bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-2xl scale-105' :
                    state === 'thinking' ? 'border-amber-400/30 bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse' :
                        state === 'listening' ? 'border-primary/20 bg-background/40 backdrop-blur-2xl' :
                            'border-muted bg-muted/20 backdrop-blur-md'
                    }`}>
                    {state === 'speaking' ? (
                        <BarVisualizer
                            state={state}
                            barCount={15}
                            trackRef={audioTrack}
                            className="w-24 h-8 text-white/90"
                        />
                    ) : state === 'thinking' ? (
                        <Spinner className="w-16 h-16 text-white opacity-50" />
                    ) : state === 'listening' ? (
                        <div className="flex items-end gap-1.5 h-12">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-2 bg-primary/60 rounded-full animate-pulse"
                                    style={{
                                        height: `${Math.random() * 60 + 20}%`,
                                        animationDelay: `${i * 0.15}s`,
                                        animationDuration: '0.8s'
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                </div>

                {/* Status Label */}
                <div className="absolute -bottom-4 bg-background border border-border/50 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                    {state || 'Sensei'}
                </div>
            </div>

            <p className="text-2xl font-bold tracking-tight text-center max-w-sm">
                {state === "speaking" ? "Sensei nói chuyện..." :
                    state === "listening" ? "Sensei đang nghe..." :
                        state === "thinking" ? "Sensei đang suy nghĩ..." : "Sẵn sàng trò chuyện"}
            </p>
        </div>
    );
}

function UserVisualizer() {
    const { localParticipant } = useLocalParticipant();
    const micPub = Array.from(localParticipant.trackPublications.values())
        .find(p => p.source === Track.Source.Microphone);

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <div className="h-8 w-full max-w-md flex items-center justify-center">
                {micPub?.track ? (
                    <BarVisualizer
                        trackRef={{
                            participant: localParticipant,
                            publication: micPub,
                            source: Track.Source.Microphone
                        }}
                        barCount={30}
                        className="w-full h-full text-primary/30"
                        style={{ height: '32px' }}
                    />
                ) : (
                    <div className="h-0.5 w-32 bg-muted/30 rounded-full" />
                )}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-50">Bạn</span>
        </div>
    );
}
