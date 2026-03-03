'use client'

import * as React from 'react'
import { useMySchedule, liveSessionApi } from '@/lib/api/services/live-session-api'
import { LiveSessionResponseDTO } from '@workspace/schemas'
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    isToday,
    addWeeks,
    isFuture,
    isPast,
    parseISO,
    differenceInWeeks,
} from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Calendar as CalendarUI } from '@workspace/ui/components/calendar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card'
import { Spinner } from '@workspace/ui/components/spinner'
import { Separator } from '@workspace/ui/components/separator'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty'
import { cn } from '@workspace/ui/lib/utils'
import { toast } from '@workspace/ui/components/sonner'
import {
    Video,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Radio,
    BookOpen,
    Clock,
} from 'lucide-react'

const MEET_URL =
    typeof process !== 'undefined'
        ? process.env.NEXT_PUBLIC_MEET_URL || 'https://meet.torii.com'
        : 'https://meet.torii.com'

// Slots = 2h blocks from 07:00 to 21:00 (7 slots)
const SLOTS = [
    { label: 'Sáng sớm', startHour: 0, endHour: 9 },
    { label: 'Slot 2', startHour: 9, endHour: 11 },
    { label: 'Slot 3', startHour: 11, endHour: 13 },
    { label: 'Slot 4', startHour: 13, endHour: 15 },
    { label: 'Slot 5', startHour: 15, endHour: 17 },
    { label: 'Slot 6', startHour: 17, endHour: 19 },
    { label: 'Tối muộn', startHour: 19, endHour: 24 },
]

type ScheduleSession = LiveSessionResponseDTO & {
    courseTitle: string
    courseThumbnail: string | null
}

function getSessionsForCell(sessions: ScheduleSession[], day: Date, slot: (typeof SLOTS)[0]) {
    return sessions.filter((s) => {
        const d = new Date(s.scheduledAt)
        // Use inclusive matching for boundaries and ensure proper day comparison
        const sameDay = isSameDay(d, day)
        const hour = d.getHours()
        return sameDay && hour >= slot.startHour && hour < slot.endHour
    })
}

function SessionPill({
    session,
    onJoin,
    joiningId,
}: {
    session: ScheduleSession
    onJoin: (id: string) => void
    joiningId: string | null
}) {
    const normalizedStatus = (session.status || '').toLowerCase()
    const isLive = normalizedStatus === 'live'
    const isEnded = normalizedStatus === 'ended' || (normalizedStatus !== 'live' && isPast(new Date(session.scheduledAt)))

    return (
        <div
            className={cn(
                'group relative rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex flex-col overflow-hidden',
                isLive
                    ? 'border-destructive/40 bg-gradient-to-br from-destructive/10 to-destructive/5 ring-1 ring-destructive/20 shadow-destructive/10'
                    : !isEnded
                        ? 'border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40'
                        : 'border-border/60 bg-muted/40 grayscale-[0.8] opacity-60'
            )}
        >
            {/* Top Indicator Line */}
            <div className={cn(
                "h-1 w-full shrink-0",
                isLive ? "bg-destructive animate-pulse" : !isEnded ? "bg-primary/40" : "bg-muted-foreground/20"
            )} />

            <div className="p-2 flex flex-col gap-1.5 h-full min-h-[90px]">
                <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-background/50 border border-border/50 shadow-sm text-[9px] font-bold text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" />
                        {format(new Date(session.scheduledAt), 'HH:mm')}
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive text-[9px] font-black text-destructive-foreground shadow-sm animate-pulse whitespace-nowrap">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                            </span>
                            LIVE
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h4 className={cn(
                        "text-[11px] font-bold leading-tight tracking-tight line-clamp-2 transition-colors",
                        isLive ? "text-destructive" : "text-foreground group-hover:text-primary"
                    )}>
                        {session.title}
                    </h4>
                </div>

                <div className="mt-auto space-y-1.5">
                    <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground/80 line-clamp-1">
                        <BookOpen className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{session.courseTitle}</span>
                    </div>

                    {isLive && (
                        <Button
                            size="sm"
                            variant="destructive"
                            className="w-full h-7 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-destructive/20 active:scale-95 transition-all rounded-lg"
                            onClick={() => onJoin(session.id)}
                            disabled={!!joiningId}
                        >
                            {joiningId === session.id ? <Spinner className="size-3" /> : 'Vào học'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function SchedulePage() {
    const { data: allSessions = [], isLoading } = useMySchedule()
    const [weekOffset, setWeekOffset] = React.useState(0)
    const [joiningId, setJoiningId] = React.useState<string | null>(null)

    const today = new Date()
    const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 }) // Mon–Sun
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const weekEnd = addDays(weekStart, 6)

    const weekSessions = allSessions.filter((s) => {
        const d = new Date(s.scheduledAt)
        return d >= weekStart && d < addDays(weekEnd, 1)
    })

    const liveSessions = allSessions.filter((s) => (s.status || '').toLowerCase() === 'live')
    const upcomingSessions = allSessions.filter(
        (s) => (s.status || '').toLowerCase() === 'scheduled' && isFuture(new Date(s.scheduledAt))
    )

    const handleJoin = async (sessionId: string) => {
        try {
            setJoiningId(sessionId)
            const joinData = await liveSessionApi.joinSession(sessionId)
            window.open(`${MEET_URL}?access_token=${joinData.token}`, '_blank', 'noopener,noreferrer')
            toast.success('Đang mở phòng học...')
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Không thể vào phòng học')
        } finally {
            setJoiningId(null)
        }
    }

    const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Thời khóa biểu</h1>
                    <p className="text-sm text-muted-foreground max-w-lg">
                        Theo dõi lịch học trực tuyến được cá nhân hóa cho các khóa học Live của bạn.
                    </p>
                </div>

                {/* Week Navigation - Compact & Interactive */}
                <div className="flex items-center bg-muted/50 p-1 rounded-xl glass-effect self-start md:self-auto border border-border/50 gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-background shrink-0"
                        onClick={() => setWeekOffset((o) => o - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs font-bold rounded-lg hover:bg-background flex items-center gap-2 min-w-[140px]"
                            >
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                <span>{format(weekStart, 'dd/MM')} – {format(weekEnd, 'dd/MM')}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-border/40 shadow-2xl" align="end">
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
                        className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-background shrink-0"
                        onClick={() => setWeekOffset(0)}
                    >
                        Hiện tại
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-background shrink-0"
                        onClick={() => setWeekOffset((o) => o + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stats - Compact version */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng buổi học', value: allSessions.length, icon: Calendar, color: 'text-primary' },
                    { label: 'Đang LIVE', value: liveSessions.length, icon: Radio, color: 'text-destructive', badge: 'Live' },
                    { label: 'Sắp tới', value: upcomingSessions.length, icon: Clock, color: 'text-blue-500' },
                    { label: 'Tuần này', value: weekSessions.length, icon: Video, color: 'text-green-500' },
                ].map((stat, idx) => (
                    <Card key={idx} className="overflow-hidden border-border/40 shadow-sm transition-all hover:shadow-md hover:border-border/80">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={cn("text-xl font-black", stat.color)}>{stat.value}</span>
                                    {stat.badge && (
                                        <span className="text-[8px] font-bold px-1 rounded bg-destructive/10 text-destructive animate-pulse">
                                            {stat.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={cn("p-2.5 rounded-xl bg-muted/50", stat.color)}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Schedule Container */}
            <Card className="border-border/40 overflow-hidden shadow-lg shadow-black/5 rounded-2xl">
                <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">Lịch học chi tiết</CardTitle>
                                <CardDescription className="text-xs">
                                    {format(weekStart, 'dd/MM')} – {format(weekEnd, 'dd/MM/yyyy')}
                                </CardDescription>
                            </div>
                        </div>

                        {/* Legend in header */}
                        <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive" /> <span>LIVE</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> <span>Sắp tới</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-muted-foreground/30" /> <span>Đã xong</span></div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-80 gap-4">
                            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <span className="text-sm font-medium text-muted-foreground animate-pulse">Cập nhật thời khóa biểu...</span>
                        </div>
                    ) : allSessions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <Calendar className="size-8 text-muted-foreground/20" />
                            </div>
                            <h3 className="text-lg font-bold">Chưa có lịch học nào</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                                Bạn chưa đăng ký khóa học Live nào hoặc chưa có buổi học được lên lịch.
                            </p>
                            <Button asChild variant="default" className="mt-6 rounded-full px-8">
                                <a href="/courses?type=live">Khám phá ngay</a>
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border">
                            <Table className="border-collapse table-fixed w-full min-w-[800px]">
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b border-border/50">
                                        <TableHead className="w-16 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 bg-muted/10">STT</TableHead>
                                        {days.map((day, i) => (
                                            <TableHead
                                                key={i}
                                                className={cn(
                                                    'text-center border-l border-border/30 px-0 h-16',
                                                    isToday(day) && 'bg-primary/[0.03]',
                                                )}
                                            >
                                                <div className="flex flex-col items-center gap-0.5 py-2">
                                                    <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-tighter">
                                                        {DAY_LABELS[i]}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'text-lg font-black h-9 w-9 flex items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110',
                                                            isToday(day)
                                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-4 ring-primary/10'
                                                                : 'text-foreground hover:bg-muted',
                                                        )}
                                                    >
                                                        {format(day, 'dd')}
                                                    </span>
                                                </div>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {SLOTS.map((slot, rowIndex) => (
                                        <TableRow key={slot.label} className="group/row hover:bg-muted/5 border-b border-border/30">
                                            {/* Slot label */}
                                            <TableCell className="text-center align-middle bg-muted/5 border-r border-border/30">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-[11px] font-black text-foreground/80">
                                                        #{rowIndex + 1}
                                                    </span>
                                                    <div className="text-[9px] font-bold text-muted-foreground/60 leading-none">
                                                        {String(slot.startHour).padStart(2, '0')}:00
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Day cells */}
                                            {days.map((day, di) => {
                                                const cellSessions = getSessionsForCell(weekSessions, day, slot)
                                                return (
                                                    <TableCell
                                                        key={di}
                                                        className={cn(
                                                            'align-top p-1 border-l border-border/20 min-h-[120px]',
                                                            isToday(day) && 'bg-primary/[0.03]',
                                                        )}
                                                    >
                                                        {cellSessions.length === 0 ? (
                                                            <div className="flex items-center justify-center h-full min-h-[100px]">
                                                                <span className="text-muted-foreground/[0.1] text-[10px] font-bold font-mono">
                                                                    —
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="h-full min-h-[100px] flex flex-col gap-1">
                                                                {cellSessions.map((s) => (
                                                                    <SessionPill
                                                                        key={s.id}
                                                                        session={s}
                                                                        onJoin={handleJoin}
                                                                        joiningId={joiningId}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Mobile Legend (only visible on small screens) */}
            <div className="lg:hidden flex flex-wrap items-center justify-center gap-5 text-[10px] font-bold uppercase text-muted-foreground/60 p-4 border border-border/30 rounded-2xl bg-muted/20">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> <span>Đang LIVE</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> <span>Sắp tới</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-muted-foreground/40" /> <span>Đã xong</span></div>
            </div>
        </div>
    )
}

