import { useState } from "react"
import { useParams } from "react-router-dom"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import { useAcademyEnrollments } from "@/lib/api/services/academy-enrollments"
import { useAcademyLiveSessions } from "@/lib/api/services/academy-live-sessions"
import { useAcademyClassAttendances, useCreateAcademyClassAttendance } from "@/lib/api/services/academy-class-attendances"
import { useAcademyLiveSchedules } from "@/lib/api/services/academy-live-schedules"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Bookmark, ChevronRight, Settings2, CalendarSync, Video, Plus } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@workspace/ui/lib/utils"
import { ClassScheduleSheet } from "@/components/academy/class-schedule-sheet"
import { ClassRescheduleRequestSheet } from "@/components/academy/class-reschedule-request-sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { useAuth } from "@/hooks/use-auth"
import { UserRole, isStaffBranchRole } from "@workspace/schemas"
import { useAcademyLiveScheduleRequests, useApproveAcademyLiveScheduleRequest, useRejectAcademyLiveScheduleRequest } from "@/lib/api/services/academy-live-schedule-requests"
import { toast } from "sonner"

import type { AcademyEnrollment } from "@/lib/api/services/academy-enrollments"
import type { AcademyLiveScheduleSessionModel } from "@workspace/schemas"
import type { AcademyClass } from "@/lib/api/services/academy-classes"
import type { AcademyLiveScheduleRequest } from "@/lib/api/services/academy-live-schedule-requests"

const WEEKDAY_MAP: Record<number, string> = {
    0: "Chủ Nhật",
    1: "Thứ Hai",
    2: "Thứ Ba",
    3: "Thứ Tư",
    4: "Thứ Năm",
    5: "Thứ Sáu",
    6: "Thứ Bảy",
}

interface ClassAttendanceTabProps {
    classId?: string
    academyClass?: AcademyClass
}

export function ClassAttendanceTab({ classId: propClassId, academyClass: propAcademyClass }: ClassAttendanceTabProps) {
    const params = useParams()
    const classId = propClassId || params.classId || ""
    
    // Dynamic date range for sessions (past 6 months to future 1 year)
    const now = new Date()
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split("T")[0]
    const toDate = new Date(now.getFullYear(), now.getMonth() + 12, 1).toISOString().split("T")[0]

    const { user } = useAuth()
    const isLecturer = user?.role === UserRole.LECTURER
    const isStaffOrAdmin = user?.role === UserRole.ADMIN || isStaffBranchRole(user?.role)

    const { data: fetchedClass } = useAcademyClass(propAcademyClass ? undefined : classId)
    const academyClass = propAcademyClass || fetchedClass

    const { data: enrollmentsData = [] } = useAcademyEnrollments({ classId, page: 1, limit: 100 })
    const { data: sessions = [] } = useAcademyLiveSessions({ 
        classId, 
        from: fromDate,
        to: toDate
    })
    const { data: attendanceData } = useAcademyClassAttendances({
        page: 1,
        limit: 100,
        classId: classId || undefined,
    })
    const { data: schedules = [] } = useAcademyLiveSchedules({ classId })
    const { data: allRequests = [] } = useAcademyLiveScheduleRequests({})
    const requests = allRequests.filter(r => r.session?.classId === classId || (r as any).classId === classId)
    
    const enrollments = enrollmentsData as AcademyEnrollment[]
    const attendances = attendanceData?.items || []
    const createAttendanceMutation = useCreateAcademyClassAttendance()
    const approveRequestMutation = useApproveAcademyLiveScheduleRequest()
    const rejectRequestMutation = useRejectAcademyLiveScheduleRequest()

    const [selectedSessionId, setSelectedSessionId] = useState<string>("")
    const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false)
    const [rescheduleSheetOpen, setRescheduleSheetOpen] = useState(false)
    const [selectedSessionForReschedule, setSelectedSessionForReschedule] = useState<AcademyLiveScheduleSessionModel | null>(null)

    const activeEnrollments = enrollments.filter((en) => en.status === "ACTIVE")
    const hasSchedules = schedules && schedules.length > 0

    const formatDateLabel = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "EEEE, dd/MM/yyyy", { locale: vi })
        } catch (e) {
            return dateStr
        }
    }

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case "PRESENT": return <CheckCircle2 className="h-5 w-5 text-emerald-500 shadow-sm" />
            case "ABSENT": return <XCircle className="h-5 w-5 text-destructive shadow-sm" />
            case "LATE": return <Clock className="h-5 w-5 text-amber-500 shadow-sm" />
            case "EXCUSED": return <Bookmark className="h-5 w-5 text-blue-500 shadow-sm" />
            default: return <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/30" />
        }
    }

    const handleStatusChange = (userId: string, sessionId: string, status: string) => {
        createAttendanceMutation.mutate({
            sessionId,
            userId,
            status: status as any
        }, {
            onError: (error: any) => toast.error(error.userMessage || "Lỗi khi điểm danh")
        })
    }

    const handleApproveRequest = (id: string) => {
        approveRequestMutation.mutate({ id, input: { reviewNote: "Ghi chú duyệt tự động" } }, {
            onSuccess: () => toast.success("Đã phê duyệt yêu cầu"),
            onError: (error: any) => toast.error(error.userMessage || "Lỗi khi phê duyệt yêu cầu")
        })
    }

    const handleRejectRequest = (id: string) => {
        rejectRequestMutation.mutate({ id, input: { reviewNote: "Yêu cầu bị từ chối" } }, {
            onSuccess: () => toast.success("Đã từ chối yêu cầu"),
            onError: (error: any) => toast.error(error.userMessage || "Lỗi khi từ chối yêu cầu")
        })
    }

    const getRequestStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING": return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Chờ duyệt</Badge>
            case "APPROVED": return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Đã duyệt</Badge>
            case "REJECTED": return <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-destructive/20">Từ chối</Badge>
            case "CANCELLED": return <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">Đã hủy</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <ClassScheduleSheet 
                open={scheduleSheetOpen} 
                onOpenChange={setScheduleSheetOpen} 
                classId={classId} 
            />

            {selectedSessionForReschedule && (
                <ClassRescheduleRequestSheet
                    open={rescheduleSheetOpen}
                    onOpenChange={setRescheduleSheetOpen}
                    session={selectedSessionForReschedule}
                />
            )}

            <Tabs defaultValue="sessions" className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <TabsList className="mb-6 overflow-x-auto whitespace-nowrap">
                        <TabsTrigger value="sessions" className="gap-2">
                            <Calendar className="size-4" />
                            Buổi học & Điểm danh
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="gap-2">
                            <CalendarSync className="size-4" />
                            Yêu cầu dời lịch / Nghỉ
                        </TabsTrigger>
                        {isStaffOrAdmin && (
                            <TabsTrigger value="schedule" className="gap-2">
                                <Settings2 className="size-4" />
                                Thiết lập lịch học
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <div className="flex items-center gap-2">
                         <Badge variant="outline" className="font-mono text-[10px] px-2.5 py-0.5 bg-background border-primary/30 text-primary uppercase tracking-tighter shadow-sm">
                            {academyClass?.code}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1.5 px-2.5 py-0.5 font-bold bg-primary/10 text-primary border-primary/20 border">
                            <Video className="size-3" />
                            {academyClass?.mode}
                        </Badge>
                    </div>
                </div>

                <TabsContent value="sessions" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1 shadow-md overflow-hidden flex flex-col max-h-[750px] border-primary/5">
                            <CardHeader className="pb-3 border-b bg-muted/20 shrink-0 px-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-primary/10 rounded-xl shadow-inner border border-primary/20">
                                            <Calendar className="size-4 text-primary" />
                                        </div>
                                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                            Danh sách buổi học
                                        </CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary font-bold">{sessions.length} buổi</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-hidden">
                                <ScrollArea className="h-[650px]">
                                    <div className="divide-y divide-muted/50">
                                        {sessions.map((s: any) => (
                                            <div
                                                key={s.id}
                                                className={cn(
                                                    "w-full text-left p-4 hover:bg-primary/[0.02] transition-all flex items-center justify-between group relative border-l-4 border-transparent cursor-pointer",
                                                    selectedSessionId === s.id && "bg-primary/[0.04] border-primary"
                                                )}
                                                onClick={() => setSelectedSessionId(s.id)}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col gap-2">
                                                        <span className={cn(
                                                            "font-bold text-sm tracking-tight leading-none",
                                                            selectedSessionId === s.id ? "text-primary" : "text-foreground"
                                                        )}>
                                                            {formatDateLabel(s.sessionDate)}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black bg-muted/40 w-fit px-2.5 py-1 rounded-full border border-muted/30">
                                                            <Clock className="h-3 w-3 text-primary opacity-60" /> {s.startTime} - {s.endTime}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-2">
                                                    {(isLecturer || isStaffOrAdmin) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all text-primary hover:bg-primary/20 hover:scale-110 active:scale-95 rounded-full"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedSessionForReschedule(s)
                                                                setRescheduleSheetOpen(true)
                                                            }}
                                                            title="Yêu cầu dời lịch / Nghỉ"
                                                        >
                                                            <CalendarSync className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <ChevronRight className={cn(
                                                        "h-4 w-4 text-muted-foreground/20 transition-all group-hover:translate-x-1",
                                                        selectedSessionId === s.id && "text-primary opacity-100"
                                                    )} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 shadow-sm flex flex-col overflow-hidden leading-relaxed">
                            <CardHeader className="pb-3 border-b bg-muted/30 shrink-0 px-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                            <div className="p-1.5 bg-emerald-100 rounded-md">
                                                <CheckCircle2 className="size-4 text-emerald-600" />
                                            </div>
                                            Ghi nhận điểm danh
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium">
                                            {!selectedSessionId
                                                ? "Vui lòng chọn một buổi học từ danh sách bên trái để thực hiện ghi nhận."
                                                : `Phiên học đang ghi nhận cho ${activeEnrollments.length} học viên chính thức.`}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-hidden">
                                {!selectedSessionId ? (
                                    <div className="py-40 text-center text-muted-foreground flex flex-col items-center gap-6 bg-muted/5">
                                        <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center shadow-inner">
                                            <Calendar className="h-10 w-10 opacity-20" />
                                        </div>
                                        <div className="space-y-1 max-w-[280px]">
                                            <p className="font-bold text-foreground">Chưa chọn buổi học</p>
                                            <p className="text-xs italic leading-relaxed">Hãy chọn một ngày học từ danh sách để xem danh sách học viên và thực hiện điểm danh.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[650px]">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                                    <TableRow>
                                                        <TableHead className="pl-6 py-4 text-xs font-bold uppercase tracking-wider">Học viên</TableHead>
                                                        <TableHead className="w-[200px] py-4 text-xs font-bold uppercase tracking-wider">Ghi nhận trạng thái</TableHead>
                                                        <TableHead className="w-[80px] pr-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Kết quả</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {activeEnrollments.length ? (
                                                        activeEnrollments.map((en: any) => {
                                                            const attendance = attendances.find((a: any) => a.userId === en.userId && a.sessionId === selectedSessionId)
                                                            return (
                                                                <TableRow key={en.id} className="group hover:bg-muted/10 transition-colors border-b last:border-0">
                                                                    <TableCell className="pl-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden text-primary font-bold shadow-sm text-sm">
                                                                                {en.user?.displayName?.charAt(0) || en.user?.username?.charAt(0) || "H"}
                                                                            </div>
                                                                            <div className="flex flex-col min-w-0">
                                                                                <span className="font-bold text-sm text-foreground truncate">{en.user?.displayName || en.user?.username || "Học viên"}</span>
                                                                                <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1 rounded w-fit">ID: {en.userId.substring(0, 8)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="py-4">
                                                                        <Select
                                                                            value={attendance?.status || ""}
                                                                            onValueChange={(val) => handleStatusChange(en.userId, selectedSessionId, val)}
                                                                            disabled={createAttendanceMutation.isPending}
                                                                        >
                                                                            <SelectTrigger className={cn(
                                                                                "h-9 w-full shadow-sm hover:border-primary/50 transition-colors",
                                                                                !attendance?.status && "text-muted-foreground italic border-dashed bg-muted/20"
                                                                            )}>
                                                                                <SelectValue placeholder="Chưa điểm danh" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="PRESENT" className="text-emerald-600 focus:text-emerald-700 font-bold">Có mặt</SelectItem>
                                                                                <SelectItem value="ABSENT" className="text-destructive focus:text-destructive font-bold">Vắng mặt</SelectItem>
                                                                                <SelectItem value="LATE" className="text-amber-600 focus:text-amber-700 font-bold">Đi muộn</SelectItem>
                                                                                <SelectItem value="EXCUSED" className="text-blue-600 focus:text-blue-700 font-bold">Có phép</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </TableCell>
                                                                    <TableCell className="pr-6 py-4 text-center">
                                                                        <div className="flex justify-center scale-110 drop-shadow-sm">
                                                                            {getStatusIcon(attendance?.status)}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        })
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic bg-muted/5">
                                                                Lớp học hiện tại chưa có học viên nào hoạt động.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                            </div>
                                        </ScrollArea>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                <TabsContent value="requests" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="shadow-md border-primary/5 overflow-hidden">
                        <CardHeader className="bg-muted/20 border-b p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <CalendarSync className="size-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold">Danh sách yêu cầu dời lịch & nghỉ phép</CardTitle>
                                    <CardDescription>Theo dõi và xử lý các yêu cầu thay đổi lịch học từ giảng viên.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="pl-6">Buổi học gốc</TableHead>
                                        <TableHead>Loại yêu cầu</TableHead>
                                        <TableHead>Đề xuất thay đổi</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="pr-6 text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.length > 0 ? (
                                        requests.map((req: AcademyLiveScheduleRequest) => (
                                            <TableRow key={req.id} className="hover:bg-muted/5 transition-colors">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{req.session ? formatDateLabel(req.session.sessionDate) : "N/A"}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-black">{req.session?.startTime} - {req.session?.endTime}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={req.type === 'RESCHEDULE' ? 'default' : 'destructive'} className="text-[10px] font-bold">
                                                        {req.type === 'RESCHEDULE' ? 'Dời lịch' : 'Nghỉ phép'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {req.type === 'RESCHEDULE' ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-primary">{req.proposedDate ? format(new Date(req.proposedDate), "dd/MM/yyyy") : "N/A"}</span>
                                                            <span className="text-[10px] text-primary/70 font-black">{req.proposedStartTime} - {req.proposedEndTime}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm italic">Hủy buổi học</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getRequestStatusBadge(req.status)}
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    {isStaffOrAdmin && req.status === 'PENDING' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="outline" className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold" onClick={() => handleApproveRequest(req.id)}>Duyệt</Button>
                                                            <Button size="sm" variant="outline" className="h-8 text-destructive hover:bg-destructive/5 font-bold" onClick={() => handleRejectRequest(req.id)}>Từ chối</Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground italic">
                                                            {req.status === 'PENDING' ? 'Chờ xử lý' : 'Đã xử lý'}
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic bg-muted/5">
                                                Hiện tại chưa có yêu cầu nào được gửi.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="shadow-sm overflow-hidden">
                        <CardHeader className="border-b p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Calendar className="size-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">Thời khóa biểu định kỳ</CardTitle>
                                    <CardDescription className="text-xs">
                                        Lịch học lặp lại theo tuần (nguồn dữ liệu tạo buổi học).
                                    </CardDescription>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="gap-2" onClick={() => setScheduleSheetOpen(true)}>
                                <Settings2 className="size-4" />
                                Thiết lập lịch học
                            </Button>
                        </CardHeader>

                        <CardContent className="p-6">
                            {hasSchedules ? (
                                <div className="space-y-3">
                                    {[...schedules]
                                        .sort((a: any, b: any) => a.weekday - b.weekday)
                                        .map((s: any) => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between gap-4 border rounded-lg px-4 py-3 bg-muted/5"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="secondary" className="font-bold">
                                                        {WEEKDAY_MAP[s.weekday]}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                                    <Clock className="size-4" />
                                                    {s.startTime} - {s.endTime}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="py-14 text-center flex flex-col items-center gap-4">
                                    <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center">
                                        <Clock className="size-6 text-muted-foreground opacity-30" />
                                    </div>
                                    <div className="space-y-1 max-w-[520px]">
                                        <p className="font-bold">Chưa có lịch học định kỳ</p>
                                        <p className="text-sm text-muted-foreground">
                                            Thiết lập lịch tuần để hệ thống tự động sinh danh sách buổi học.
                                        </p>
                                    </div>
                                    <Button size="sm" className="mt-2 gap-2" onClick={() => setScheduleSheetOpen(true)}>
                                        <Plus className="size-4" />
                                        Bắt đầu thiết lập
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="text-sm text-muted-foreground leading-relaxed">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="size-4 mt-0.5 text-amber-600" />
                            <span>
                                Thay đổi tại đây sẽ ảnh hưởng đến chuỗi buổi học được sinh ra tự động.
                                Nếu chỉ cần điều chỉnh <strong>một buổi</strong>, hãy dùng “Dời lịch” ở danh sách buổi học.
                            </span>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
