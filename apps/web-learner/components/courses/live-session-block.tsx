'use client'

import { useEffect, useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Video } from 'lucide-react'
import { liveSessionApi } from '@/apis/services/live-session-api'
import type { LiveSessionResponseDTO } from '@workspace/schemas'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from '@workspace/ui/components/sonner'
import { cn } from '@workspace/ui/lib/utils'
import { Spinner } from '@workspace/ui/components/spinner'

const MEET_URL = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_MEET_URL || 'https://meet.torii.com') : 'https://meet.torii.com'

interface LiveSessionBlockProps {
    courseId: string
    /** Compact style for cards/sidebar */
    compact?: boolean
    /** Max sessions to show */
    maxSessions?: number
    className?: string
}

export function LiveSessionBlock({ courseId, compact = false, maxSessions = 3, className }: LiveSessionBlockProps) {
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
        return () => { cancelled = true }
    }, [courseId])

    const upcomingOrLive = sessions
        .filter((s) => s.status === 'scheduled' || s.status === 'live')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, maxSessions)

    const handleJoin = async (sessionId: string) => {
        try {
            setJoiningId(sessionId)
            const joinData = await liveSessionApi.joinSession(sessionId)
            const url = `${MEET_URL}?access_token=${joinData.token}`
            window.open(url, '_blank', 'noopener,noreferrer')
            toast.success('Đang mở phòng học...')
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Không thể vào phòng học')
        } finally {
            setJoiningId(null)
        }
    }

    if (loading) {
        return (
            <div className={cn('flex items-center justify-center py-4 text-muted-foreground', className)}>
                <Spinner className="w-5 h-5 animate-spin" />
            </div>
        )
    }

    if (upcomingOrLive.length === 0) {
        return null
    }

    return (
        <div className={cn('space-y-2', className)}>
            <p className={cn(
                'font-bold text-foreground flex items-center gap-2',
                compact ? 'text-xs uppercase tracking-widest text-muted-foreground' : 'text-sm'
            )}>
                <Video className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                {compact ? 'Lịch live' : 'Buổi học trực tuyến'}
            </p>
            <ul className={cn('space-y-1.5', compact && 'space-y-1')}>
                {upcomingOrLive.map((session) => {
                    const isLive = session.status === 'live'
                    return (
                        <li
                            key={session.id}
                            className={cn(
                                'flex items-center justify-between gap-2 rounded-lg border border-border bg-card/50 p-2.5',
                                compact && 'p-2'
                            )}
                        >
                            <div className="min-w-0 flex-1">
                                <p className={cn('font-medium text-foreground truncate', compact && 'text-xs')}>
                                    {session.title}
                                </p>
                                <p className={cn('text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
                                    {format(new Date(session.scheduledAt), 'EEE, dd/MM • HH:mm', { locale: vi })} · {session.duration} phút
                                </p>
                            </div>
                            {isLive && (
                                <Button
                                    size="sm"
                                    className={cn(
                                        'shrink-0 rounded-lg font-bold gap-1.5',
                                        compact ? 'h-7 text-[10px] px-2' : 'h-8 text-xs px-3'
                                    )}
                                    onClick={() => handleJoin(session.id)}
                                    disabled={!!joiningId}
                                >
                                    {joiningId === session.id ? (
                                        <Spinner className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Video className="w-3.5 h-3.5" />
                                    )}
                                    Vào phòng
                                </Button>
                            )}
                            {!isLive && session.status === 'scheduled' && (
                                <span className={cn('shrink-0 text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
                                    Sắp diễn ra
                                </span>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
