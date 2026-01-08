'use client'

import { useState, useEffect } from 'react'
import { Progress } from "@workspace/ui/components/progress"
import { Clock } from "lucide-react"

interface ExamTimerProps {
    durationMinutes: number
    initialSeconds?: number // For resume - start from this time instead
    onTimeUp: () => void
    onTimeUpdate?: (seconds: number) => void // Callback to update parent with current time
}

export function ExamTimer({ durationMinutes, initialSeconds, onTimeUp, onTimeUpdate }: ExamTimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialSeconds ?? durationMinutes * 60)

    // Sync timeLeft with initialSeconds when it changes (e.g., when resuming)
    useEffect(() => {
        if (initialSeconds !== undefined && initialSeconds !== timeLeft) {
            setTimeLeft(initialSeconds)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSeconds]) // Only depend on initialSeconds, not timeLeft to avoid infinite loop

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp()
            return
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const newTime = prev - 1
                // Notify parent of time update (every second)
                if (onTimeUpdate) {
                    onTimeUpdate(newTime)
                }
                return newTime
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, onTimeUp, onTimeUpdate])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const progress = (timeLeft / (durationMinutes * 60)) * 100
    const isUrgent = timeLeft < 300 // Last 5 mins

    return (
        <div className="flex items-center gap-4 min-w-[200px]">
            <div className={`flex items-center gap-2 font-mono font-bold text-xl ${isUrgent ? "text-destructive animate-pulse" : "text-foreground"}`}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
            </div>
            <div className="flex-1 w-32 hidden sm:block">
                <Progress value={progress} className={`h-2 ${isUrgent ? "bg-destructive/20" : ""}`} />
            </div>
        </div>
    )
}
