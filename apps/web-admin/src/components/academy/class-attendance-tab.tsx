import { useState } from "react"
import { useAcademyLiveSessions } from "@/lib/api/services/academy-live-sessions"
import { useAcademyEnrollments } from "@/lib/api/services/academy-enrollments"
import { useAcademyClassAttendances, useCreateAcademyClassAttendance } from "@/lib/api/services/academy-class-attendances"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { toast } from "sonner"
import { User, CheckCircle2, XCircle, Clock, AlertCircle, ChevronRight, Calendar } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface ClassAttendanceTabProps {
    classId: string
}

export function ClassAttendanceTab({ classId }: ClassAttendanceTabProps) {
    const today = new Date()
    const from = today.toISOString().slice(0, 10)
    const to = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const { data: sessions = [], isLoading: isLoadingSessions } = useAcademyLiveSessions(
        { classId, from, to },
        { enabled: !!classId },
    )
    const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useAcademyEnrollments({ classId, page: 1, limit: 1000 })

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
            <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                    <Calendar className="mx-auto h-12 w-12 opacity-10 mb-2" />
                    <p>Lớp học hiện chưa có lịch học cố định nào để điểm danh.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/30">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Chọn buổi học
                    </CardTitle>
                    <CardDescription>Chọn một buổi (session) theo ngày</CardDescription>
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
    )
}

function formatDateLabel(d: string) {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return d
    return date.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit" })
}

function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: string, className?: string }) {
    const variants: any = {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background"
    }
    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)}>
            {children}
        </span>
    )
}
