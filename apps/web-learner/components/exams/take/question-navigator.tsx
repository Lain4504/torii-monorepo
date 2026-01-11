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
        <div className="h-full flex flex-col bg-background/50 backdrop-blur-xl border-r border-white/5">
            <div className="p-6 border-b border-white/5">
                <h3 className="font-black uppercase tracking-widest text-xs text-muted-foreground/50 mb-4">Navigation Matrix</h3>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        <span>Flagged</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-white/20" />
                        <span>Pending</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-5 gap-3">
                    {questions.map((q, index) => {
                        const isAnswered = !!answers[q.id]
                        const isFlagged = flags.has(q.id)
                        const isActive = currentIndex === index

                        return (
                            <button
                                key={q.id}
                                onClick={() => onSelect(index)}
                                className={cn(
                                    "relative h-10 w-10 text-[10px] font-black rounded-xl transition-all duration-300 border flex items-center justify-center",
                                    isActive
                                        ? "ring-2 ring-primary border-primary bg-primary/10 text-primary z-10 scale-110 shadow-lg shadow-primary/20"
                                        : "border-white/5 hover:border-primary/30 hover:bg-white/5 text-muted-foreground",
                                    isAnswered && !isActive
                                        ? "bg-primary/20 text-primary border-primary/20"
                                        : "",
                                    isFlagged && "border-amber-500/50 text-amber-500"
                                )}
                            >
                                {index + 1}
                                {isFlagged && (
                                    <div className="absolute -top-1 -right-1">
                                        <Flag className="w-3 h-3 fill-amber-500 text-amber-500 drop-shadow-md" />
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
