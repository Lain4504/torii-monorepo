"use client"

import * as React from "react"
import {
    LiveKitRoom,
    RoomAudioRenderer,
    BarVisualizer,
    useTracks,
} from "@livekit/components-react"
import { Track } from "livekit-client"
import { Mic, MicOff, PhoneOff, Volume2, Sparkles, Zap, Settings, RefreshCcw, MonitorPlay } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "sonner"

const serverUrl = process.env.NEXT_PUBLIC_VOICE_AGENT_URL || "http://localhost:8082"

export function LivekitVoiceAgent() {
    const [token, setToken] = React.useState<string | null>(null)
    const [roomName, setRoomName] = React.useState<string | null>(null)
    const [isConnecting, setIsConnecting] = React.useState(false)

    async function handleStart() {
        setIsConnecting(true)
        const name = `torii-voice-${Math.random().toString(36).substring(7)}`
        try {
            const resp = await fetch(`/api/livekit/token?room=${name}&user=learner`)
            const data = await resp.json()
            setToken(data.token)
            setRoomName(name)
        } catch (e) {
            toast.error("Không thể kết nối tới Voice Server")
        } finally {
            setIsConnecting(false)
        }
    }

    if (!token) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 min-w-0">
                <Card className="w-full max-w-lg border border-border shadow-none rounded-2xl overflow-hidden bg-card transition-all">
                    <CardContent className="p-8 flex flex-col items-center gap-6">
                        <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <MonitorPlay className="size-7 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold tracking-tight">Voice Roleplay</h2>
                            <p className="text-muted-foreground text-xs max-w-[280px] mx-auto leading-relaxed">
                                Luyện tập hội thoại giao tiếp trực tiếp bằng giọng nói cùng AI Sensei trong môi trường thực tế.
                            </p>
                        </div>
                        <Button
                            className="w-full h-11 font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all"
                            onClick={handleStart}
                            disabled={isConnecting}
                        >
                            {isConnecting ? "Đang kết nối..." : "Bắt đầu cuộc gọi"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-full w-full max-w-full overflow-x-hidden min-w-0">
            <LiveKitRoom
                video={false}
                audio={true}
                token={token}
                serverUrl={serverUrl}
                onDisconnected={() => { setToken(null); setRoomName(null) }}
                className="flex flex-col h-full bg-background min-w-0"
            >
                <AgentVisualizer />
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    )
}

function AgentVisualizer() {
    const tracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }])
    const [isMuted, setIsMuted] = React.useState(false)

    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4 sm:p-8 max-w-full min-w-0 overflow-hidden">
            {/* Visualizer Area */}
            <div className="relative size-48 sm:size-56 flex items-center justify-center flex-col gap-4">
                <div className={cn(
                    "absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse",
                    !isMuted && "border-primary/40 scale-110"
                )} />
                <div className="size-36 sm:size-40 rounded-full bg-card border-4 border-border shadow-2xl flex items-center justify-center z-10 overflow-hidden relative">
                    <BarVisualizer className="h-16 w-32 text-primary" />
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                        <Sparkles className="size-10 text-primary/20 animate-pulse" />
                    </div>
                </div>
                <Badge variant="outline" className="z-10 rounded-full px-4 py-1 font-bold text-xs bg-card/80 backdrop-blur-sm border-border shadow-sm">
                    Sensei is Listening...
                </Badge>
            </div>

            {/* Controls Bar - Compact & Solid */}
            <div className="w-full max-w-[280px] sm:max-w-xs space-y-3 min-w-0 overflow-hidden">
                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant={isMuted ? "destructive" : "outline"}
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-lg transition-transform active:scale-95"
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                    </Button>

                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-2xl animate-in zoom-in duration-300 transition-transform active:scale-95"
                        onClick={() => window.location.reload()}
                    >
                        <PhoneOff className="size-6" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-lg transition-transform active:scale-95"
                    >
                        <Settings className="size-5 text-muted-foreground" />
                    </Button>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Powered by LiveKit AI</p>
                    <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/40 w-1/2 animate-shimmer" />
                    </div>
                </div>
            </div>
        </div>
    )
}
