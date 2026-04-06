import { useState, useMemo } from "react"
import { PageHeader } from "@/components/common/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  useAcademyLiveScheduleRequests,
  useApproveAcademyLiveScheduleRequest,
  useRejectAcademyLiveScheduleRequest
} from "@/lib/api/services/academy-live-schedule-requests"
import { useAcademyLiveClasses } from "@/lib/api/services/academy-live-classes"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarSync, CheckCircle2, XCircle, Clock, Search } from "lucide-react"
import { toast } from "sonner"
import type { AcademyLiveScheduleRequest } from "@/lib/api/services/academy-live-schedule-requests"
import { Input } from "@workspace/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  listPageSearchIconClass,
  listPageSearchInputClass,
  listPageSearchWrapClass,
  listPageToolbarRootClass
} from "@/lib/ui-shell"

export default function LiveRescheduleRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING")
  const [search, setSearch] = useState("")
  const [rejectReasonDialog, setRejectReasonDialog] = useState<{
    open: boolean
    reason: string
    requestId?: string
  }>({ open: false, reason: "" })

  const { data: allRequests = [], isLoading: isLoadingRequests } = useAcademyLiveScheduleRequests({
    status: statusFilter === "all" ? undefined : (statusFilter as any)
  })

  // To show class details, we fetch classes. Since requests only have liveClassId.
  const { data: classes = [], isLoading: isLoadingClasses } = useAcademyLiveClasses({})

  const approveRequestMutation = useApproveAcademyLiveScheduleRequest()
  const rejectRequestMutation = useRejectAcademyLiveScheduleRequest()

  const formatDateLabel = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEEE, dd/MM/yyyy", { locale: vi })
    } catch (e) {
      return dateStr
    }
  }

  const handleApproveRequest = (id: string) => {
    approveRequestMutation.mutate({ id, input: { reviewNote: "Phê duyệt từ trung tâm" } }, {
      onSuccess: () => toast.success("Đã phê duyệt yêu cầu"),
      onError: (error: any) => toast.error(error.userMessage || "Lỗi khi phê duyệt yêu cầu")
    })
  }

  const handleRejectRequest = (id: string) => {
    rejectRequestMutation.mutate({ id, input: { reviewNote: "Từ chối từ trung tâm" } }, {
      onSuccess: () => toast.success("Đã từ chối yêu cầu"),
      onError: (error: any) => toast.error(error.userMessage || "Lỗi khi từ chối yêu cầu")
    })
  }

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="warning">Chờ duyệt</Badge>
      case "APPROVED": return <Badge variant="success">Đã duyệt</Badge>
      case "REJECTED": return <Badge variant="destructive">Từ chối</Badge>
      case "CANCELLED": return <Badge variant="secondary">Đã hủy</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const classMap = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>()
    classes.forEach(c => {
      map.set(c.id, { code: c.code, name: c.name })
    })
    return map
  }, [classes])

  const filteredRequests = useMemo(() => {
    if (!search) return allRequests
    const s = search.toLowerCase()
    return allRequests.filter(req => {
      const classInfo = classMap.get(req.liveClassId || req.session?.liveClassId || "")
      return (
        classInfo?.code.toLowerCase().includes(s) ||
        classInfo?.name.toLowerCase().includes(s) ||
        req.requester?.displayName.toLowerCase().includes(s)
      )
    })
  }, [allRequests, search, classMap])

  const isLoading = isLoadingRequests || isLoadingClasses

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Phê duyệt dời lịch học"
        subtitle="Quản lý và phê duyệt các yêu cầu dời lịch học hoặc nghỉ phép từ giảng viên trên toàn hệ thống."
      />

      <div className="space-y-4">
        <div className={listPageToolbarRootClass}>
          <div className={listPageSearchWrapClass}>
            <Search className={listPageSearchIconClass} />
            <Input
              placeholder="Tìm theo mã lớp, tên lớp hoặc tên giảng viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={listPageSearchInputClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('PENDING')}
              className="h-10 px-4"
            >
              Đang chờ duyệt
            </Button>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="h-10 px-4"
            >
              Tất cả lịch sử
            </Button>
          </div>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 py-4">Lớp học</TableHead>
                <TableHead>Buổi học gốc</TableHead>
                <TableHead>Loại yêu cầu</TableHead>
                <TableHead>Đề xuất thay đổi</TableHead>
                <TableHead>Giảng viên & Lý do</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="pr-6 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-32 mt-2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16 mt-2" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16 mt-2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-40 mt-2" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground italic">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CalendarSync className="size-8 opacity-20" />
                      <span>Không tìm thấy yêu cầu nào phù hợp.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req: AcademyLiveScheduleRequest) => {
                  const classId = req.liveClassId || req.session?.liveClassId || ""
                  const classInfo = classMap.get(classId)
                  return (
                    <TableRow key={req.id} className="hover:bg-muted/5 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-primary group-hover:underline cursor-pointer" onClick={() => window.open(`/academy/live-classes/${classId}/detail?tab=schedule`, '_blank')}>
                            {classInfo?.code || "N/A"}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[180px]" title={classInfo?.name}>
                            {classInfo?.name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm tracking-tight">{req.session ? formatDateLabel(req.session.sessionDate) : "N/A"}</span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-black bg-muted/50 w-fit px-1.5 py-0.5 rounded mt-1">
                            <Clock className="size-3" /> {req.session?.startTime} - {req.session?.endTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={req.type === 'RESCHEDULE' ? 'default' : 'destructive'} className="text-[9px] font-black uppercase tracking-tighter">
                          {req.type === 'RESCHEDULE' ? 'Dời lịch' : 'Nghỉ phép'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {req.type === 'RESCHEDULE' ? (
                          <div className="flex flex-col border-l-2 border-emerald-500/40 pl-2 py-0.5">
                            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-500">{req.proposedDate ? format(parseISO(req.proposedDate), "dd/MM/yyyy") : "N/A"}</span>
                            <span className="text-[10px] text-emerald-600/70 font-black">{req.proposedStartTime} - {req.proposedEndTime}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic opacity-60">Hủy buổi học</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-[220px]">
                          <span className="text-xs font-bold text-foreground/80">{req.requester?.displayName || "Giảng viên"}</span>
                          <p className="text-[10px] text-muted-foreground italic line-clamp-2 mt-1 leading-relaxed" title={req.reason || ""}>
                            “{req.reason || "Không có lý do chi tiết"}”
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRequestStatusBadge(req.status)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 border-emerald-500/40 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium"
                              onClick={() => handleApproveRequest(req.id)}
                              disabled={approveRequestMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Duyệt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/5 font-medium"
                              onClick={() => handleRejectRequest(req.id)}
                              disabled={rejectRequestMutation.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                              Từ chối
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-muted-foreground font-medium italic uppercase tracking-wider opacity-60">Đã xử lý</span>
                            {req.reviewedBy && (
                              <Badge variant="outline" className="text-[9px] px-2 py-0.5 font-bold bg-muted/30">
                                bởi {req.reviewer?.displayName || "Admin"}
                              </Badge>
                            )}
                            {req.status === 'REJECTED' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() =>
                                  setRejectReasonDialog({
                                    open: true,
                                    reason: req.reviewNote || "Không có lý do cụ thể.",
                                    requestId: req.id,
                                  })
                                }
                              >
                                Xem lý do
                              </Button>
                            ) : null}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={rejectReasonDialog.open}
        onOpenChange={(open) =>
          setRejectReasonDialog((prev) =>
            open ? prev : { open: false, reason: "", requestId: undefined },
          )
        }
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Lý do từ chối</DialogTitle>
            <DialogDescription>
              Yêu cầu của bạn đã bị từ chối. Vui lòng xem ghi chú chi tiết bên dưới.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
            {rejectReasonDialog.reason}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectReasonDialog({ open: false, reason: "" })}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
