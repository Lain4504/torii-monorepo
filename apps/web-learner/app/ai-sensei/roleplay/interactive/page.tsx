"use client"

import * as React from "react"
import { InteractiveRoleplay } from "@/components/ai-sensei/interactive-roleplay"
import { SenseiPageHeader } from "@/components/ai-sensei/sensei-page-header"
import { MessageSquareText, Sparkles } from "lucide-react"

export default function InteractiveRoleplayPage() {
    return (
        <div className="flex h-full min-h-0 flex-col px-2 py-3 sm:px-6 sm:py-6 lg:px-8">
            <SenseiPageHeader
                title="Hội thoại tự do"
                description="Luyện tập giao tiếp tiếng Nhật tự do cùng AI Sensei"
                icon={Sparkles}
            />
            <div className="flex-1 min-h-0 relative mt-4">
                <InteractiveRoleplay />
            </div>
        </div>
    )
}
