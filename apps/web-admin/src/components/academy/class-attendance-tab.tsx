import { useState } from "react"
import { useAcademyLiveSessions } from "@/lib/api/services/academy-live-sessions"
import { useAcademyEnrollments } from "@/lib/api/services/academy-enrollments"
import { useAcademyClassAttendances, useCreateAcademyClassAttendance } from "@/lib/api/services/academy-class-attendances"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { toast } from "sonner"
import { User, CheckCircle2, XCircle, Clock, AlertCircle, ChevronRight, Calendar, BookOpen, Video, Settings2, MapPin } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import type { AcademyClass } from "@/lib/api/services/academy-classes"
import { Button } from "@workspace/ui/components/button"
import { ClassScheduleSheet } from "./class-schedule-sheet"
import { useAcademyLiveSchedules } from "@/lib/api/services/academy-live-schedules"

interface ClassAttendanceTabProps {
    classId: string
    academyClass?: AcademyClass | null
}

const WEEKDAY_MAP: Record<number, string> = {
    1: "Thứ Hai",
    2: "Thứ Ba",
    3: "Thứ Tư",
    4: "Thứ Năm",
    5: "Thứ Sáu",
    6: "Thứ Bảy",
    0: "Chủ Nhật",
}

export function ClassAttendanceTab({ classId, academyClass }: ClassAttendanceTabProps) {
    const today = new Date()
    const from = today.toISOString().slice(0, 10)
    const to = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false)
    const { data: sessions = [], isLoading: isLoadingSessions } = useAcademyLiveSessions(
        { classId, from, to },
        { enabled: !!classId },
    )
    const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useAcademyEnrollments({ classId, page: 1, limit: 1000 })
    const { data: schedules = [] } = useAcademyLiveSchedules({ classId }, { enabled: !!classId })

    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

    const { data: attendancesData } = useAcademyClassAttendances({
        sessionId: selectedSessionId || undefined,
        page: 1,
        limit: 1000
    })

    const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData as any)?.items || []
    const activeEnrollments = enrollments.filter((e: any) => e.status === "ACTIVE")
    const attendances = attendancesData?.items || []

    const createAttendanceMutation = useCreateAcademyClassAttendance()

    const handleStatusChange = async (userId: string, sessionId: string, status: string) => {
        try {
            await createAttendanceMutation.mutateAsync({
                sessionId: sessionId,
                userId,
                status: status as any
            })
            toast.success("Đã ghi nhận điểm danh")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi ghi nhận điểm danh")
        }
    }

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case "PRESENT": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            case "ABSENT": return <XCircle className="h-4 w-4 text-destructive" />
            case "LATE": return <Clock className="h-4 w-4 text-amber-500" />
            case "EXCUSED": return <AlertCircle className="h-4 w-4 text-blue-500" />
            default: return null
        }
    }

    if (isLoadingSessions || isLoadingEnrollments) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải dữ liệu...</div>
    }

    if (!sessions.length) {
        return (
            <div className="space-y-6">
                {academyClass && (
                    <Card className="border-muted/50">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="size-4 text-muted-foreground" />
                                    <span className="font-medium">{academyClass.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span className="font-mono text-xs">{academyClass.code}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Video className="size-3" />
                                        {academyClass.mode === "LIVE" ? "LIVE" : "VOD"}
                                    </span>
                                </div>
                                {academyClass.liveClass?.term && (
                                    <span className="text-muted-foreground">
                                        Kỳ: {academyClass.liveClass.term}
                                        {academyClass.liveClass.batch && ` • Batch: ${academyClass.liveClass.batch}`}
                                    </span>
                                )}
                                <Badge variant="outline" className="ml-auto">
                                    {academyClass.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Calendar className="mx-auto h-12 w-12 opacity-10 mb-2" />
                        <p className="mb-6">Lớp học hiện chưa có lịch học cố định nào để điểm danh.</p>
                        <Button onClick={() => setScheduleSheetOpen(true)}>
                            <Settings2 className="mr-2 h-4 w-4" />
                            Thiết lập lịch học
                        </Button>
                    </CardContent>
                </Card>
                <ClassScheduleSheet 
                    open={scheduleSheetOpen} 
                    onOpenChange={setScheduleSheetOpen} 
                    classId={classId} 
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ClassScheduleSheet 
                open={scheduleSheetOpen} 
                onOpenChange={setScheduleSheetOpen} 
                classId={classId} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-3 border-muted/50">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <BookOpen className="size-4 text-muted-foreground" />
                                <span className="font-medium">{academyClass?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="font-mono text-xs">{academyClass?.code}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Video className="size-3" />
                                    {academyClass?.mode === "LIVE" ? "LIVE" : "VOD"}
                                </span>
                            </div>
                            {academyClass?.liveClass?.term && (
                                <span className="text-muted-foreground">
                                    Kỳ: {academyClass.liveClass.term}
                                    {academyClass.liveClass.batch && ` • Batch: ${academyClass.liveClass.batch}`}
                                </span>
                            )}
                            <Badge variant="outline" className="ml-auto">
                                {academyClass?.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 border-muted/50 bg-primary/5">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Calendar className="size-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-primary uppercase">Lịch học tuần</p>
                                <p className="text-sm font-medium">{schedules.length} buổi / tuần</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setScheduleSheetOpen(true)}>
                            Sửa
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {schedules.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {schedules.sort((a, b) => a.weekday - b.weekday).map((s) => (
                        <Badge key={s.id} variant="secondary" className="px-3 py-1.5 flex items-center gap-2 font-medium">
                            <span className="text-primary font-bold">{WEEKDAY_MAP[s.weekday]}</span>
                            <span className="text-muted-foreground">{s.startTime} - {s.endTime}</span>
                            {s.location && (
                                <>
                                    <span className="text-muted-foreground/30">•</span>
                                    <MapPin className="size-3 text-muted-foreground" />
                                    <span>{s.location}</span>
                                </>
                            )}
                        </Badge>
                    ))}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Chọn buổi học
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setScheduleSheetOpen(true)}>
                            <Settings2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                    <div className="divide-y">
                        {sessions.map((s: any) => (
                            <button
                                key={s.id}
                                className={cn(
                                    "w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group",
                                    selectedSessionId === s.id && "bg-primary/5 border-l-2 border-primary"
                                )}
                                onClick={() => setSelectedSessionId(s.id)}
                            >
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className={cn(
                                        "font-semibold text-sm",
                                        selectedSessionId === s.id ? "text-primary" : "text-foreground"
                                    )}>
                                        {formatDateLabel(s.sessionDate)}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {s.startTime} - {s.endTime}
                                    </span>
                                </div>
                                <ChevronRight className={cn(
                                    "h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform",
                                    selectedSessionId === s.id && "text-primary opacity-100"
                                )} />
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/30">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Chi tiết điểm danh
                            </CardTitle>
                            <CardDescription>
                                {!selectedSessionId
                                    ? "Chọn buổi học bên trái"
                                    : `Ghi nhận cho ${activeEnrollments.length} học viên`}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {!selectedSessionId ? (
                        <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Calendar className="h-6 w-6 opacity-40" />
                            </div>
                            <p className="text-sm italic">Hãy chọn buổi học để bắt đầu thực hiện điểm danh</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="pl-6">Học viên</TableHead>
                                        <TableHead className="w-[180px]">Ghi nhận trạng thái</TableHead>
                                        <TableHead className="w-[50px] pr-6"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeEnrollments.length ? (
                                        activeEnrollments.map((en: any) => {
                                            const attendance = attendances.find((a: any) => a.userId === en.userId && a.sessionId === selectedSessionId)
                                            return (
                                                <TableRow key={en.id} className="group hover:bg-muted/30">
                                                    <TableCell className="pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden">
                                                                {en.user?.avatarUrl ? (
                                                                    <img src={en.user.avatarUrl} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <User className="h-4 w-4 text-primary" />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="font-semibold text-sm truncate">{en.user?.displayName || "Học viên"}</span>
                                                                <span className="text-[10px] text-muted-foreground font-mono">ID: {en.userId.substring(0, 8)}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={attendance?.status || ""}
                                                            onValueChange={(val) => handleStatusChange(en.userId, selectedSessionId, val)}
                                                            disabled={createAttendanceMutation.isPending}
                                                        >
                                                            <SelectTrigger className={cn(
                                                                "h-9 w-full",
                                                                !attendance?.status && "text-muted-foreground italic border-dashed"
                                                            )}>
                                                                <SelectValue placeholder="Chưa điểm danh" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="PRESENT" className="text-emerald-600 focus:text-emerald-700">Có mặt</SelectItem>
                                                                <SelectItem value="ABSENT" className="text-destructive focus:text-destructive">Vắng mặt</SelectItem>
                                                                <SelectItem value="LATE" className="text-amber-600 focus:text-amber-700">Đi muộn</SelectItem>
                                                                <SelectItem value="EXCUSED" className="text-blue-600 focus:text-blue-700">Có phép</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="pr-6">
                                                        <div className="flex justify-center">
                                                            {getStatusIcon(attendance?.status)}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-16 text-muted-foreground italic">
                                                Lớp học hiện tại chưa có học viên nào hoạt động.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
            </div>
        </div>
    )
}

function formatDateLabel(d: string) {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return d
    return date.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit" })
}
