"use client"

import * as React from "react"
import { LivekitVoiceAgent } from "@/components/ai-sensei/livekit-voice-agent"
import { SenseiPageHeader } from "@/components/ai-sensei/sensei-page-header"
import { MonitorPlay, Sparkles } from "lucide-react"

export default function VoiceRoleplayPage() {
    return (
        <div className="flex h-full min-h-0 flex-col px-2 py-3 sm:px-6 sm:py-6 lg:px-8">
            <SenseiPageHeader
                title="Live Voice Roleplay"
                description="Luyện tập hội thoại qua video và giọng nói trực tiếp cùng AI Sensei"
                icon={Sparkles}
            />
            <div className="flex-1 min-h-0 relative mt-4 overflow-y-auto">
                <LivekitVoiceAgent />
            </div>
        </div>
    )
}
