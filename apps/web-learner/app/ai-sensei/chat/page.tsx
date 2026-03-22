"use client"

import { AiChatBot } from "@/components/ai-sensei/ai-chat-bot"
import { SenseiPageHeader } from "@/components/ai-sensei/sensei-page-header"
import { MessageSquare } from "lucide-react"

export default function ChatPage() {
    return (
        <div className="flex h-full min-h-0 flex-col px-2 py-3 sm:px-6 sm:py-6 lg:px-8">
            <SenseiPageHeader
                title="AI Sensei Chat"
                description="Hỏi đáp và giải thích tiếng Nhật cùng Sensei"
                icon={MessageSquare}
            />
            <div className="flex-1 min-h-0">
                <AiChatBot />
            </div>
        </div>
    )
}
