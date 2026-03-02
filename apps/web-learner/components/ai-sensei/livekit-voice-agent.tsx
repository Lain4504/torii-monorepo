"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
    useDataChannel,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { Button } from "@workspace/ui/components/button";
import { Mic, Loader2, Zap, PhoneOff, Radio } from "lucide-react";
import { Spinner } from "@workspace/ui/components/spinner";
import { apiClient, extractErrorMessage } from "@/lib/api/api-client";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/hooks";
import { fetchProfile } from "@/store/slices/authSlice";
import { GeminiVisualizer } from "./visualizer/gemini-visualizer";

type SessionTokens = { input: number; output: number; total: number };

// ─── Initial Screen ──────────────────────────────────────────────────────────

function InitialScreen({
    onConnect,
    isConnecting,
}: {
    onConnect: () => void;
    isConnecting: boolean;
}) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-sm flex flex-col items-center gap-8 text-center">
                {/* Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse scale-150" />
                    <div className="relative h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Radio className="size-9 text-primary" />
                    </div>
                </div>

                {/* Copy */}
                <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Sensei Voice</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Luyện hội thoại tiếng Nhật trực tiếp bằng giọng nói với AI Sensei.
                    </p>
                </div>

                {/* CTA */}
                <Button
                    onClick={onConnect}
                    disabled={isConnecting}
                    size="lg"
                    className="w-full gap-2"
                >
                    {isConnecting ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Đang kết nối...
                        </>
                    ) : (
                        <>
                            <Mic className="size-4" />
                            Bắt đầu
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function LivekitVoiceAgent() {
    const [connectionData, setConnectionData] = useState<{
        token: string;
        wsUrl: string;
        roomId: string;
    } | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [sessionTokens, setSessionTokens] = useState<SessionTokens>({
        input: 0,
        output: 0,
        total: 0,
    });
    const sessionStartRef = useRef<number>(0);
    const dispatch = useAppDispatch();

    const connectToVoice = useCallback(async () => {
        setIsConnecting(true);
        sessionStartRef.current = Date.now();
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
        return <InitialScreen onConnect={connectToVoice} isConnecting={isConnecting} />;
    }

    return (
        <LiveKitRoom
            serverUrl={connectionData.wsUrl}
            token={connectionData.token}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={async () => {
                if (sessionTokens.total > 0 || sessionStartRef.current > 0) {
                    const durationSec =
                        sessionStartRef.current > 0
                            ? Math.floor(
                                (Date.now() - sessionStartRef.current) / 1000
                            )
                            : 0;
                    try {
                        await apiClient.post("/api/agents/livekit-end", {
                            roomName: connectionData.roomId,
                            inputTokens: sessionTokens.input,
                            outputTokens: sessionTokens.output,
                            totalTokens: sessionTokens.total,
                            durationSec,
                        });
                    } catch (err) {
                        console.warn("[billing] Failed to call livekit-end:", err);
                    }
                }
                setConnectionData(null);
                setSessionTokens({ input: 0, output: 0, total: 0 });
                setTimeout(() => {
                    dispatch(fetchProfile());
                }, 3500);
            }}
            className="h-full w-full flex flex-col"
        >
            <ConnectionHandler
                roomName={connectionData.roomId}
                onTokenUpdate={(data) =>
                    setSessionTokens((prev) => ({
                        input: prev.input + data.inputTokens,
                        output: prev.output + data.outputTokens,
                        total: prev.total + data.totalTokens,
                    }))
                }
            />
            <SessionUI sessionTokens={sessionTokens} />
        </LiveKitRoom>
    );
}

// ─── Session UI ───────────────────────────────────────────────────────────────

function SessionUI({ sessionTokens }: { sessionTokens: SessionTokens }) {
    const { state, audioTrack } = useVoiceAssistant();

    const stateLabel: Record<string, string> = {
        speaking: "Sensei đang nói",
        listening: "Đang lắng nghe",
        thinking: "Sensei đang suy nghĩ",
        connecting: "Đang kết nối",
        disconnected: "Live Session",
        idle: "Live Session",
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in zoom-in-95 duration-700">
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 flex-shrink-0">
                {/* Status */}
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-block w-2 h-2 rounded-full transition-colors duration-300 ${state === "speaking"
                            ? "bg-primary animate-pulse"
                            : state === "listening"
                                ? "bg-green-500 animate-pulse"
                                : state === "thinking"
                                    ? "bg-yellow-500 animate-bounce"
                                    : "bg-muted-foreground/40"
                            }`}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                        {stateLabel[state] ?? "Live Session"}
                    </span>
                </div>

                {/* Token badge */}
                {sessionTokens.total > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Zap className="size-3 text-yellow-500" />
                        <span className="font-medium">{sessionTokens.total.toLocaleString()} tokens</span>
                        <span className="text-muted-foreground/50">·</span>
                        <span className="text-primary font-semibold">
                            ≈ {Math.ceil(sessionTokens.input * 0.075 + sessionTokens.output * 0.3).toLocaleString()} Coins
                        </span>
                    </div>
                )}

                {/* End session */}
                <DisconnectButton className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive border border-border hover:border-destructive/40 bg-transparent hover:bg-destructive/5 rounded-lg px-3 py-1.5 transition-colors duration-200 cursor-pointer">
                    <PhoneOff className="size-3.5" />
                    Kết thúc
                </DisconnectButton>
            </div>


            {/* ── Main content ── */}
            <div className="flex flex-col items-center gap-12 w-full flex-1 transition-all duration-500 py-6">

                {/* ── Main: star (all ring effects handled inside Three.js canvas) ── */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-0 px-6 py-4">
                    <div className="flex items-center justify-center">
                        <GeminiVisualizer agentState={state} agentTrackRef={audioTrack} />
                    </div>

                    {/* User audio feedback section */}
                    <UserVisualizer state={state} />
                </div>

                {/* ── Mic toggle ── */}
                <div className="flex items-center justify-center py-4 pb-6 flex-shrink-0">
                    <MicButton />
                </div>

                <RoomAudioRenderer />
            </div>
        </div>
    );
}

// ─── Mic Button ───────────────────────────────────────────────────────────────

function MicButton() {
    return (
        <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl animate-pulse scale-150" />
            <div className="relative h-14 w-14 rounded-full border border-border bg-background shadow-md hover:shadow-lg hover:bg-accent transition-all duration-200 flex items-center justify-center">
                <TrackToggle
                    source={Track.Source.Microphone}
                    className="!w-full !h-full !bg-transparent !border-none !text-foreground focus-within:!ring-0"
                />
            </div>
        </div>
    );
}

// ─── User Visualizer ─────────────────────────────────────────────────────────

function UserVisualizer({ state }: { state: string }) {
    const { localParticipant } = useLocalParticipant();
    const micPub = Array.from(localParticipant.trackPublications.values()).find(
        (p) => p.source === Track.Source.Microphone
    );

    const isListening = state === "listening";

    return (
        <div className="w-full flex flex-col items-center gap-2">
            {/* Waveform — shows when listening or user has mic active */}
            <div
                className={`h-10 w-full max-w-xs flex items-center justify-center transition-opacity duration-300 ${isListening ? "opacity-100" : "opacity-30"
                    }`}
            >
                {micPub?.track ? (
                    <BarVisualizer
                        trackRef={{
                            participant: localParticipant,
                            publication: micPub,
                            source: Track.Source.Microphone,
                        }}
                        barCount={28}
                        className={`w-full h-full transition-colors duration-300 ${isListening ? "text-cyan-500" : "text-muted-foreground/40"
                            }`}
                        style={{ height: "40px" }}
                    />
                ) : (
                    <div className="h-px w-24 bg-border rounded-full" />
                )}
            </div>

            {/* Label */}
            <span
                className={`text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300 ${isListening ? "text-cyan-500" : "text-muted-foreground/40"
                    }`}
            >
                {isListening ? "Mời bạn nói" : "Bạn"}
            </span>
        </div>
    );
}

// ─── ConnectionHandler ────────────────────────────────────────────────────────

function ConnectionHandler({
    roomName,
    onTokenUpdate,
}: {
    roomName: string;
    onTokenUpdate: (data: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    }) => void;
}) {
    const connectionState = useConnectionState();
    const room = useRoomContext();
    const triggered = useRef(false);
    const dispatch = useAppDispatch();

    useDataChannel("billing_update", (msg) => {
        try {
            const data = JSON.parse(new TextDecoder().decode(msg.payload));
            if (data.type === "billing_update") {
                onTokenUpdate({
                    inputTokens: data.inputTokens,
                    outputTokens: data.outputTokens,
                    totalTokens: data.totalTokens,
                });
            }
        } catch {
            /* ignore */
        }
    });

    useEffect(() => {
        const disconnect = () => {
            if (room.state !== "disconnected") {
                room.disconnect();
            }
        };
        const handleBeforeUnload = () => disconnect();
        window.addEventListener("beforeunload", handleBeforeUnload);
        const handlePageHide = () => disconnect();
        window.addEventListener("pagehide", handlePageHide);
        return () => {
            disconnect();
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("pagehide", handlePageHide);
        };
    }, [room]);

    useEffect(() => {
        if (connectionState === "connected" && !triggered.current) {
            triggered.current = true;
            toast.promise(
                apiClient.post("/api/agents/livekit-join", { roomName }),
                {
                    loading: "Calling Sensei...",
                    success: "Sensei is in the room!",
                    error: "Sensei is busy. Please retry.",
                }
            );
        }
    }, [connectionState, roomName]);

    return null;
}
