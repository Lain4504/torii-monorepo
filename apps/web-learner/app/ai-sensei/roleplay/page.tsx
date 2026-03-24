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

import { QuotaIndicator } from "@/components/ai-sensei/quota-indicator"
import { SenseiPageHeader } from "@/components/ai-sensei/sensei-page-header"

export default function RoleplayPage() {
    const dispatch = useAppDispatch()
    const [activeTab, setActiveTab] = React.useState("interactive")

    return (
        <div className="flex h-full min-h-0 flex-col px-2 py-3 sm:px-6 sm:py-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <SenseiPageHeader
                    title="AI Roleplay"
                    description="Luyện tập hội thoại tiếng Nhật với Sensei"
                    icon={Sparkles}
                >
                    <TabsList className="w-full overflow-x-auto whitespace-nowrap">
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

                <div className="flex-1 min-h-0 relative">
                    <TabsContent forceMount value="interactive" className="h-full min-h-0 m-0 data-[state=inactive]:hidden border-none outline-none overflow-hidden">
                        <InteractiveRoleplay />
                    </TabsContent>
                    <TabsContent forceMount value="scenario" className="h-full min-h-0 m-0 data-[state=inactive]:hidden border-none outline-none p-0 overflow-y-auto">
                        <LivekitVoiceAgent />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
