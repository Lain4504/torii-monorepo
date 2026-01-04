'use client'

import { useState, useEffect } from 'react'
import { Progress } from "@workspace/ui/components/progress"
import { Clock } from "lucide-react"

interface ExamTimerProps {
    durationMinutes: number
    onTimeUp: () => void
}

export function ExamTimer({ durationMinutes, onTimeUp }: ExamTimerProps) {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp()
            return
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, onTimeUp])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const progress = (timeLeft / (durationMinutes * 60)) * 100
    const isUrgent = timeLeft < 300 // Last 5 mins

    return (
        <div className="flex items-center gap-4 min-w-[200px]">
            <div className={`flex items-center gap-2 font-mono font-bold text-xl ${isUrgent ? "text-red-600 animate-pulse" : "text-slate-900 dark:text-white"}`}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
            </div>
            <div className="flex-1 w-32 hidden sm:block">
                <Progress value={progress} className={`h-2 ${isUrgent ? "bg-red-100 dark:bg-red-900/30" : ""}`} />
            </div>
        </div>
    )
}
