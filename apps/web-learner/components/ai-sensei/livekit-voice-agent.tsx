"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { Mic, PhoneOff, Loader2, Wifi, Zap, Sparkles } from "lucide-react"
import {
    LiveKitRoom,
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

// Types
type LocalConnectionState = "idle" | "connecting" | "connected" | "error"

interface LiveKitInfo {
    token: string
    wsUrl: string
    roomId: string
}

type GraphName = "japanese_tutor" | "roleplay" | "free_conversation"

const GRAPH_OPTIONS: Array<{ value: GraphName; label: string }> = [
    { value: "japanese_tutor", label: "Japanese Tutor (Sakura)" },
    { value: "roleplay", label: "Roleplay (Yuki)" },
    { value: "free_conversation", label: "Free Conversation" },
]

const GRAPH_RUNTIME_CONFIG: Record<
    GraphName,
    {
        model: string
        voice: string
        temperature: number
        instructions: string
        modalities: string
        maxOutputTokens: string
    }
> = {
    japanese_tutor: {
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        voice: "Aoede",
        temperature: 0.7,
        instructions:
            "You are Sakura, a helpful Japanese tutor. Always answer only in Japanese and guide learners with gentle corrections and encouragement.",
        modalities: "audio_only",
        maxOutputTokens: "inf",
    },
    roleplay: {
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        voice: "Puck",
        temperature: 0.8,
        instructions:
            "You are Yuki, a native Japanese conversation partner. Always speak only Japanese and keep responses concise and natural for voice conversation.",
        modalities: "audio_only",
        maxOutputTokens: "inf",
    },
    free_conversation: {
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        voice: "Charon",
        temperature: 0.7,
        instructions:
            "You are a friendly Japanese speaking partner. Always answer in Japanese, concise and supportive, and ask follow-up questions.",
        modalities: "audio_only",
        maxOutputTokens: "inf",
    },
}

function buildRuntimeConfigPayload(graphName: GraphName, geminiApiKey?: string) {
    const config = GRAPH_RUNTIME_CONFIG[graphName]
    return {
        graphName,
        model: config.model,
        voice: config.voice,
        temperature: config.temperature,
        instructions: config.instructions,
        modalities: config.modalities,
        max_output_tokens: config.maxOutputTokens,
        gemini_api_key: geminiApiKey || "",
    }
}

export function LivekitVoiceAgent() {
    const [connectionState, setConnectionState] = useState<LocalConnectionState>("idle")
    const [selectedGraph, setSelectedGraph] = useState<GraphName>("japanese_tutor")
    const [isUpdatingConfig, setIsUpdatingConfig] = useState(false)
    const [liveKitInfo, setLiveKitInfo] = useState<LiveKitInfo | null>(null)
    const [sessionTokens, setSessionTokens] = useState({ prompt: 0, completion: 0, total: 0 })
    const sessionTokensRef = useRef({ prompt: 0, completion: 0, total: 0 })
    const [error, setError] = useState<string | null>(null)
    const startTimeRef = useRef<number | null>(null)
    const liveKitInfoRef = useRef<LiveKitInfo | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const queryClient = useQueryClient()
    const sessionGeminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

    // Connect
    const connect = useCallback(async () => {
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
            // 1. Get LiveKit Token from Torii Gateway
            const result = await agentApi.sensei.getLivekitToken(selectedGraph, sessionGeminiApiKey)
            if (abortController.signal.aborted) return

            const { token, wsUrl, roomId } = result

            setLiveKitInfo({ token, wsUrl, roomId })
            liveKitInfoRef.current = { token, wsUrl, roomId }

            if (abortController.signal.aborted) return
            setConnectionState("connected")
        } catch (err: any) {
            if (err.name === "AbortError") {
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
    }, [selectedGraph, sessionGeminiApiKey])

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
        }

        setConnectionState("idle")
        setLiveKitInfo(null)
        liveKitInfoRef.current = null
        startTimeRef.current = null
    }, [liveKitInfo, queryClient])

    // Cleanup on Unmount and Page Navigation
    useEffect(() => {
        const handleBeforeUnload = () => {
            const currentRoomId = liveKitInfoRef.current?.roomId
            if (startTimeRef.current && currentRoomId) {
                const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000)
                const payload = JSON.stringify({
                    roomName: currentRoomId,
                    inputTokens: sessionTokensRef.current.prompt,
                    outputTokens: sessionTokensRef.current.completion,
                    totalTokens: sessionTokensRef.current.total,
                    durationSec
                })

                // Using sendBeacon for reliable delivery during page unload
                const blob = new Blob([payload], { type: "application/json" })
                navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/agents/livekit-end`, blob)

                console.log("[VoiceAgent] beforeunload cleanup: Signals sent for room", currentRoomId)
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
            // If the component unmounts while connected (e.g. React router navigation)
            const currentRoomId = liveKitInfoRef.current?.roomId
            if (startTimeRef.current && currentRoomId) {
                const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000)
                agentApi.sensei.livekitEnd(currentRoomId, {
                    inputTokens: sessionTokensRef.current.prompt,
                    outputTokens: sessionTokensRef.current.completion,
                    totalTokens: sessionTokensRef.current.total,
                    durationSec
                }).catch(console.error)

                console.log("[VoiceAgent] Unmount cleanup: Signal sent for room", currentRoomId)
            }
        }
    }, [])

    return (
        <div className="relative h-full w-full max-w-5xl mx-auto font-inherit py-2 sm:py-3 px-3 sm:px-4">
            <div className="pointer-events-none absolute inset-x-8 top-8 h-28 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute right-6 bottom-16 size-24 rounded-full bg-emerald-500/10 blur-2xl" />

            {(connectionState === "idle" || connectionState === "error") && (
                <Card className="relative w-full max-w-2xl mx-auto border-border/40 shadow-none rounded-3xl overflow-hidden bg-card/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
                    <CardContent className="p-6 sm:p-7 flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="absolute -inset-6 rounded-full bg-primary/10 blur-2xl" />
                            <div className="relative size-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border border-primary/20 shadow-inner">
                                <Mic className="size-8 text-primary" strokeWidth={2.2} />
                            </div>
                        </div>

                        <div className="text-center space-y-3 max-w-md">
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary/80">
                                <Sparkles className="size-3" /> Voice Studio
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-2">Roleplay với Sensei</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Luyện tập giao tiếp tiếng Nhật chuyên sâu qua giọng nói trực tiếp cùng AI Sensei.
                            </p>
                        </div>

                        <div className="w-full max-w-sm space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Chế độ hội thoại</label>
                            <select
                                value={selectedGraph}
                                onChange={(e) => setSelectedGraph(e.target.value as GraphName)}
                                className="w-full h-11 rounded-2xl border border-border/50 bg-background/80 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                {GRAPH_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="w-full text-xs text-destructive bg-destructive/5 border border-destructive/10 rounded-2xl px-5 py-4 font-bold flex items-center gap-3">
                                <span className="text-lg">⚠️</span> {error}
                            </div>
                        )}

                        <Button
                            onClick={connect}
                            size="lg"
                            className="w-full max-w-sm h-11 font-bold rounded-2xl text-sm shadow-md shadow-primary/20 hover:scale-[1.02] transition-all bg-primary"
                        >
                            <Mic className="mr-2.5 size-4" />
                            Bắt đầu bài học ngay
                        </Button>

                        <div className="flex items-center gap-6 pt-1 text-muted-foreground/50 font-bold text-[10px] uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Wifi className="size-3" /> Đường truyền thấp</span>
                            <span className="flex items-center gap-1.5"><Zap className="size-3" /> Phản hồi tức thì</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {connectionState === "connecting" && (
                <Card className="w-full max-w-xl mx-auto border-border/40 rounded-3xl bg-card/85 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
                    <CardContent className="py-14 px-6 flex flex-col items-center justify-center gap-5">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/10 animate-ping rounded-full" />
                            <Loader2 className="relative size-12 text-primary animate-spin" strokeWidth={2.5} />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-base text-foreground font-bold">Sensei đang chuẩn bị phòng...</p>
                            <p className="text-xs text-muted-foreground">Vui lòng chờ trong giây lát khi chúng tôi thiết lập giáo án</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {connectionState === "connected" && liveKitInfo && (
                <div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="border-border/40 shadow-none rounded-3xl overflow-hidden bg-card/85 backdrop-blur-xl relative max-h-[calc(100dvh-180px)]">
                        <LiveKitRoom
                            video={false}
                            audio={true}
                            token={liveKitInfo.token}
                            serverUrl={liveKitInfo.wsUrl}
                            onDisconnected={disconnect}
                            className="w-full h-full p-3 sm:p-4"
                        >
                            <RuntimeSessionConfigUpdater
                                graphName={selectedGraph}
                                geminiApiKey={sessionGeminiApiKey}
                                onUpdatingChange={setIsUpdatingConfig}
                            />

                            <UsageMonitor onUpdate={(usage: { prompt: number; completion: number; total: number }) => {
                                setSessionTokens(prev => {
                                    const newTokens = {
                                        prompt: prev.prompt + usage.prompt,
                                        completion: prev.completion + usage.completion,
                                        total: prev.total + usage.total
                                    }
                                    sessionTokensRef.current = newTokens
                                    return newTokens
                                })
                            }} />

                            <div className="w-full max-w-2xl mx-auto rounded-2xl border border-border/50 bg-background/60 p-4 sm:p-5 flex flex-col items-center gap-4 sm:gap-5">
                                <AgentVisualizer />
                                <AgentStatus />

                                <div className="w-full max-w-md space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Đổi chế độ trong phiên</label>
                                    <select
                                        value={selectedGraph}
                                        onChange={(e) => setSelectedGraph(e.target.value as GraphName)}
                                        className="w-full h-11 rounded-2xl border border-border/50 bg-background/80 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    >
                                        {GRAPH_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {isUpdatingConfig && (
                                        <p className="text-[11px] font-semibold text-primary">Đang cập nhật cấu hình AI Sensei...</p>
                                    )}
                                </div>

                                {sessionTokens.total > 0 && (
                                    <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 animate-in zoom-in duration-500 flex items-center gap-2 shadow-sm">
                                        <Zap className="size-3.5 text-yellow-500 shrink-0" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{sessionTokens.total.toLocaleString()} tokens sử dụng</span>
                                    </div>
                                )}

                                <Button
                                    variant="destructive"
                                    size="lg"
                                    onClick={disconnect}
                                    className="h-10 w-full max-w-md font-bold rounded-2xl text-sm shadow-lg shadow-destructive/10 hover:scale-[1.02] transition-all"
                                >
                                    <PhoneOff className="mr-3 size-4" />
                                    Kết thúc
                                </Button>
                            </div>

                            <RoomAudioRenderer />
                        </LiveKitRoom>
                    </Card>
                </div>
            )}
        </div>
    )
}

function RuntimeSessionConfigUpdater({
    graphName,
    geminiApiKey,
    onUpdatingChange,
}: {
    graphName: GraphName
    geminiApiKey?: string
    onUpdatingChange?: (updating: boolean) => void
}) {
    const room = useRoomContext()
    const participants = useParticipants()
    const connectionState = useConnectionState()
    const previousGraphRef = useRef<GraphName>(graphName)

    useEffect(() => {
        if (connectionState !== LiveKitConnectionState.Connected) {
            previousGraphRef.current = graphName
            return
        }

        if (previousGraphRef.current === graphName) {
            return
        }

        const agentParticipant = participants.find((p) => p.identity.startsWith("agent-") || p.isAgent)
        if (!agentParticipant?.identity) {
            return
        }

        let cancelled = false
        const updateConfig = async () => {
            onUpdatingChange?.(true)
            try {
                const response = await room.localParticipant.performRpc({
                    destinationIdentity: agentParticipant.identity,
                    method: "pg.updateConfig",
                    payload: JSON.stringify(buildRuntimeConfigPayload(graphName, geminiApiKey)),
                })
                console.log("[VoiceAgent] pg.updateConfig", response)
            } catch (error) {
                console.error("[VoiceAgent] Failed to perform pg.updateConfig", error)
            } finally {
                if (!cancelled) {
                    previousGraphRef.current = graphName
                    onUpdatingChange?.(false)
                }
            }
        }

        void updateConfig()

        return () => {
            cancelled = true
        }
    }, [connectionState, graphName, participants, room, geminiApiKey, onUpdatingChange])

    return null
}

/**
 * Displays the dynamic status of the agent (Connecting, Waiting for Agent, Speaking, Listening)
 */
function AgentStatus() {
    const connState = useConnectionState()
    const participants = useParticipants()
    const tracks = useTracks([Track.Source.Microphone])

    // Find agent participant
    const agentParticipant = participants.find(p => p.identity.startsWith("agent-") || p.isAgent)
    const agentTrack = tracks.find((t: any) => t.participant.identity.startsWith("agent-") || t.participant.isAgent)
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
        <div className="flex flex-col items-center gap-3 w-full">
            <div className={cn(
                "px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-tighter shadow-sm transition-all duration-500",
                isConnected
                    ? (isSpeaking ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted/50 text-muted-foreground border-border/40")
                    : "bg-primary/5 text-primary border-primary/10"
            )}>
                {isConnected ? (isSpeaking ? "Sensei đang nói" : "Trực tuyến • Sẵn sàng") : "Đang đồng bộ..."}
            </div>

            <div className="space-y-1.5 text-center max-w-xs">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {statusLabel}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed mx-auto italic opacity-70">
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
    const agentTrack = tracks.find((t: any) => t.participant.identity.startsWith("agent-") || t.participant.isAgent)
    const isSpeaking = agentTrack?.participant.isSpeaking ?? false

    return (
        <div className="w-full flex items-center justify-center py-1">
            <div className={cn(
                "size-32 sm:size-40 rounded-full flex items-center justify-center border transition-all duration-500 bg-gradient-to-b from-background to-muted/20",
                isSpeaking ? "border-emerald-400/60 shadow-[0_0_40px_rgba(16,185,129,0.25)]" : "border-border/70"
            )}>
                <Mic
                    className={cn(
                        "size-12 sm:size-14 transition-all duration-300",
                        isSpeaking ? "text-emerald-500 animate-pulse" : "text-muted-foreground/40"
                    )}
                    strokeWidth={1.8}
                />
            </div>
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
            if (topic === "billing_update") {
                try {
                    const data = JSON.parse(new TextDecoder().decode(payload))
                    if (data.type === "billing_update") {
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
