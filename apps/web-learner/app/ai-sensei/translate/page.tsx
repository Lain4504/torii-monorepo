"use client"

import { TranslatorView } from "@/components/ai-sensei/translator-view"
import { SenseiPageHeader } from "@/components/ai-sensei/sensei-page-header"
import { Languages } from "lucide-react"

export default function TranslatePage() {
    return (
        <div className="flex h-full min-h-0 flex-col overflow-y-auto px-2 py-3 custom-scrollbar sm:px-6 sm:py-6 lg:px-8">
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
