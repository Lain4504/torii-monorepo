'use client'

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Flag } from "lucide-react"

interface QuestionNavigatorProps {
    questions: any[]
    currentIndex: number
    answers: Record<string, string>
    flags: Set<string>
    onSelect: (index: number) => void
}

export function QuestionNavigator({
    questions,
    currentIndex,
    answers,
    flags,
    onSelect
}: QuestionNavigatorProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h3 className="font-bold text-foreground">Danh sách câu hỏi</h3>
                <div className="flex gap-4 text-xs mt-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span>Đã làm</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-primary bg-primary/10" />
                        <span>Đánh dấu</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-border" />
                        <span>Chưa làm</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, index) => {
                        const isAnswered = !!answers[q.id]
                        const isFlagged = flags.has(q.id)
                        const isActive = currentIndex === index

                        return (
                            <button
                                key={q.id}
                                onClick={() => onSelect(index)}
                                className={cn(
                                    "relative h-10 w-10 text-sm font-medium rounded-lg transition-colors border cursor-pointer",
                                    isActive
                                        ? "ring-2 ring-primary border-primary z-10"
                                        : "border hover:border-primary/50",
                                    isAnswered
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-card-foreground",
                                    isFlagged && !isAnswered && "bg-accent border-primary/30"
                                )}
                            >
                                {index + 1}
                                {isFlagged && (
                                    <div className="absolute -top-1 -right-1">
                                        <Flag className="w-3 h-3 fill-primary text-primary" />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
