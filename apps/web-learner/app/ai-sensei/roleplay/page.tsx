"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { LivekitVoiceAgent } from "@/components/ai-sensei/livekit-voice-agent"
import { InteractiveRoleplay } from "@/components/ai-sensei/interactive-roleplay"
import { MonitorPlay, MessageSquareText, Sparkles } from "lucide-react"
import { agentApi } from "@/lib/api/services/agent-api"
import { useAppDispatch } from "@/hooks/hooks"

export default function RoleplayPage() {
    const dispatch = useAppDispatch()
    const [quota, setQuota] = React.useState<{ remainingTrial: number; cost: number; chargedCoins: boolean } | null>(null)
    const [activeTab, setActiveTab] = React.useState("interactive")

    React.useEffect(() => {
        const fetchQuota = async () => {
            try {
                const status = await agentApi.sensei.getQuotaStatus()
                setQuota(status)
            } catch (error) {
                console.error("Failed to fetch quota:", error)
            }
        }
        fetchQuota()
    }, [])

    return (
        <div className="h-full flex flex-col p-4 md:p-8 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="flex-none flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 mt-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-2.5 rounded-2xl">
                                <Sparkles className="size-6 text-primary fill-primary/20" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight">
                                    AI Roleplay
                                </h1>
                                <p className="text-muted-foreground font-medium">Luyện tập hội thoại tiếng Nhật với Sensei</p>
                            </div>
                        </div>
                    </div>
                    <TabsList className="p-1 bg-muted/40 backdrop-blur-md border border-border/50 rounded-xl h-auto">
                        <TabsTrigger
                            value="interactive"
                            className="gap-2 py-2.5 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-sm font-bold"
                        >
                            <MessageSquareText className="size-4" />
                            Hội thoại tự do
                        </TabsTrigger>
                        <TabsTrigger
                            value="scenario"
                            className="gap-2 py-2.5 px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-sm font-bold"
                        >
                            <MonitorPlay className="size-4" />
                            Live Voice Roleplay
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 min-h-0 relative group">
                    {/* Decorative background glow aligned with primary color */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur opacity-30 group-hover:opacity-40 transition duration-1000"></div>

                    <Card className="relative h-full min-h-0 bg-card dark:bg-card/40 shadow-xl border-border/40 overflow-hidden backdrop-blur-xl rounded-3xl">
                        <TabsContent forceMount value="interactive" className="h-full min-h-0 m-0 data-[state=inactive]:hidden border-none outline-none overflow-hidden">
                            <InteractiveRoleplay />
                        </TabsContent>
                        <TabsContent forceMount value="scenario" className="h-full min-h-0 m-0 data-[state=inactive]:hidden border-none outline-none p-0 overflow-y-auto">
                            <LivekitVoiceAgent />
                        </TabsContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    )
}
