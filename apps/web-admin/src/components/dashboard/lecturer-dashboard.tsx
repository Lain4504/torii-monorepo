import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@workspace/ui/components/empty"
import {
    Video,
    BookOpen,
    Target,
    GraduationCap,
    Calendar,
    ChevronRight,
    ExternalLink,
} from "lucide-react"
import { StatsCard } from "./stats-card"
import { useAuth } from "@/hooks/use-auth"
import { useAcademyClasses, type AcademyClass } from "@/lib/api/services/academy-classes"
import {
    useJoinAcademyLiveSessionAsLecturer,
    academyLiveSessionsApi,
} from "@/lib/api/services/academy-live-sessions"
import { useQueries } from "@tanstack/react-query"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"
import type { AcademyLiveScheduleSessionModel } from "@workspace/schemas"

const MEET_URL = import.meta.env.VITE_MEET_URL || "https://meet.torii.sbs"

type SessionWithClass = AcademyLiveScheduleSessionModel & { className?: string; classCode?: string }

const WEEKDAY_MAP: Record<number, string> = {
    0: "CN", 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7",
}

export default function LecturerDashboard() {
    const { user } = useAuth()
    const instructorId = user?.id as string | undefined

    const now = new Date()
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0]
    const toDate = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString().split("T")[0]

    const { data: classes = [], isLoading: classesLoading } = useAcademyClasses({
        instructorId: instructorId as any,
    })

    const liveClassIds = useMemo(() => {
        return classes
            .filter((c) => c.mode === "LIVE" && ["ONGOING", "OPENING"].includes(c.status))
            .map((c) => c.id)
    }, [classes])

    const classMap = useMemo(() => {
        const m: Record<string, AcademyClass> = {}
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

    const sessionsLoading = sessionQueries.some((q) => q.isLoading)
    const joinMutation = useJoinAcademyLiveSessionAsLecturer()
    const ongoingCount = classes.filter((c) => c.status === "ONGOING").length
    const nextSession = upcomingSessions[0]

    const handleJoinSession = async (sessionId: string) => {
        try {
            const data = await joinMutation.mutateAsync(sessionId)
            if (data?.token) {
                window.open(`${MEET_URL}?access_token=${data.token}`, "_blank", "noopener,noreferrer")
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

    const formatTimetableDate = (dateStr: string | Date) => {
        try {
            const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr
            const day = d.getDay()
            return `${WEEKDAY_MAP[day]} ${format(d, "dd/MM", { locale: vi })}`
        } catch {
            return String(dateStr)
        }
    }

    return (
        <div className="space-y-6">
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
                                <Button onClick={() => handleJoinSession(nextSession.id)} disabled={joinMutation.isPending}>
                                    <Video className="size-4 mr-2" />
                                    Vào phòng học
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link to={`/academy/classes/${nextSession.classId}/schedule`}>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Thời khóa biểu tổng quan</CardTitle>
                            <CardDescription>
                                Tất cả lịch dạy các lớp bạn được phân công
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {sessionsLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
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
                                            <Link to="/academy/classes">Xem Lớp của tôi</Link>
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Thứ / Ngày</TableHead>
                                                <TableHead>Giờ</TableHead>
                                                <TableHead>Lớp</TableHead>
                                                <TableHead>Mã lớp</TableHead>
                                                <TableHead className="text-right">Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {timetableSessions.map((s) => (
                                                <TableRow key={s.id}>
                                                    <TableCell>{formatTimetableDate(s.sessionDate)}</TableCell>
                                                    <TableCell>{s.startTime}–{s.endTime}</TableCell>
                                                    <TableCell>{s.className || "—"}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{s.classCode || "—"}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleJoinSession(s.id)}
                                                                disabled={joinMutation.isPending}
                                                            >
                                                                <Video className="size-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link to={`/academy/classes/${s.classId}/schedule`}>
                                                                    <ChevronRight className="size-4" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {upcomingSessions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Buổi học sắp tới</CardTitle>
                                <CardDescription>Các buổi học trực tiếp trong tháng</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Ngày</TableHead>
                                                <TableHead>Giờ</TableHead>
                                                <TableHead>Lớp</TableHead>
                                                <TableHead className="text-right"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {upcomingSessions.slice(0, 5).map((s) => (
                                                <TableRow key={s.id}>
                                                    <TableCell>{formatDateLabel(s.sessionDate)}</TableCell>
                                                    <TableCell>{s.startTime}–{s.endTime}</TableCell>
                                                    <TableCell>{s.className || s.classCode}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link to={`/academy/classes/${s.classId}/schedule`}>
                                                                Chi tiết
                                                                <ExternalLink className="size-3 ml-1" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                                    <Link to="/academy/classes">Xem tất cả lớp</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                <TabsContent value="quick" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thao tác nhanh</CardTitle>
                            <CardDescription>Các tác vụ thường dùng</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" asChild>
                                <Link to="/academy/classes">
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
                                    <Link to={`/academy/classes/${liveClassIds[0]}/schedule`}>
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
                                <Link to="/academy/classes">
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
