"use client"

import { TranslatorView } from "@/components/ai-sensei/translator-view"
import { SenseiPageHeader } from "@/components/ai-sensei/sensei-page-header"
import { Languages } from "lucide-react"

export default function TranslatePage() {
    return (
        <div className="h-full flex flex-col p-4 md:p-8 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background overflow-y-auto custom-scrollbar">
            <SenseiPageHeader
                title="Dịch thuật & Ngữ pháp"
                description="Dịch văn bản và phân tích cấu trúc ngữ pháp thông minh"
                icon={Languages}
            />
            <div className="flex-1 min-h-0">
                <TranslatorView />
            </div>
        </div>
    )
}
