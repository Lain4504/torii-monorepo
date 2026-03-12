"use client"

import { AiChatBot } from "@/components/ai-sensei/ai-chat-bot"
import { SenseiPageHeader } from "@/components/ai-sensei/sensei-page-header"
import { MessageSquare } from "lucide-react"

export default function ChatPage() {
    return (
        <div className="h-full flex flex-col p-4 md:p-8 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
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
