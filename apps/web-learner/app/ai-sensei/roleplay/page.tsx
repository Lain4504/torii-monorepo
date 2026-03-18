"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs-lifted"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { LivekitVoiceAgent } from "@/components/ai-sensei/livekit-voice-agent"
import { InteractiveRoleplay } from "@/components/ai-sensei/interactive-roleplay"
import { MonitorPlay, MessageSquareText, Sparkles } from "lucide-react"
import { agentApi } from "@/lib/api/services/agent-api"
import { useAppDispatch } from "@/hooks/hooks"

import { QuotaIndicator } from "@/components/ai-sensei/quota-indicator"
import { SenseiPageHeader } from "@/components/ai-sensei/sensei-page-header"

export default function RoleplayPage() {
    const dispatch = useAppDispatch()
    const [activeTab, setActiveTab] = React.useState("interactive")

    return (
        <div className="h-full flex flex-col p-4 md:p-8 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <SenseiPageHeader
                    title="AI Roleplay"
                    description="Luyện tập hội thoại tiếng Nhật với Sensei"
                    icon={Sparkles}
                >
                    <TabsList>
                        <TabsTrigger
                            value="interactive"
                        >
                            <MessageSquareText className="size-4" />
                            Hội thoại tự do
                        </TabsTrigger>
                        <TabsTrigger
                            value="scenario"
                        >
                            <MonitorPlay className="size-4" />
                            Live Voice Roleplay
                        </TabsTrigger>
                    </TabsList>
                </SenseiPageHeader>

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
