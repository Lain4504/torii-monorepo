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
import { agentApi } from "@/lib/api/services/agent-api"
import { useAppDispatch } from "@/hooks/hooks"
import { fetchProfile } from "@/store/slices/authSlice"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────
const VOICE_AGENT_URL = process.env.NEXT_PUBLIC_VOICE_AGENT_URL || "http://localhost:8123"

// ─── Types ───────────────────────────────────────────────────────────────────
type LocalConnectionState = "idle" | "connecting" | "connected" | "error"

interface LiveKitInfo {
    token: string
    wsUrl: string
    roomId: string
}

export function LivekitVoiceAgent() {
    const dispatch = useAppDispatch()
    const [connectionState, setConnectionState] = useState<LocalConnectionState>("idle")
    const [liveKitInfo, setLiveKitInfo] = useState<LiveKitInfo | null>(null)
    const [sessionTokens, setSessionTokens] = useState({ prompt: 0, completion: 0, total: 0 })
    const sessionTokensRef = useRef({ prompt: 0, completion: 0, total: 0 })
    const [error, setError] = useState<string | null>(null)
    const startTimeRef = useRef<number | null>(null)
    const liveKitInfoRef = useRef<LiveKitInfo | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

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
            }).catch(console.error)
        }

        setConnectionState("idle")
        setLiveKitInfo(null)
        liveKitInfoRef.current = null
        startTimeRef.current = null
        // Refresh profile to update coins after session ends
        setTimeout(() => dispatch(fetchProfile()), 1500)
    }, [dispatch, liveKitInfo])

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
                console.log("[VoiceAgent] beforeunload cleanup: Signal sent for room", currentRoomId);
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
                console.log("[VoiceAgent] Unmount cleanup: Signal sent for room", currentRoomId);

                // Refresh profile to update coins on UI after unmounting navigation
                setTimeout(() => dispatch(fetchProfile()), 1500);
            }
        };
    }, []);


    return (
        <div className="w-full max-w-xl mx-auto font-inherit py-12 px-4">
            <style jsx global>{`
                .livekit-heading { font-weight: 700; }
            `}</style>

            {(connectionState === "idle" || connectionState === "error") && (
                <div className="w-full border-border shadow-none flex flex-col items-center gap-6 p-8 rounded-[1.5rem] border bg-card/50 animate-in fade-in duration-500">
                    <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mic className="size-8 text-primary" />
                    </div>

                    <div className="text-center space-y-1.5">
                        <h2 className="text-2xl font-bold text-foreground">Roleplay với Sensei</h2>
                        <p className="text-muted-foreground text-sm max-w-[280px]">Luyện nói tiếng Nhật cùng Sensei trong môi trường thực tế</p>
                    </div>

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <Button
                        onClick={connect}
                        size="lg"
                        className="w-full max-w-sm h-11 font-bold uppercase tracking-widest text-[10px]"
                    >
                        <Mic className="mr-2 size-3.5" />
                        Bắt đầu bài học
                    </Button>
                    <p className="text-[10px] text-muted-foreground italic text-center w-full">
                        * Tính năng này tiêu tốn Coins/phiên hội thoại.
                    </p>
                </div>
            )}

            {connectionState === "connecting" && (
                <div className="w-full border-border shadow-none flex flex-col items-center gap-4 py-20 bg-card/50 rounded-[1.5rem] border animate-in fade-in duration-500">
                    <Loader2 className="size-10 text-primary animate-spin" strokeWidth={2.5} />
                    <p className="text-sm text-primary font-bold animate-pulse">Sensei đang chuẩn bị phòng...</p>
                </div>
            )}

            {connectionState === "connected" && liveKitInfo && (
                <div className="w-full border-border shadow-none flex flex-col items-center gap-10 p-8 rounded-[1.5rem] border bg-card/50 animate-in fade-in duration-500">
                    <LiveKitRoom
                        video={false}
                        audio={true}
                        token={liveKitInfo.token}
                        serverUrl={liveKitInfo.wsUrl}
                        onDisconnected={disconnect}
                        className="flex flex-col items-center gap-10 w-full"
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
                            // Refresh profile balance when usage is recorded
                            dispatch(fetchProfile())
                        }} />

                        <div className="w-full flex flex-col items-center gap-8">
                            <AgentVisualizer />
                            <div className="flex flex-col items-center gap-6">
                                <AgentStatus />

                                {sessionTokens.total > 0 && (
                                    <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10 animate-in zoom-in duration-300">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                                            <Zap className="size-3 text-yellow-500 shrink-0" />
                                            <span className="text-muted-foreground">{sessionTokens.total.toLocaleString()} tokens</span>
                                            <span className="text-muted-foreground/40">·</span>
                                            <span className="text-blue-500">
                                                ≈ {Math.ceil((sessionTokens.prompt * 0.075) + (sessionTokens.completion * 0.3)).toLocaleString()} Coins
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <RoomAudioRenderer />

                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={disconnect}
                            className="h-11 px-8 font-bold uppercase tracking-widest text-[10px]"
                        >
                            <PhoneOff className="mr-2 size-4" />
                            Kết thúc bài học
                        </Button>
                    </LiveKitRoom>
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
        <div className="flex flex-col items-center gap-4">
            <p className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
                isSpeaking ? "text-emerald-500" : isConnected ? "text-muted-foreground" : "text-primary animate-pulse"
            )}>
                {isConnected ? "Đang trực tuyến • " : ""}{statusLabel}
            </p>
            <p className="text-base text-center italic text-muted-foreground px-4 leading-relaxed h-12 flex items-center justify-center">
                "{subLabel}"
            </p>
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
        <div className="relative group cursor-default">
            <div className={cn(
                "size-36 rounded-full flex items-center justify-center border transition-all duration-700 bg-card/50 backdrop-blur-sm",
                isSpeaking
                    ? "border-emerald-500 scale-105 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                    : "border-border shadow-none"
            )}>
                <div className={cn(
                    "size-24 rounded-full overflow-hidden flex items-center justify-center transition-all duration-700",
                    isSpeaking ? "bg-emerald-500/5 ring-4 ring-emerald-500/5" : "bg-muted/10 text-muted-foreground/40"
                )}>
                    {isSpeaking ? (
                        <div className="flex items-end gap-1 h-10">
                            {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 bg-emerald-500 rounded-full animate-bounce shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                    style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="relative flex items-center justify-center">
                            <Mic className="size-12 text-muted-foreground/40" strokeWidth={2} />
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent blur-2xl" />
                        </div>
                    )}
                </div>
            </div>
            {isSpeaking && (
                <div className="absolute -inset-4 rounded-full border-2 border-emerald-400/10 animate-[ping_3s_linear_infinite]" />
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
