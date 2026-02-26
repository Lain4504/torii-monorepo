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
} from 'date-fns'
import { vi } from 'date-fns/locale'
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
    { label: 'Slot 1', startHour: 7, endHour: 9 },
    { label: 'Slot 2', startHour: 9, endHour: 11 },
    { label: 'Slot 3', startHour: 11, endHour: 13 },
    { label: 'Slot 4', startHour: 13, endHour: 15 },
    { label: 'Slot 5', startHour: 15, endHour: 17 },
    { label: 'Slot 6', startHour: 17, endHour: 19 },
    { label: 'Slot 7', startHour: 19, endHour: 21 },
]

type ScheduleSession = LiveSessionResponseDTO & {
    courseTitle: string
    courseThumbnail: string | null
}

function getSessionsForCell(sessions: ScheduleSession[], day: Date, slot: (typeof SLOTS)[0]) {
    return sessions.filter((s) => {
        const d = new Date(s.scheduledAt)
        return isSameDay(d, day) && d.getHours() >= slot.startHour && d.getHours() < slot.endHour
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
    const isLive = session.status === 'live'
    const isEnded = session.status === 'ended' || (session.status !== 'live' && isPast(new Date(session.scheduledAt)))

    return (
        <div
            className={cn(
                'rounded-md border p-2 text-left space-y-1 text-xs',
                isLive && 'border-destructive bg-destructive/10',
                !isLive && !isEnded && 'border-primary bg-primary/10',
                isEnded && 'border-border bg-muted opacity-60',
            )}
        >
            {isLive && (
                <Badge variant="destructive" className="text-[9px] font-bold uppercase tracking-widest mb-1 flex w-fit items-center gap-1">
                    <Radio className="w-2.5 h-2.5" /> Live
                </Badge>
            )}
            <p className="font-semibold leading-snug line-clamp-2 text-foreground">{session.title}</p>
            <p className="text-muted-foreground flex items-center gap-1 truncate">
                <BookOpen className="w-2.5 h-2.5 shrink-0" />
                {session.courseTitle}
            </p>
            <p className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 shrink-0" />
                {format(new Date(session.scheduledAt), 'HH:mm')} – {format(
                    new Date(new Date(session.scheduledAt).getTime() + session.duration * 60000),
                    'HH:mm'
                )}
            </p>
            {isLive && (
                <Button
                    size="sm"
                    variant="destructive"
                    className="w-full h-7 text-[10px] font-bold uppercase tracking-widest mt-1"
                    onClick={() => onJoin(session.id)}
                    disabled={!!joiningId}
                >
                    {joiningId === session.id ? <Spinner className="size-3" /> : 'Vào phòng'}
                </Button>
            )}
        </div>
    )
}

export default function SchedulePage() {
    const { data: allSessions = [], isLoading } = useMySchedule()
    const [weekOffset, setWeekOffset] = React.useState(0)
    const [joiningId, setJoiningId] = React.useState<string | null>(null)

    const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }) // Mon–Sun
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const weekEnd = addDays(weekStart, 6)

    const weekSessions = allSessions.filter((s) => {
        const d = new Date(s.scheduledAt)
        return d >= weekStart && d <= addDays(weekEnd, 1)
    })

    const liveSessions = allSessions.filter((s) => s.status === 'live')
    const upcomingSessions = allSessions.filter(
        (s) => s.status === 'scheduled' && isFuture(new Date(s.scheduledAt))
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 max-w-7xl">
            {/* Page Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Thời khóa biểu</h1>
                <p className="text-sm text-muted-foreground">
                    Lịch học trực tuyến từ tất cả các khóa học Live bạn đã đăng ký.
                </p>
            </div>

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng buổi học</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allSessions.length}</div>
                        <p className="text-xs text-muted-foreground">toàn bộ khóa học live</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang LIVE</CardTitle>
                        <Radio className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{liveSessions.length}</div>
                        <p className="text-xs text-muted-foreground">đang diễn ra ngay lúc này</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sắp tới</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingSessions.length}</div>
                        <p className="text-xs text-muted-foreground">buổi chưa diễn ra</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tuần này</CardTitle>
                        <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{weekSessions.length}</div>
                        <p className="text-xs text-muted-foreground">buổi trong tuần hiện tại</p>
                    </CardContent>
                </Card>
            </div>

            {/* Live now alert */}
            {liveSessions.length > 0 && (
                <Card className="border-destructive bg-destructive/5">
                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Radio className="h-6 w-6 text-destructive" />
                                <span className="absolute top-0 right-0 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                                </span>
                            </div>
                            <div>
                                <p className="font-semibold text-destructive text-sm">
                                    {liveSessions.length} buổi học đang diễn ra
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {liveSessions.map((s) => s.title).join(' • ')}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => liveSessions[0] && handleJoin(liveSessions[0].id)}
                            disabled={!!joiningId}
                        >
                            {joiningId ? <Spinner className="size-4" /> : 'Vào lớp ngay'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Week Navigation */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">
                                Tuần: {format(weekStart, 'dd/MM')} – {format(weekEnd, 'dd/MM/yyyy')}
                            </CardTitle>
                            <CardDescription>
                                Click vào buổi học đang LIVE để vào phòng ngay
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setWeekOffset((o) => o - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWeekOffset(0)}
                            >
                                Tuần này
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setWeekOffset((o) => o + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64 gap-3">
                            <Spinner className="size-6" />
                            <span className="text-sm text-muted-foreground">Đang tải thời khóa biểu...</span>
                        </div>
                    ) : allSessions.length === 0 ? (
                        <div className="p-8">
                            <Empty>
                                <EmptyMedia>
                                    <Calendar className="size-10 text-muted-foreground/30" />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Chưa có lịch học nào</EmptyTitle>
                                    <EmptyDescription>
                                        Bạn chưa đăng ký khóa học Live nào hoặc chưa có buổi học được lên lịch.
                                    </EmptyDescription>
                                    <Button asChild variant="outline" className="mt-4">
                                        <a href="/courses?type=live">Khám phá khóa học Live</a>
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24 text-center font-bold">Slot</TableHead>
                                        {days.map((day, i) => (
                                            <TableHead
                                                key={i}
                                                className={cn(
                                                    'text-center min-w-[130px]',
                                                    isToday(day) && 'bg-primary/5',
                                                )}
                                            >
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase">
                                                        {DAY_LABELS[i]}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'text-base font-bold h-8 w-8 flex items-center justify-center rounded-full',
                                                            isToday(day)
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'text-foreground',
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
                                    {SLOTS.map((slot) => (
                                        <TableRow key={slot.label}>
                                            {/* Slot label */}
                                            <TableCell className="text-center align-top">
                                                <div className="flex flex-col items-center gap-1 pt-1">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {slot.label}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {String(slot.startHour).padStart(2, '0')}:00
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {String(slot.endHour).padStart(2, '0')}:00
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Day cells */}
                                            {days.map((day, di) => {
                                                const cellSessions = getSessionsForCell(weekSessions, day, slot)
                                                return (
                                                    <TableCell
                                                        key={di}
                                                        className={cn(
                                                            'align-top p-2',
                                                            isToday(day) && 'bg-primary/[0.02]',
                                                        )}
                                                    >
                                                        {cellSessions.length === 0 ? (
                                                            <span className="flex items-center justify-center h-full text-muted-foreground/30 text-lg select-none">
                                                                —
                                                            </span>
                                                        ) : (
                                                            <div className="space-y-2">
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

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="font-semibold">Chú thích:</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" />
                    <span>Đang LIVE</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40" />
                    <span>Sắp diễn ra</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-muted border border-border" />
                    <span>Đã kết thúc</span>
                </div>
            </div>
        </div>
    )
}
