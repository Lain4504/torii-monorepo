'use client'

import * as React from 'react'
import {
    canJoinLiveSessionNow,
    getLiveSessionUiState,
    liveSessionApi,
    useMySchedule,
} from '@/lib/api/services/academy-live-session-api'
import { LiveSessionResponseDTO } from '@workspace/schemas'
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    isToday,
    addWeeks,
    isFuture,
    addMinutes,
    differenceInWeeks,
} from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Calendar as CalendarUI } from '@workspace/ui/components/calendar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Spinner } from '@workspace/ui/components/spinner'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty'
import { cn } from '@workspace/ui/lib/utils'
import { toast } from '@workspace/ui/components/sonner'
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'

const MEET_URL =
    typeof process !== 'undefined'
        ? process.env.NEXT_PUBLIC_MEET_URL || 'https://meet.torii.com'
        : 'https://meet.torii.com'

type ScheduleSession = LiveSessionResponseDTO & {
    courseTitle: string
    courseThumbnail: string | null
}

function sessionsForDay(sessions: ScheduleSession[], day: Date) {
    return sessions
        .filter((s) => isSameDay(new Date(s.scheduledAt), day))
        .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
}

function CompactSessionCard({
    session,
    slotIndex,
    onJoin,
    joiningId,
    now,
}: {
    session: ScheduleSession
    slotIndex: number
    onJoin: (id: string) => void
    joiningId: string | null
    now: Date
}) {
    const uiState = getLiveSessionUiState(session, now)
    const isLive = uiState === 'live'
    const canJoin = canJoinLiveSessionNow(session, now)
    const isEnded = uiState === 'ended'
    const start = new Date(session.scheduledAt)
    const end = addMinutes(start, session.duration ?? 90)

    return (
        <div
            className={cn(
                'flex gap-3 rounded-xl border p-2.5 text-left shadow-sm transition-colors',
                isLive
                    ? 'border-destructive/35 bg-destructive/[0.06]'
                    : isEnded
                        ? 'border-border/60 bg-white/90 opacity-80 dark:bg-zinc-900/90'
                        : 'border-border/60 bg-white hover:bg-zinc-50/90 dark:bg-zinc-900 dark:hover:bg-zinc-800/90'
            )}
        >
            <div className="flex shrink-0 gap-2">
                <div className="flex w-5 items-center justify-center">
                    <span className="origin-center -rotate-90 whitespace-nowrap text-[8px] font-black uppercase tracking-tight text-muted-foreground/80">
                        Slot {slotIndex}
                    </span>
                </div>
                <div className="flex flex-col items-center gap-0.5 border-l border-border/60 py-0.5 pl-2">
                    <span className="text-[11px] font-black tabular-nums leading-none">{format(start, 'HH:mm')}</span>
                    <div className="min-h-[10px] w-px flex-1 bg-border" />
                    <span className="text-[11px] font-black tabular-nums leading-none">{format(end, 'HH:mm')}</span>
                </div>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                    {isLive && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[9px] font-black">
                            LIVE
                        </Badge>
                    )}
                    {!isEnded && !isLive && isFuture(start) && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-bold">
                            Sắp tới
                        </Badge>
                    )}
                    {isEnded && (
                        <Badge variant="outline" className="h-5 px-1.5 text-[9px] text-muted-foreground">
                            Đã xong
                        </Badge>
                    )}
                    {canJoin && (
                        <Button
                            size="sm"
                            variant="default"
                            className="h-7 rounded-md px-2.5 text-[10px] font-black uppercase tracking-wide"
                            onClick={() => onJoin(session.id)}
                            disabled={!!joiningId}
                        >
                            {joiningId === session.id ? <Spinner className="size-3" /> : isLive ? 'Vào lớp' : 'Vào phòng'}
                        </Button>
                    )}
                </div>
                <div>
                    <p
                        className={cn(
                            'text-[13px] font-bold leading-snug',
                            isLive ? 'text-destructive' : 'text-emerald-700 dark:text-emerald-400'
                        )}
                    >
                        {session.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <BookOpen className="size-3 shrink-0" />
                        <span className="truncate">{session.courseTitle}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SchedulePage() {
    const { data: allSessions = [], isLoading } = useMySchedule()
    const [weekOffset, setWeekOffset] = React.useState(0)
    const [joiningId, setJoiningId] = React.useState<string | null>(null)
    const [now, setNow] = React.useState(() => new Date())
    const rowRefs = React.useRef<(HTMLDivElement | null)[]>([])

    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30 * 1000)
        return () => clearInterval(timer)
    }, [])

    const today = new Date()
    const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const weekEnd = addDays(weekStart, 6)

    const weekSessions = allSessions.filter((s) => {
        const d = new Date(s.scheduledAt)
        return d >= weekStart && d < addDays(weekEnd, 1)
    })

    const handleJoin = async (sessionId: string) => {
        try {
            setJoiningId(sessionId)
            const joinData = await liveSessionApi.joinSession(sessionId)
            window.open(`${MEET_URL}?access_token=${joinData.token}`, '_blank', 'noopener,noreferrer')
            toast.success('Đang mở phòng học...')
        } catch (err: unknown) {
            const msg =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined
            toast.error(msg || 'Không thể vào phòng học')
        } finally {
            setJoiningId(null)
        }
    }

    const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

    const scrollToDay = (index: number) => {
        rowRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    return (
        <div className="animate-in fade-in space-y-4 duration-500">
            <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-white p-4 shadow-sm dark:border-border/40 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Thời khóa biểu</h1>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        Tuần {format(weekStart, 'dd/MM/yyyy')} – {format(weekEnd, 'dd/MM/yyyy')}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-border/50 bg-zinc-100/80 p-0.5 dark:bg-zinc-900/80">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setWeekOffset((o) => o - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 rounded-lg px-2 text-xs font-bold"
                            >
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                <span className="tabular-nums">
                                    {format(weekStart, 'dd/MM')} – {format(weekEnd, 'dd/MM')}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto rounded-2xl border-border/40 p-0 shadow-2xl" align="end">
                            <CalendarUI
                                mode="single"
                                selected={weekStart}
                                onSelect={(date) => {
                                    if (date) {
                                        const offset = differenceInWeeks(
                                            startOfWeek(date, { weekStartsOn: 1 }),
                                            startOfWeek(today, { weekStartsOn: 1 })
                                        )
                                        setWeekOffset(offset)
                                    }
                                }}
                                initialFocus
                                locale={vi}
                                className="p-3"
                            />
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg px-2 text-[10px] font-bold uppercase tracking-wide"
                        onClick={() => setWeekOffset(0)}
                    >
                        Hiện tại
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setWeekOffset((o) => o + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-white shadow-sm dark:bg-zinc-950">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Đang tải lịch…</span>
                </div>
            ) : allSessions.length === 0 ? (
                <div className="rounded-2xl border border-border/50 bg-white p-10 text-center shadow-sm dark:bg-zinc-950">
                    <Empty>
                        <EmptyMedia>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                                <Calendar className="size-7 text-muted-foreground/40" />
                            </div>
                        </EmptyMedia>
                        <EmptyContent>
                            <EmptyTitle>Chưa có lịch học</EmptyTitle>
                            <EmptyDescription className="mx-auto max-w-sm">
                                Bạn chưa đăng ký khóa Live hoặc chưa có buổi được lên lịch.
                            </EmptyDescription>
                        </EmptyContent>
                    </Empty>
                    <Button asChild className="mt-6 rounded-full px-8" variant="default">
                        <Link href="/dashboard/available-courses?type=live">Khám phá khóa học</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-3 rounded-2xl border border-border/50 bg-white p-4 shadow-sm dark:bg-zinc-950 sm:p-5">
                    <p className="text-[11px] font-semibold text-muted-foreground">
                        <Clock className="mr-1 inline size-3 align-text-bottom" />
                        Chọn ngày để cuộn tới · chấm xanh = có buổi học
                    </p>
                    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-thin">
                        {days.map((day, i) => {
                            const has = sessionsForDay(weekSessions, day).length > 0
                            const todayDay = isToday(day)
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => scrollToDay(i)}
                                    className={cn(
                                        'flex min-w-[48px] flex-col items-center rounded-xl border px-2 py-1.5 transition-colors',
                                        todayDay
                                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                            : 'border-border/60 bg-zinc-50 font-medium shadow-sm hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'text-[9px] font-bold',
                                            todayDay ? 'text-primary-foreground/90' : 'text-muted-foreground'
                                        )}
                                    >
                                        {DAY_LABELS[i]}
                                    </span>
                                    <span className="text-sm font-black tabular-nums">{format(day, 'dd')}</span>
                                    {has && (
                                        <span
                                            className={cn(
                                                'mt-0.5 h-1.5 w-1.5 rounded-full',
                                                todayDay ? 'bg-primary-foreground' : 'bg-blue-500'
                                            )}
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    <div className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-zinc-50/90 shadow-inner dark:divide-border/40 dark:border-border/40 dark:bg-zinc-900/50">
                        {days.map((day, i) => {
                            const daySessions = sessionsForDay(weekSessions, day)
                            const todayDay = isToday(day)
                            return (
                                <div
                                    key={i}
                                    ref={(el) => {
                                        rowRefs.current[i] = el
                                    }}
                                    className={cn(
                                        'flex gap-3 p-3 sm:gap-4 sm:p-4',
                                        todayDay && 'bg-primary/[0.04]'
                                    )}
                                >
                                    <div className="w-14 shrink-0 pt-0.5 text-center sm:w-16">
                                        <div className="text-xs font-black tabular-nums text-foreground">
                                            {format(day, 'dd/MM')}
                                        </div>
                                        <div className="text-[10px] font-bold text-muted-foreground">{DAY_LABELS[i]}</div>
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        {daySessions.length === 0 ? (
                                            <div className="flex min-h-[52px] items-center rounded-lg border border-dashed border-border/50 bg-white/80 px-3 text-[11px] text-muted-foreground/60 dark:bg-zinc-950/80">
                                                Không có buổi học
                                            </div>
                                        ) : (
                                            daySessions.map((s, si) => (
                                                <CompactSessionCard
                                                    key={s.id}
                                                    session={s}
                                                    slotIndex={si + 1}
                                                    onJoin={handleJoin}
                                                    joiningId={joiningId}
                                                    now={now}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl border border-border/50 bg-zinc-50 py-2.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground dark:bg-zinc-900/80">
                        <span className="flex items-center gap-1.5">
                            <span className="size-2 animate-pulse rounded-full bg-destructive" /> LIVE
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-primary" /> Sắp tới
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-muted-foreground/40" /> Đã xong
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
