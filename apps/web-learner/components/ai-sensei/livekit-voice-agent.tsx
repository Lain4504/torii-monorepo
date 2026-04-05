"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { Mic, MicOff, PhoneOff, Loader2, Wifi, Zap } from "lucide-react"
import {
    LiveKitRoom,
    ControlBar,
    RoomAudioRenderer,
    useTracks,
    useConnectionState,
    useParticipants,
    useRoomContext
} from "@livekit/components-react"
import { Track, ConnectionState as LiveKitConnectionState, RoomEvent } from "livekit-client"
import { useQueryClient } from "@tanstack/react-query"
import { agentApi } from "@/lib/api/services/agent-api"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────
const VOICE_AGENT_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL || "http://localhost:8082"

// ─── Types ───────────────────────────────────────────────────────────────────
type LocalConnectionState = "idle" | "connecting" | "connected" | "error"

interface LiveKitInfo {
    token: string
    wsUrl: string
    roomId: string
}

export function LivekitVoiceAgent() {
    const [connectionState, setConnectionState] = useState<LocalConnectionState>("idle")
    const [liveKitInfo, setLiveKitInfo] = useState<LiveKitInfo | null>(null)
    const [sessionTokens, setSessionTokens] = useState({ prompt: 0, completion: 0, total: 0 })
    const sessionTokensRef = useRef({ prompt: 0, completion: 0, total: 0 })
    const [error, setError] = useState<string | null>(null)
    const startTimeRef = useRef<number | null>(null)
    const liveKitInfoRef = useRef<LiveKitInfo | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const queryClient = useQueryClient()

    // ─── Connect ─────────────────────────────────────────────────────────────────
    const connect = useCallback(async () => {
        // Cancel any pending connection attempt
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        const abortController = new AbortController()
        abortControllerRef.current = abortController

        setConnectionState("connecting")
        setError(null)
        setSessionTokens({ prompt: 0, completion: 0, total: 0 })
        sessionTokensRef.current = { prompt: 0, completion: 0, total: 0 }
        startTimeRef.current = Date.now()

        try {
            const currentGraph = "japanese_tutor"
            // 1. Get LiveKit Token from Torii Gateway
            const result = await agentApi.sensei.getLivekitToken(currentGraph)
            if (abortController.signal.aborted) return

            const { token, wsUrl, roomId } = result

            setLiveKitInfo({ token, wsUrl, roomId })
            liveKitInfoRef.current = { token, wsUrl, roomId }

            // 2. Instruct the standalone Voice Agent to join the room
            const resp = await fetch(`${VOICE_AGENT_URL}/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channel_name: roomId,
                    graph_name: currentGraph,
                    user_id: "Student",
                }),
                signal: abortController.signal
            })

            if (!resp.ok) {
                const errData = await resp.json()
                throw new Error(errData.message || "Voice Agent backend failed to start")
            }

            if (abortController.signal.aborted) return
            setConnectionState("connected")
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log("[VoiceAgent] Connection aborted")
                return
            }
            console.error("[VoiceAgent] Connection failed:", err)
            setError(err.message || "Failed to connect")
            setConnectionState("error")
        } finally {
            if (abortControllerRef.current === abortController) {
                abortControllerRef.current = null
            }
        }
    }, [])

    const disconnect = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }

        if (liveKitInfo?.roomId) {
            const durationSec = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0
            // Send end signal to gateway for billing
            agentApi.sensei.livekitEnd(liveKitInfo.roomId, {
                inputTokens: sessionTokensRef.current.prompt,
                outputTokens: sessionTokensRef.current.completion,
                totalTokens: sessionTokensRef.current.total,
                durationSec
            }).then(() => {
                // Invalidate quota status to trigger UI update
                queryClient.invalidateQueries({ queryKey: ["quota-status"] })
            }).catch(console.error)

            // Send stop signal to voice agent server to kick the agent immediately
            fetch(`${VOICE_AGENT_URL}/stop`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channel_name: liveKitInfo.roomId }),
            }).catch(err => console.error("[VoiceAgent] Failed to send stop signal:", err))
        }

        setConnectionState("idle")
        setLiveKitInfo(null)
        liveKitInfoRef.current = null
        startTimeRef.current = null
    }, [liveKitInfo])

    // ─── Cleanup on Unmount & Page Navigation ────────────────────────────────────
    useEffect(() => {
        // We use an empty dependency array to ensure this effect only runs ONCE on mount
        // and its cleanup function only runs ONCE on actual component unmount.
        // We read from refs to get the latest values without triggering re-renders.

        const handleBeforeUnload = () => {
            const currentRoomId = liveKitInfoRef.current?.roomId;
            if (startTimeRef.current && currentRoomId) {
                const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
                const payload = JSON.stringify({
                    roomId: currentRoomId,
                    metrics: {
                        inputTokens: sessionTokensRef.current.prompt,
                        outputTokens: sessionTokensRef.current.completion,
                        totalTokens: sessionTokensRef.current.total,
                        durationSec
                    }
                });
                // Using sendBeacon for reliable delivery during page unload
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon('/api/agents/livekit-end', blob);

                // Also send stop signal to voice agent server
                const stopPayload = JSON.stringify({ channel_name: currentRoomId });
                const stopBlob = new Blob([stopPayload], { type: 'application/json' });
                navigator.sendBeacon(`${VOICE_AGENT_URL}/stop`, stopBlob);

                console.log("[VoiceAgent] beforeunload cleanup: Signals sent for room", currentRoomId);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // If the component unmounts while connected (e.g. React router navigation)
            const currentRoomId = liveKitInfoRef.current?.roomId;
            if (startTimeRef.current && currentRoomId) {
                const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
                agentApi.sensei.livekitEnd(currentRoomId, {
                    inputTokens: sessionTokensRef.current.prompt,
                    outputTokens: sessionTokensRef.current.completion,
                    totalTokens: sessionTokensRef.current.total,
                    durationSec
                }).catch(console.error);

                // Send stop signal to voice agent server to kick the agent immediately
                fetch(`${VOICE_AGENT_URL}/stop`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ channel_name: currentRoomId }),
                    keepalive: true // Ensure request completes after unmount
                }).catch(err => console.error("[VoiceAgent] Unmount cleanup failed to send stop signal:", err));

                console.log("[VoiceAgent] Unmount cleanup: Signal sent for room", currentRoomId);
            }
        };
    }, []);


    return (
        <div className="w-full max-w-4xl mx-auto font-inherit py-6 sm:py-12 px-4">
            {(connectionState === "idle" || connectionState === "error") && (
                <Card className="w-full max-w-2xl mx-auto border-border/40 shadow-none rounded-3xl overflow-hidden bg-card animate-in fade-in zoom-in-95 duration-500">
                    <CardContent className="p-8 sm:p-12 flex flex-col items-center gap-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                            <div className="relative size-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-inner">
                                <Mic className="size-10 text-primary" />
                            </div>
                        </div>

                        <div className="text-center space-y-3">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Roleplay với Sensei</h2>
                            <p className="text-muted-foreground text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
                                Luyện tập giao tiếp tiếng Nhật chuyên sâu qua giọng nói trực tiếp cùng AI Sensei.
                            </p>
                        </div>

                        {error && (
                            <div className="w-full text-xs text-destructive bg-destructive/5 border border-destructive/10 rounded-2xl px-5 py-4 font-bold flex items-center gap-3">
                                <span className="text-lg">⚠️</span> {error}
                            </div>
                        )}

                        <Button
                            onClick={connect}
                            size="lg"
                            className="w-full max-w-sm h-12 font-bold rounded-2xl text-sm shadow-md shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            <Mic className="mr-2.5 size-4" />
                            Bắt đầu bài học ngay
                        </Button>
                        
                        <div className="flex items-center gap-6 pt-4 text-muted-foreground/40 font-bold text-[10px] uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Wifi className="size-3" /> Đường truyền thấp</span>
                            <span className="flex items-center gap-1.5"><Zap className="size-3" /> Phản hồi tức thì</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {connectionState === "connecting" && (
                <div className="w-full flex flex-col items-center justify-center gap-6 py-32 animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 animate-ping rounded-full" />
                        <Loader2 className="relative size-12 text-primary animate-spin" strokeWidth={2.5} />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-base text-foreground font-bold">Sensei đang chuẩn bị phòng...</p>
                        <p className="text-xs text-muted-foreground">Vui lòng chờ trong giây lát khi chúng tôi thiết lập giáo án</p>
                    </div>
                </div>
            )}

            {connectionState === "connected" && liveKitInfo && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="border-border/40 shadow-none rounded-3xl overflow-hidden bg-card/50 backdrop-blur-md relative">
                        <LiveKitRoom
                            video={false}
                            audio={true}
                            token={liveKitInfo.token}
                            serverUrl={liveKitInfo.wsUrl}
                            onDisconnected={disconnect}
                            className="flex flex-col items-center gap-12 w-full p-8 sm:p-12"
                        >
                            <UsageMonitor onUpdate={(usage: { prompt: number; completion: number; total: number }) => {
                                setSessionTokens(prev => {
                                    const newTokens = {
                                        prompt: prev.prompt + usage.prompt,
                                        completion: prev.completion + usage.completion,
                                        total: prev.total + usage.total
                                    };
                                    sessionTokensRef.current = newTokens;
                                    return newTokens;
                                })
                            }} />

                            <div className="w-full flex flex-col items-center gap-12">
                                <AgentVisualizer />
                                <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                                    <AgentStatus />

                                    {sessionTokens.total > 0 && (
                                        <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 animate-in zoom-in duration-500 flex items-center gap-2 shadow-sm">
                                            <Zap className="size-3.5 text-yellow-500 shrink-0" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{sessionTokens.total.toLocaleString()} tokens sử dụng</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <RoomAudioRenderer />

                            <Button
                                variant="destructive"
                                size="lg"
                                onClick={disconnect}
                                className="h-12 px-10 font-bold rounded-2xl text-sm shadow-lg shadow-destructive/10 hover:scale-[1.02] transition-all"
                            >
                                <PhoneOff className="mr-3 size-4" />
                                Kết thúc & Lưu tiến trình
                            </Button>
                        </LiveKitRoom>
                    </Card>
                </div>
            )}
        </div>
    )
}

/**
 * Displays the dynamic status of the agent (Connecting, Waiting for Agent, Speaking, Listening)
 */
function AgentStatus() {
    const connState = useConnectionState()
    const participants = useParticipants()
    const tracks = useTracks([Track.Source.Microphone])

    // Find agent participant
    const agentParticipant = participants.find(p => p.identity.startsWith('agent-') || p.isAgent)
    const agentTrack = tracks.find((t: any) => t.participant.identity.startsWith('agent-') || t.participant.isAgent)
    const isSpeaking = agentTrack?.participant.isSpeaking ?? false

    // Multi-phase status logic
    let statusLabel = ""
    let subLabel = ""
    let isConnected = false

    if (connState === LiveKitConnectionState.Connecting || connState === LiveKitConnectionState.Reconnecting) {
        statusLabel = "Đang kết nối phòng..."
        subLabel = "Đang thiết lập đường truyền bảo mật..."
    } else if (!agentParticipant) {
        statusLabel = "Đang chờ Sensei vào lớp..."
        subLabel = "Sensei đang chuẩn bị giáo án, đợi một xíu nhé!"
    } else {
        isConnected = true
        statusLabel = isSpeaking ? "Sensei đang nói..." : "Sensei đang lắng nghe"
        subLabel = isSpeaking
            ? "Hãy chú ý lắng nghe Sensei nhé!"
            : "Sẵn sàng nhé! Hãy gửi lời chào đến Sensei nào!"
    }

    return (
        <div className="flex flex-col items-center gap-5 w-full">
            <div className={cn(
                "px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-tighter shadow-sm transition-all duration-500",
                isConnected 
                    ? (isSpeaking ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted/50 text-muted-foreground border-border/40")
                    : "bg-primary/5 text-primary border-primary/10"
            )}>
                {isConnected ? (isSpeaking ? "Sensei đang nói" : "Trực tuyến • Sẵn sàng") : "Đang đồng bộ..."}
            </div>
            
            <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold tracking-tight">
                    {statusLabel}
                </h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed h-10 max-w-[280px] mx-auto italic opacity-60">
                    "{subLabel}"
                </p>
            </div>
        </div>
    )
}

/**
 * Visualizer component that listens to tracks in the room
 */
function AgentVisualizer() {
    const tracks = useTracks([Track.Source.Microphone])
    const agentTrack = tracks.find((t: any) => t.participant.identity.startsWith('agent-') || t.participant.isAgent)
    const isSpeaking = agentTrack?.participant.isSpeaking ?? false

    return (
        <div className="relative isolate group">
            {/* Background Glows */}
            <div className={cn(
                "absolute -inset-12 bg-primary/20 blur-[80px] rounded-full transition-opacity duration-1000",
                isSpeaking ? "opacity-40" : "opacity-0"
            )} />
            
            <div className={cn(
                "relative size-40 sm:size-48 rounded-full flex items-center justify-center border-2 transition-all duration-1000 bg-card shadow-2xl overflow-hidden",
                isSpeaking
                    ? "border-emerald-500/50 scale-105 shadow-emerald-500/20"
                    : "border-border shadow-none"
            )}>
                {/* Internal Pulsing Circle */}
                <div className={cn(
                    "absolute size-32 sm:size-40 rounded-full transition-all duration-1000 translate-y-12",
                    isSpeaking ? "bg-emerald-500/10" : "bg-primary/5"
                )} />

                <div className={cn(
                    "relative size-28 sm:size-32 rounded-full overflow-hidden flex items-center justify-center transition-all duration-700",
                    isSpeaking ? "bg-emerald-500/5" : "bg-muted/10"
                )}>
                    {isSpeaking ? (
                        <div className="flex items-end gap-1.5 h-12">
                            {[0.4, 0.7, 1, 0.6, 0.8, 0.5, 0.9, 0.6, 0.4].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 bg-emerald-500 rounded-full animate-bounce shadow-emerald-500/30"
                                    style={{ 
                                        height: `${h * 100}%`, 
                                        animationDelay: `${i * 0.1}s`,
                                        animationDuration: '0.6s'
                                    }}
                                />
                            ))}
                        </div>
                    ) : ( 
                        <div className="relative flex items-center justify-center">
                            <Mic className="size-14 text-muted-foreground/30" strokeWidth={1.5} />
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent blur-2xl opacity-50" />
                        </div>
                    )}
                </div>
            </div>

            {/* Ripple Effects when speaking */}
            {isSpeaking && (
                <>
                    <div className="absolute -inset-4 rounded-full border border-emerald-400/20 animate-[ping_3s_linear_infinite]" />
                    <div className="absolute -inset-8 rounded-full border border-emerald-400/10 animate-[ping_4s_linear_infinite.5s]" />
                </>
            )}
        </div>
    )
}

/**
 * Monitor for billing usage DataPackets from the agent
 */
function UsageMonitor({ onUpdate }: { onUpdate: (usage: { prompt: number; completion: number; total: number }) => void }) {
    const room = useRoomContext()

    useEffect(() => {
        const handleData = (payload: Uint8Array, participant?: any, kind?: any, topic?: string) => {
            if (topic === 'billing_update') {
                try {
                    const data = JSON.parse(new TextDecoder().decode(payload))
                    if (data.type === 'billing_update') {
                        onUpdate({
                            prompt: data.inputTokens || 0,
                            completion: data.outputTokens || 0,
                            total: data.totalTokens || 0
                        })
                    }
                } catch (e) {
                    console.error("[UsageMonitor] Failed to parse billing update", e)
                }
            }
        }

        room.on(RoomEvent.DataReceived, handleData)
        return () => {
            room.off(RoomEvent.DataReceived, handleData)
        }
    }, [room, onUpdate])

    return null
}
