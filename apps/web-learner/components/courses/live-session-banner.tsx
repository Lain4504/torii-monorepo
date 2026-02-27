'use client'

import { useEffect, useState } from 'react'
import type { LiveSessionResponseDTO } from '@workspace/schemas'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Video, Calendar, Clock, ArrowRight } from 'lucide-react'
import { toast } from '@workspace/ui/components/sonner'
import { liveSessionApi } from '@/lib/api/services/live-session-api'

const MEET_URL = (typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_MEET_URL || 'https://meet.torii.com') : 'https://meet.torii.com')

interface LiveSessionBannerProps {
    courseId: string
    className?: string
}

export function LiveSessionBanner({ courseId, className }: LiveSessionBannerProps) {
    const [sessions, setSessions] = useState<LiveSessionResponseDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [joiningId, setJoiningId] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        liveSessionApi.getSessions(courseId).then((data) => {
            if (!cancelled) setSessions(data ?? [])
        }).catch(() => {
            if (!cancelled) setSessions([])
        }).finally(() => {
            if (!cancelled) setLoading(false)
        })
        return () => {
            cancelled = true
        }
    }, [courseId])

    // Find the next upcoming or current live session
    const activeSession = sessions
        .filter(s => s.status === 'scheduled' || s.status === 'live')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]

    if (loading || !activeSession) return null

    const isLive = activeSession.status === 'live'
    const scheduledDate = new Date(activeSession.scheduledAt)

    const handleJoin = async () => {
        try {
            setJoiningId(activeSession.id)
            const joinData = await liveSessionApi.joinSession(activeSession.id)
            const url = `${MEET_URL}?access_token=${joinData.token}`
            window.open(url, '_blank', 'noopener,noreferrer')
            toast.success('Đang mở phòng học...')
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Không thể vào phòng học')
        } finally {
            setJoiningId(null)
        }
    }

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border p-6 transition-all",
            isLive
                ? "bg-primary/5 border-primary/20 shadow-sm"
                : "bg-muted/30 border-border",
            className
        )}>
            {/* Background Glow for Live status */}
            {isLive && (
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            )}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                        isLive ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground"
                    )}>
                        <Video className="h-6 w-6" />
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                isLive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                            )}>
                                {isLive ? (
                                    <>
                                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                                        Đang diễn ra
                                    </>
                                ) : "Sắp tới"}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground line-clamp-1">
                            {activeSession.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(scheduledDate, 'EEEE, dd/MM', { locale: vi })}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {format(scheduledDate, 'HH:mm')} ({activeSession.duration} phút)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    {isLive ? (
                        <Button
                            onClick={handleJoin}
                            disabled={!!joiningId}
                            className="w-full sm:w-auto font-bold gap-2 shadow-lg"
                        >
                            {joiningId ? <Spinner className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                            Vào phòng học ngay
                        </Button>
                    ) : (
                        <div className="hidden sm:block text-right">
                            <p className="text-xs text-muted-foreground">Phòng học sẽ mở khi giảng viên bắt đầu</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
