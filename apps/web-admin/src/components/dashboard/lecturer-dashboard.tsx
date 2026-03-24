import { useMemo, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty"
import {
    Video,
    BookOpen,
    Target,
    GraduationCap,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Clock,
} from "lucide-react"
import { StatsCard } from "./stats-card"
import { useAuth } from "@/hooks/use-auth"
import { useAcademyLiveClasses, type AcademyLiveClass } from "@/lib/api/services/academy-live-classes"
import {
    useJoinAcademyLiveSessionAsLecturer,
    academyLiveSessionsApi,
} from "@/lib/api/services/academy-live-sessions"
import { useQueries } from "@tanstack/react-query"
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    isToday,
    addWeeks,
    differenceInWeeks,
} from "date-fns"
import { vi } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { Calendar as CalendarUI } from "@workspace/ui/components/calendar"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "sonner"
import type { AcademyLiveScheduleSessionModel } from "@workspace/schemas"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"

const MEET_URL = import.meta.env.VITE_MEET_URL || "https://meet.torii.sbs"

type SessionWithClass = AcademyLiveScheduleSessionModel & { className?: string; classCode?: string }

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

function sessionToDate(s: SessionWithClass): Date {
    const raw = s.sessionDate
    const d = typeof raw === "string" ? new Date(raw) : raw
    return Number.isNaN(d.getTime()) ? new Date() : d
}

function sessionsForDayLecturer(sessions: SessionWithClass[], day: Date) {
    return sessions
        .filter((s) => isSameDay(sessionToDate(s), day))
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
}

function LecturerTimetableSessionCard({
    session,
    onRequestJoin,
    joining,
}: {
    session: SessionWithClass
    onRequestJoin: (s: SessionWithClass) => void
    joining: boolean
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onRequestJoin(session)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onRequestJoin(session)
                }
            }}
            className="flex cursor-pointer gap-3 rounded-xl border border-border/60 bg-card p-2.5 text-left shadow-sm transition-colors hover:bg-muted/25"
        >
            <div className="flex shrink-0 flex-col items-center gap-0.5 border-r border-border/60 py-0.5 pr-3">
                <span className="text-[11px] font-black tabular-nums leading-none">{session.startTime}</span>
                <div className="min-h-[10px] w-px flex-1 bg-border" />
                <span className="text-[11px] font-black tabular-nums leading-none">{session.endTime}</span>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="h-7 rounded-md px-2.5 text-[10px] font-black uppercase tracking-wide"
                        onClick={(e) => {
                            e.stopPropagation()
                            onRequestJoin(session)
                        }}
                        disabled={joining}
                    >
                        <Video className="mr-1 size-3" />
                        Vào phòng
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px]"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Link to={`/academy/live-classes/${session.classId}/schedule`}>Lớp</Link>
                    </Button>
                </div>
                <div>
                    <p className="text-[13px] font-bold leading-snug text-foreground">{session.className || session.classCode || "Buổi học"}</p>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <BookOpen className="size-3 shrink-0" />
                        <span className="truncate font-mono">{session.classCode || "—"}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LecturerDashboard() {
    const { user } = useAuth()
    const instructorId = user?.id as string | undefined

    const now = new Date()
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0]
    const toDate = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString().split("T")[0]

    const { data: classes = [], isLoading: classesLoading } = useAcademyLiveClasses({
        instructorId: instructorId as any,
    })

    const liveClassIds = useMemo(() => {
        return classes
            .filter((c) => ["ONGOING", "PUBLISHED"].includes(c.status))
            .map((c) => c.id)
    }, [classes])

    const classMap = useMemo(() => {
        const m: Record<string, AcademyLiveClass> = {}
        classes.forEach((c) => { m[c.id] = c })
        return m
    }, [classes])

    const sessionQueries = useQueries({
        queries: liveClassIds.slice(0, 15).map((classId) => ({
            queryKey: ["academy-live-sessions", classId, fromDate, toDate],
            queryFn: () => academyLiveSessionsApi.findAll({ classId, from: fromDate, to: toDate }),
            enabled: !!classId && !!instructorId,
        })),
    })

    const allSessions = useMemo(() => {
        const results: SessionWithClass[] = []
        sessionQueries.forEach((q, idx) => {
            if (q.data && Array.isArray(q.data) && liveClassIds[idx]) {
                const cls = classMap[liveClassIds[idx]]
                q.data.forEach((s: AcademyLiveScheduleSessionModel) => {
                    results.push({
                        ...s,
                        className: cls?.name,
                        classCode: cls?.code,
                    })
                })
            }
        })
        return results
    }, [sessionQueries, liveClassIds, classMap])

    const upcomingSessions = useMemo(() => {
        const today = now.toISOString().split("T")[0]
        return allSessions
            .filter((s) => {
                const d = typeof s.sessionDate === "string" ? s.sessionDate : (s.sessionDate as Date).toISOString().split("T")[0]
                return d >= today
            })
            .sort((a, b) => {
                const dA = typeof a.sessionDate === "string" ? a.sessionDate : (a.sessionDate as Date).toISOString().split("T")[0]
                const dB = typeof b.sessionDate === "string" ? b.sessionDate : (b.sessionDate as Date).toISOString().split("T")[0]
                if (dA !== dB) return dA.localeCompare(dB)
                return (a.startTime || "").localeCompare(b.startTime || "")
            })
    }, [allSessions, now])

    const timetableSessions = useMemo(() => {
        return [...allSessions].sort((a, b) => {
            const dA = typeof a.sessionDate === "string" ? a.sessionDate : (a.sessionDate as Date).toISOString().split("T")[0]
            const dB = typeof b.sessionDate === "string" ? b.sessionDate : (b.sessionDate as Date).toISOString().split("T")[0]
            if (dA !== dB) return dA.localeCompare(dB)
            return (a.startTime || "").localeCompare(b.startTime || "")
        })
    }, [allSessions])

    const [weekOffset, setWeekOffset] = useState(0)
    const [joinTarget, setJoinTarget] = useState<SessionWithClass | null>(null)
    const rowRefs = useRef<(HTMLDivElement | null)[]>([])

    const weekStart = useMemo(
        () => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }),
        [weekOffset]
    )
    const days = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart]
    )
    const weekEnd = addDays(weekStart, 6)

    const weekSessions = useMemo(() => {
        return timetableSessions.filter((s) => {
            const d = sessionToDate(s)
            return days.some((day) => isSameDay(d, day))
        })
    }, [timetableSessions, days])

    const scrollToDay = (index: number) => {
        rowRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }

    const sessionsLoading = sessionQueries.some((q) => q.isLoading)
    const joinMutation = useJoinAcademyLiveSessionAsLecturer()
    const ongoingCount = classes.filter((c) => c.status === "ONGOING").length
    const nextSession = upcomingSessions[0]

    const handleJoinSession = async (sessionId: string) => {
        try {
            const data = await joinMutation.mutateAsync(sessionId)
            if (data?.token) {
                window.open(`${MEET_URL}?access_token=${data.token}`, "_blank", "noopener,noreferrer")
                setJoinTarget(null)
            } else {
                toast.error("Không lấy được token để vào phòng học.")
            }
        } catch (err: any) {
            toast.error(err?.userMessage || "Không thể vào phòng học.")
        }
    }

    const formatDateLabel = (dateStr: string | Date) => {
        try {
            const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr
            return format(d, "EEE, dd/MM", { locale: vi })
        } catch {
            return String(dateStr)
        }
    }

    return (
        <div className="space-y-6">
            <AlertDialog open={!!joinTarget} onOpenChange={(open) => !open && setJoinTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mở phòng dạy trực tuyến?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>
                                    Bạn sắp vào phòng meeting cho lớp{" "}
                                    <span className="font-medium text-foreground">
                                        {joinTarget?.className || joinTarget?.classCode || "buổi học"}
                                    </span>
                                    {joinTarget?.classCode ? (
                                        <>
                                            {" "}
                                            (<span className="font-mono">{joinTarget.classCode}</span>)
                                        </>
                                    ) : null}
                                    .
                                </p>
                                {joinTarget && (
                                    <p className="tabular-nums">
                                        {formatDateLabel(joinTarget.sessionDate)} · {joinTarget.startTime}–{joinTarget.endTime}
                                    </p>
                                )}
                                <p>Tiếp tục để mở tab phòng học.</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button">Hủy</AlertDialogCancel>
                        <Button
                            type="button"
                            disabled={!joinTarget || joinMutation.isPending}
                            onClick={() => joinTarget && void handleJoinSession(joinTarget.id)}
                        >
                            {joinMutation.isPending ? "Đang mở…" : "Vào phòng"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {nextSession && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <Badge variant="secondary" className="mb-2">
                                    Buổi học sắp tới
                                </Badge>
                                <CardTitle>{nextSession.className || nextSession.classCode || "Buổi học"}</CardTitle>
                                <CardDescription>
                                    {formatDateLabel(nextSession.sessionDate)} • {nextSession.startTime}–{nextSession.endTime}
                                    {nextSession.classCode && ` • ${nextSession.classCode}`}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button onClick={() => setJoinTarget(nextSession)} disabled={joinMutation.isPending}>
                                    <Video className="size-4 mr-2" />
                                    Vào phòng học
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link to={`/academy/live-classes/${nextSession.classId}/schedule`}>
                                        Lịch & Điểm danh
                                        <ChevronRight className="size-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Lớp của tôi"
                    value={classesLoading ? "—" : classes.length}
                    sub={ongoingCount > 0 ? `${ongoingCount} lớp đang diễn ra` : "Tổng số lớp phụ trách"}
                    icon={BookOpen}
                    highlight
                />
                <StatsCard
                    title="Lớp đang diễn ra"
                    value={classesLoading ? "—" : ongoingCount}
                    sub="Lớp LIVE đang tuyển sinh hoặc đang học"
                    icon={GraduationCap}
                />
                <StatsCard
                    title="Buổi học sắp tới"
                    value={sessionsLoading ? "—" : upcomingSessions.length}
                    sub="Trong tháng hiện tại"
                    icon={Calendar}
                />
            </div>

            <Tabs defaultValue="timetable" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="timetable">Thời khóa biểu</TabsTrigger>
                    <TabsTrigger value="quick">Thao tác nhanh</TabsTrigger>
                </TabsList>
                <TabsContent value="timetable" className="space-y-4">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <CardTitle>Thời khóa biểu</CardTitle>
                                <CardDescription>
                                    Lịch dạy theo tuần · Tuần {format(weekStart, "dd/MM/yyyy")} – {format(weekEnd, "dd/MM/yyyy")}
                                </CardDescription>
                            </div>
                            <div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-border/50 bg-muted/40 p-0.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => setWeekOffset((o) => o - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 rounded-lg px-2 text-xs font-bold">
                                            <Calendar className="h-3.5 w-3.5 text-primary" />
                                            <span className="tabular-nums">
                                                {format(weekStart, "dd/MM")} – {format(weekEnd, "dd/MM")}
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
                                                        startOfWeek(new Date(), { weekStartsOn: 1 })
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
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-lg px-2 text-[10px] font-bold uppercase tracking-wide"
                                    onClick={() => setWeekOffset(0)}
                                >
                                    Hiện tại
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => setWeekOffset((o) => o + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {sessionsLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="h-12 w-full rounded-xl" />
                                    ))}
                                </div>
                            ) : timetableSessions.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Calendar className="size-4" />
                                        </EmptyMedia>
                                        <EmptyTitle>Chưa có lịch dạy</EmptyTitle>
                                        <EmptyDescription>Chưa có buổi học nào trong khoảng thời gian này.</EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <Button variant="outline" asChild>
                                            <Link to="/academy/live-classes">Xem Lớp của tôi</Link>
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-[11px] font-semibold text-muted-foreground">
                                        <Clock className="mr-1 inline size-3 align-text-bottom" />
                                        Chọn ngày để cuộn tới · chấm xanh = có buổi dạy
                                    </p>
                                    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-thin">
                                        {days.map((day, i) => {
                                            const has = sessionsForDayLecturer(weekSessions, day).length > 0
                                            const todayDay = isToday(day)
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => scrollToDay(i)}
                                                    className={cn(
                                                        "flex min-w-[48px] flex-col items-center rounded-xl border px-2 py-1.5 transition-colors",
                                                        todayDay
                                                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                            : "border-border/60 bg-card font-medium shadow-sm hover:bg-muted/50"
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "text-[9px] font-bold",
                                                            todayDay ? "text-primary-foreground/90" : "text-muted-foreground"
                                                        )}
                                                    >
                                                        {DAY_LABELS[i]}
                                                    </span>
                                                    <span className="text-sm font-black tabular-nums">{format(day, "dd")}</span>
                                                    {has && (
                                                        <span
                                                            className={cn(
                                                                "mt-0.5 h-1.5 w-1.5 rounded-full",
                                                                todayDay ? "bg-primary-foreground" : "bg-blue-500"
                                                            )}
                                                        />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-muted/20 dark:bg-muted/10">
                                        {days.map((day, i) => {
                                            const daySessions = sessionsForDayLecturer(weekSessions, day)
                                            const todayDay = isToday(day)
                                            return (
                                                <div
                                                    key={i}
                                                    ref={(el) => {
                                                        rowRefs.current[i] = el
                                                    }}
                                                    className={cn(
                                                        "flex gap-3 p-3 sm:gap-4 sm:p-4",
                                                        todayDay && "bg-primary/[0.04]"
                                                    )}
                                                >
                                                    <div className="w-14 shrink-0 pt-0.5 text-center sm:w-16">
                                                        <div className="text-xs font-black tabular-nums text-foreground">
                                                            {format(day, "dd/MM")}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-muted-foreground">{DAY_LABELS[i]}</div>
                                                    </div>
                                                    <div className="min-w-0 flex-1 space-y-2">
                                                        {daySessions.length === 0 ? (
                                                            <div className="flex min-h-[52px] items-center rounded-lg border border-dashed border-border/50 bg-card px-3 text-[11px] text-muted-foreground/60">
                                                                Không có buổi dạy
                                                            </div>
                                                        ) : (
                                                            daySessions.map((s) => (
                                                                <LecturerTimetableSessionCard
                                                                    key={s.id}
                                                                    session={s}
                                                                    onRequestJoin={setJoinTarget}
                                                                    joining={joinMutation.isPending}
                                                                />
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl border border-border/40 bg-muted/30 py-2.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-blue-500" /> Có lịch
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-muted-foreground/30" /> Trống
                                        </span>
                                    </div>

                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link to="/academy/live-classes">Quản lý tất cả lớp</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="quick" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thao tác nhanh</CardTitle>
                            <CardDescription>Các tác vụ thường dùng</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" asChild>
                                <Link to="/academy/live-classes">
                                    <BookOpen className="size-4 shrink-0" />
                                    <span className="text-left">
                                        <span className="block font-medium">Lớp của tôi</span>
                                        <span className="block text-xs text-muted-foreground">Quản lý lớp, lịch, điểm danh, bài tập</span>
                                    </span>
                                    <ChevronRight className="size-4 ml-auto" />
                                </Link>
                            </Button>
                            {liveClassIds[0] && (
                                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" asChild>
                                    <Link to={`/academy/live-classes/${liveClassIds[0]}/schedule`}>
                                        <Calendar className="size-4 shrink-0" />
                                        <span className="text-left">
                                            <span className="block font-medium">Lịch & Điểm danh</span>
                                            <span className="block text-xs text-muted-foreground">Ghi nhận điểm danh buổi LIVE</span>
                                        </span>
                                        <ChevronRight className="size-4 ml-auto" />
                                    </Link>
                                </Button>
                            )}
                            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" asChild>
                                <Link to="/academy/live-classes">
                                    <Target className="size-4 shrink-0" />
                                    <span className="text-left">
                                        <span className="block font-medium">Bài tập cần chấm</span>
                                        <span className="block text-xs text-muted-foreground">Vào từng lớp để chấm bài</span>
                                    </span>
                                    <ChevronRight className="size-4 ml-auto" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
