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
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white">Danh sách câu hỏi</h3>
                <div className="flex gap-4 text-xs mt-2 text-slate-500">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-teal-600" />
                        <span>Đã làm</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-orange-400 bg-orange-50" />
                        <span>Đánh dấu</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-slate-300" />
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
                                    "relative h-10 w-10 text-sm font-medium rounded-lg transition-all border",
                                    isActive
                                        ? "ring-2 ring-teal-600 border-teal-600 z-10"
                                        : "border-slate-200 dark:border-slate-800 hover:border-teal-400",
                                    isAnswered
                                        ? "bg-teal-600 text-white border-teal-600"
                                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300",
                                    isFlagged && !isAnswered && "bg-orange-50 border-orange-300 text-orange-700"
                                )}
                            >
                                {index + 1}
                                {isFlagged && (
                                    <div className="absolute -top-1 -right-1">
                                        <Flag className="w-3 h-3 fill-orange-500 text-orange-500" />
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
