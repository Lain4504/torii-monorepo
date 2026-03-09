import { useLocation, useNavigate, useParams, Link } from "react-router-dom"
import {
   useAcademyClass,
   useSubmitClassForApproval,
   useApproveClass,
   useRejectClass,
   usePublishClass,
   useStartClass,
   useCompleteClass,
   useCancelClass,
} from "@/lib/api/services/academy-classes"
import { useAcademyLiveSchedules, usePreviewAcademyLiveScheduleConflict } from "@/lib/api/services/academy-live-schedules"
import {
   useAcademyLiveScheduleRequests,
   useApproveAcademyLiveScheduleRequest,
   useCancelAcademyLiveScheduleRequest,
   useCreateAcademyLiveScheduleRequest,
   useRejectAcademyLiveScheduleRequest,
} from "@/lib/api/services/academy-live-schedule-requests"
import { useJoinAcademyLiveSessionAsLecturer } from "@/lib/api/services/academy-live-sessions"
import { roomsApi } from "@/lib/api/services/rooms"
import { usePermissions } from "@/hooks/use-permissions"
import { useMutation, useQuery } from "@tanstack/react-query"
import { cn } from "@workspace/ui/lib/utils"
import {
   useAcademyClassAssessments,
   useAcademyClassAssessmentAttempts,
   useAcademyWrongQuestionAnalytics,
} from "@/lib/api/services/academy-class-assessments"
import { useAcademyEnrollments } from "@/lib/api/services/academy-enrollments"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import { useAcademyAssignmentSubmissions } from "@/lib/api/services/academy-assignment-submissions"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@workspace/ui/components/select"
import { ClassAttendanceTab } from "@/components/academy/class-attendance-tab"
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow
} from "@workspace/ui/components/table"
import { useAppSelector } from "@/hooks/hooks.ts"
import { selectAuthUser } from "@/store/slices/auth-slice.ts"
import { LearnerList } from "@/components/academy/learner-list"
import { DuplicateClassDialog } from "@/components/academy/duplicate-class-dialog"
import {
   Edit,
   Plus,
   Calendar,
   Info,
   ArrowLeft,
   Clock,
   MapPin,
   Link as LinkIcon,
   User,
   AlertCircle,
   CheckCircle2,
   Send,
   Copy
} from "lucide-react"

export default function ClassDetailPage() {
   const MEET_URL = import.meta.env.VITE_MEET_URL || "https://meet.torii.sbs"
   const { id } = useParams<{ id: string }>()
   const navigate = useNavigate()
   const location = useLocation()
   const { data: cls, isLoading: isLoadingClass } = useAcademyClass(id!)
   const isLive = cls?.mode === "LIVE"
   const { can } = usePermissions()
   const canManageLiveSession = can("academy.delivery.write")
   const canApproveLiveRequest = can("academy.delivery.approve")
   const canDeliveryWrite = can("academy.delivery.write")
   const canDeliveryApprove = can("academy.delivery.approve")
   const authUser = useAppSelector(selectAuthUser)
   const { data: profile } = useAcademyCourseProfile(cls?.courseProfileId)
   const { data: edition } = useAcademyCourseEdition(cls?.courseEditionId)
   const liveClassId = cls?.liveClass?.id
   const { data: schedules = [], isLoading: isLoadingSchedules } = useAcademyLiveSchedules(
      liveClassId ? { liveClassId } : {},
      { enabled: !!liveClassId },
   )
   const { data: assessments = [], isLoading: isLoadingAssessments } = useAcademyClassAssessments({ classId: id })
   const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useAcademyEnrollments({ classId: id, page: 1, limit: 100 })
   const [selectedQuizAssessmentId, setSelectedQuizAssessmentId] = useState<string>("")
   const quizAssessments = useMemo(
      () => assessments.filter((assessment) => assessment.kind === "QUIZ"),
      [assessments],
   )
   const selectedQuizAssessment = useMemo(
      () => quizAssessments.find((assessment) => assessment.id === selectedQuizAssessmentId),
      [quizAssessments, selectedQuizAssessmentId],
   )
   const { data: attempts = [], isLoading: isLoadingAttempts } = useAcademyClassAssessmentAttempts(
      selectedQuizAssessmentId || undefined,
      { latestOnly: true },
   )
   const { data: wrongQuestionAnalytics, isLoading: isLoadingWrongQuestionAnalytics } =
      useAcademyWrongQuestionAnalytics(
         selectedQuizAssessmentId || undefined,
         { latestOnly: true },
      )
   const { data: submissions = [], isLoading: isLoadingSubmissions } = useAcademyAssignmentSubmissions(
      isLive ? { classId: id } : {},
   )

   const submitMutation = useSubmitClassForApproval()
   const approveMutation = useApproveClass()
   const rejectMutation = useRejectClass()
   const publishMutation = usePublishClass()
   const startMutation = useStartClass()
   const completeMutation = useCompleteClass()
   const cancelMutation = useCancelClass()
   const joinLiveSessionMutation = useJoinAcademyLiveSessionAsLecturer()
   const previewConflictMutation = usePreviewAcademyLiveScheduleConflict()
   const createRequestMutation = useCreateAcademyLiveScheduleRequest()
   const cancelRequestMutation = useCancelAcademyLiveScheduleRequest()
   const approveRequestMutation = useApproveAcademyLiveScheduleRequest()
   const rejectRequestMutation = useRejectAcademyLiveScheduleRequest()
   const endRoomMutation = useMutation({
      mutationFn: (roomId: string) => roomsApi.endRoom(roomId),
   })

   const roomStatusesQuery = useQuery({
      queryKey: ["academy-live-room-status", schedules.map((s) => s.roomId).filter(Boolean)],
      enabled: schedules.length > 0,
      refetchInterval: 10000,
      queryFn: async () => {
         const map: Record<string, boolean> = {}
         await Promise.all(
            schedules.map(async (schedule) => {
               if (!schedule.roomId) return
               try {
                  map[schedule.roomId] = await roomsApi.isRoomActive(schedule.roomId)
               } catch {
                  map[schedule.roomId] = false
               }
            }),
         )
         return map
      },
   })

   const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
   const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
   const [isScheduleRequestDialogOpen, setIsScheduleRequestDialogOpen] = useState(false)
   const [isApproveRequestDialogOpen, setIsApproveRequestDialogOpen] = useState(false)
   const [isRejectRequestDialogOpen, setIsRejectRequestDialogOpen] = useState(false)
   const [rejectionReason, setRejectionReason] = useState("")
   const [requestFilterStatus, setRequestFilterStatus] = useState<string>("ALL")
   const [requestFilterMineOnly, setRequestFilterMineOnly] = useState(false)
   const [requestFilterFromDate, setRequestFilterFromDate] = useState("")
   const [requestFilterToDate, setRequestFilterToDate] = useState("")
   const [selectedRequestId, setSelectedRequestId] = useState("")
   const [requestReviewNote, setRequestReviewNote] = useState("")
   const [requestScheduleId, setRequestScheduleId] = useState("")
   const [requestType, setRequestType] = useState<"LEAVE" | "RESCHEDULE">("LEAVE")
   const [requestedDate, setRequestedDate] = useState("")
   const [requestReason, setRequestReason] = useState("")
   const [proposedDate, setProposedDate] = useState("")
   const [proposedStartTime, setProposedStartTime] = useState("19:00")
   const [proposedEndTime, setProposedEndTime] = useState("21:00")
   const queryTab = new URLSearchParams(location.search).get("tab") || "overview"
   const [activeTab, setActiveTab] = useState(queryTab)

   const selectedScheduleId = requestScheduleId || schedules[0]?.id || ""
   const selectedSchedule = useMemo(
      () => schedules.find((schedule) => schedule.id === selectedScheduleId),
      [schedules, selectedScheduleId],
   )

   const requestQuery = useMemo(() => ({
      ...(selectedScheduleId ? { liveScheduleId: selectedScheduleId } : {}),
      ...(requestFilterStatus !== "ALL"
         ? { status: requestFilterStatus as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" }
         : {}),
      ...(requestFilterMineOnly && authUser?.id ? { requestedBy: authUser.id } : {}),
      ...(requestFilterFromDate
         ? { fromDate: new Date(requestFilterFromDate).toISOString() }
         : {}),
      ...(requestFilterToDate
         ? { toDate: new Date(requestFilterToDate).toISOString() }
         : {}),
   }), [
      selectedScheduleId,
      requestFilterStatus,
      requestFilterMineOnly,
      requestFilterFromDate,
      requestFilterToDate,
      authUser?.id,
   ])

   const { data: scheduleRequests = [], isLoading: isLoadingScheduleRequests } = useAcademyLiveScheduleRequests(
      requestQuery,
      { enabled: !!selectedScheduleId },
   )

   useEffect(() => {
      if (!requestScheduleId && schedules[0]?.id) {
         setRequestScheduleId(schedules[0].id)
      }
   }, [schedules, requestScheduleId])

   useEffect(() => {
      const nextTab = new URLSearchParams(location.search).get("tab") || "overview"
      setActiveTab(nextTab)
   }, [location.search])

   useEffect(() => {
      if (!selectedQuizAssessmentId && quizAssessments[0]?.id) {
         setSelectedQuizAssessmentId(quizAssessments[0].id)
      }
      if (
         selectedQuizAssessmentId &&
         !quizAssessments.some((assessment) => assessment.id === selectedQuizAssessmentId)
      ) {
         setSelectedQuizAssessmentId(quizAssessments[0]?.id ?? "")
      }
   }, [quizAssessments, selectedQuizAssessmentId])

   // Giả sử API trả về structure { items, total } cho enrollments
   const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData as any)?.items || []

   if (isLoadingClass) return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải thông tin lớp học...</div>
   if (!cls) return <div className="p-8 text-center text-destructive flex flex-col items-center gap-4">
      <Info className="h-12 w-12" />
      <p>Không tìm thấy lớp học</p>
      <Button onClick={() => navigate("/academy/classes")}>Quay lại</Button>
   </div>

   const tpt = isLive ? cls.liveClass : cls.vodClass

   const handleSubmit = async () => {
      try {
         await submitMutation.mutateAsync(id!)
         toast.success("Submitted for approval")
      } catch (error: any) {
         toast.error(error.response?.data?.message || "Failed to submit")
      }
   }

   const handleApprove = async () => {
      try {
         await approveMutation.mutateAsync(id!)
         toast.success("Approved successfully")
      } catch (error: any) {
         toast.error(error.response?.data?.message || "Failed to approve")
      }
   }

   const handleReject = async () => {
      if (!rejectionReason.trim()) {
         toast.error("Please provide a reason for rejection")
         return
      }
      try {
         await rejectMutation.mutateAsync({ id: id!, reason: rejectionReason })
         toast.success("Rejected successfully")
         setIsRejectDialogOpen(false)
         setRejectionReason("")
      } catch (error: any) {
         toast.error(error.response?.data?.message || "Failed to reject")
      }
   }

   const handlePublish = async () => {
      try {
         await publishMutation.mutateAsync(id!)
         toast.success("Đã publish lớp học")
      } catch (error: any) {
         toast.error(error.response?.data?.message || "Publish thất bại")
      }
   }

   const handleStart = async () => {
      try {
         await startMutation.mutateAsync(id!)
         toast.success("Đã chuyển lớp sang IN_PROGRESS")
      } catch (error: any) {
         toast.error(error.response?.data?.message || "Start lớp thất bại")
      }
   }

   const handleComplete = async () => {
      try {
         await completeMutation.mutateAsync(id!)
         toast.success("Đã hoàn tất lớp học")
      } catch (error: any) {
         toast.error(error.response?.data?.message || "Complete lớp thất bại")
      }
   }

   const handleCancelClass = async () => {
      try {
         await cancelMutation.mutateAsync(id!)
         toast.success("Đã hủy lớp học")
      } catch (error: any) {
         toast.error(error.response?.data?.message || "Hủy lớp thất bại")
      }
   }

   const startOrJoinLiveRoom = async (scheduleId: string) => {
      try {
         const joinData = await joinLiveSessionMutation.mutateAsync(scheduleId)
         window.open(
            `${MEET_URL}?access_token=${joinData.token}`,
            "_blank",
            "noopener,noreferrer",
         )
         toast.success("Đã mở phòng học Meet")
      } catch (error: any) {
         toast.error(error?.response?.data?.message || "Không thể vào phòng học, vui lòng thử lại")
      }
   }

   const endLiveRoom = async (roomId?: string | null) => {
      if (!roomId) return
      try {
         await endRoomMutation.mutateAsync(roomId)
         await roomStatusesQuery.refetch()
         toast.success("Đã kết thúc phòng học")
      } catch (error: any) {
         toast.error(error?.response?.data?.message || "Không thể kết thúc phòng học")
      }
   }

   const resetScheduleRequestForm = () => {
      setRequestType("LEAVE")
      setRequestedDate("")
      setRequestReason("")
      setProposedDate("")
      setProposedStartTime("19:00")
      setProposedEndTime("21:00")
   }

   const submitScheduleRequest = async () => {
      if (!selectedScheduleId) {
         toast.error("Vui lòng chọn lịch học cần tạo yêu cầu")
         return
      }
      if (!requestedDate) {
         toast.error("Vui lòng chọn ngày cần xử lý")
         return
      }

      if (requestType === "RESCHEDULE") {
         if (!proposedDate || !proposedStartTime || !proposedEndTime) {
            toast.error("Vui lòng nhập đầy đủ thông tin lịch đề xuất")
            return
         }
         if (!liveClassId) {
            toast.error("Không tìm thấy liveClassId để kiểm tra conflict")
            return
         }
         const weekday = new Date(proposedDate).getDay()
         const preview = await previewConflictMutation.mutateAsync({
            liveClassId,
            weekday,
            startTime: proposedStartTime,
            endTime: proposedEndTime,
         })
         if (preview.hasConflict) {
            const teacherConflict = preview.teacherConflicts?.[0]
            if (teacherConflict) {
               toast.error(
                  `Lịch đề xuất bị trùng với lớp ${teacherConflict.classCode} (${teacherConflict.startTime}-${teacherConflict.endTime})`,
               )
            } else {
               toast.error("Lịch đề xuất bị trùng trong lớp hiện tại")
            }
            return
         }
      }

      try {
         await createRequestMutation.mutateAsync({
            liveScheduleId: selectedScheduleId,
            type: requestType,
            requestedDate: new Date(requestedDate).toISOString(),
            proposedDate:
               requestType === "RESCHEDULE" && proposedDate
                  ? new Date(proposedDate).toISOString()
                  : undefined,
            proposedStartTime:
               requestType === "RESCHEDULE" ? proposedStartTime : undefined,
            proposedEndTime:
               requestType === "RESCHEDULE" ? proposedEndTime : undefined,
            reason: requestReason || undefined,
         })
         toast.success("Đã tạo yêu cầu lịch học")
         setIsScheduleRequestDialogOpen(false)
         resetScheduleRequestForm()
      } catch (error: any) {
         toast.error(error?.response?.data?.message || "Tạo yêu cầu thất bại")
      }
   }

   const approveScheduleRequest = async (requestId: string) => {
      try {
         await approveRequestMutation.mutateAsync({
            id: requestId,
            input: { reviewNote: requestReviewNote || undefined },
         })
         toast.success("Đã duyệt yêu cầu")
         setIsApproveRequestDialogOpen(false)
         setSelectedRequestId("")
         setRequestReviewNote("")
      } catch (error: any) {
         toast.error(error?.response?.data?.message || "Duyệt yêu cầu thất bại")
      }
   }

   const rejectScheduleRequest = async (requestId: string) => {
      if (!requestReviewNote.trim()) {
         toast.error("Vui lòng nhập lý do từ chối")
         return
      }
      try {
         await rejectRequestMutation.mutateAsync({
            id: requestId,
            input: { reviewNote: requestReviewNote },
         })
         toast.success("Đã từ chối yêu cầu")
         setIsRejectRequestDialogOpen(false)
         setSelectedRequestId("")
         setRequestReviewNote("")
      } catch (error: any) {
         toast.error(error?.response?.data?.message || "Từ chối yêu cầu thất bại")
      }
   }

   const cancelScheduleRequest = async (requestId: string) => {
      try {
         await cancelRequestMutation.mutateAsync(requestId)
         toast.success("Đã hủy yêu cầu")
      } catch (error: any) {
         toast.error(error?.response?.data?.message || "Hủy yêu cầu thất bại")
      }
   }

   const enrollmentOpenAt = tpt?.enrollmentOpenAt
   const enrollmentCloseAt = tpt?.enrollmentCloseAt
   const maxStudents = tpt?.maxStudents
   const startDate = isLive ? cls.liveClass?.startDate : null
   const endDate = isLive ? cls.liveClass?.endDate : null
   const term = isLive ? cls.liveClass?.term : "N/A"
   const batch = isLive ? cls.liveClass?.batch : "N/A"
   const primaryTeacher = isLive ? cls.liveClass?.primaryTeacher : null

   return (
      <div className="space-y-6">
         <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/academy/classes")} className="gap-2">
               <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
            </Button>
         </div>

         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b">
            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-3">
                  <div className={cn(
                     "p-3 rounded-xl shadow-sm border",
                     isLive ? "bg-blue-500/10 text-blue-600 border-blue-200/50" : "bg-purple-500/10 text-purple-600 border-purple-200/50"
                  )}>
                     <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                     <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{cls.name}</h1>
                        <Badge
                           variant="outline"
                           className={cn(
                              "font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 shadow-none",
                              cls.status === "ENROLLING" && "bg-blue-500/10 text-blue-600 border-blue-200",
                              cls.status === "IN_PROGRESS" && "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                              cls.status === "PENDING_APPROVAL" && "bg-amber-500/10 text-amber-600 border-amber-200",
                              cls.status === "DRAFT" && "bg-muted text-muted-foreground border-transparent",
                              cls.status === "COMPLETED" && "bg-zinc-500/10 text-zinc-600 border-zinc-200"
                           )}
                        >
                           {cls.status}
                        </Badge>
                     </div>
                     <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">ID: <span className="font-mono text-foreground font-medium">{cls.code}</span></span>
                        <span className="text-xs border-l pl-3 text-muted-foreground uppercase tracking-widest font-bold">MODE: {cls.mode}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2">
               {canDeliveryWrite && cls.status === "DRAFT" && (
                  <Button
                     variant="outline"
                     className="gap-2 shadow-sm"
                     onClick={handlePublish}
                     disabled={publishMutation.isPending}
                  >
                     Publish
                  </Button>
               )}

               {canDeliveryWrite && cls.status === "DRAFT" && (
                  <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="gap-2 shadow-md">
                     <Send className="h-4 w-4" />
                     Gửi phê duyệt
                  </Button>
               )}

               {canDeliveryApprove && cls.status === "PENDING_APPROVAL" && (
                  <div className="flex gap-2">
                     <Button
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 border-destructive/20 shadow-sm"
                        onClick={() => setIsRejectDialogOpen(true)}
                     >
                        Từ chối
                     </Button>
                     <Button onClick={handleApprove} disabled={approveMutation.isPending} className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md">
                        <CheckCircle2 className="h-4 w-4" />
                        Phê duyệt
                     </Button>
                  </div>
               )}

               {canDeliveryWrite && (cls.status === "ENROLLING" || cls.status === "IN_PROGRESS") && (
                  <Button
                     variant="outline"
                     className="text-destructive hover:bg-destructive/10 border-destructive/20 shadow-sm"
                     onClick={handleCancelClass}
                     disabled={cancelMutation.isPending}
                  >
                     Hủy lớp
                  </Button>
               )}

               {canDeliveryWrite && cls.status === "ENROLLING" && (
                  <Button
                     onClick={handleStart}
                     disabled={startMutation.isPending}
                     className="gap-2 shadow-md"
                  >
                     Bắt đầu lớp
                  </Button>
               )}

               {canDeliveryWrite && cls.status === "IN_PROGRESS" && (
                  <Button
                     onClick={handleComplete}
                     disabled={completeMutation.isPending}
                     className="gap-2 shadow-md bg-emerald-600 hover:bg-emerald-700"
                  >
                     Hoàn tất lớp
                  </Button>
               )}

               <Button variant="outline" size="sm" className="gap-2 shadow-sm" onClick={() => setIsDuplicateDialogOpen(true)}>
                  <Copy className="h-4 w-4" /> Nhân bản
               </Button>

               <Button variant="outline" size="sm" asChild className="shadow-sm">
                  <Link to={`/academy/classes/${id}/edit`}>
                     <Edit className="h-4 w-4" />
                  </Link>
               </Button>
            </div>
         </div>

         {cls.status === "DRAFT" && cls.rejectionReason && (
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle className="font-bold">Lớp học bị từ chối</AlertTitle>
               <AlertDescription className="mt-1">
                  Lý do: <span className="font-semibold italic">{cls.rejectionReason}</span>. Vui lòng cập nhật lại thông tin và gửi lại phê duyệt.
               </AlertDescription>
            </Alert>
         )}


         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1 shadow-sm">
               <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                     <Info className="h-4 w-4" /> Thống kê & Profile
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="space-y-1">
                     <p className="text-xs text-muted-foreground">Course Profile</p>
                     <Link to={`/academy/course-profiles/${cls.courseProfileId}`} className="text-sm font-medium hover:underline text-primary break-all flex items-center gap-1">
                        {profile?.title || cls.courseProfileId}
                        <LinkIcon className="h-3 w-3" />
                     </Link>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs text-muted-foreground">Course Edition (Syllabus)</p>
                     <Link to={`/academy/course-editions/${cls.courseEditionId}`} className="text-sm font-medium hover:underline text-primary break-all flex items-center gap-1">
                        {edition?.editionTag || cls.courseEditionId}
                        <LinkIcon className="h-3 w-3" />
                     </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                     <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Học viên</p>
                        <p className="text-2xl font-bold">{enrollments.length}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Tối đa</p>
                        <p className="text-2xl font-bold">{maxStudents || "∞"}</p>
                     </div>
                  </div>
                  <div className="pt-4 border-t space-y-3">
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Bắt đầu</span>
                        <span className="font-medium">{startDate ? new Date(startDate).toLocaleDateString("vi-VN") : "N/A"}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Kết thúc</span>
                        <span className="font-medium">{endDate ? new Date(endDate).toLocaleDateString("vi-VN") : "N/A"}</span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="md:col-span-3">
               <Tabs
                  value={activeTab}
                  onValueChange={(value) => {
                     setActiveTab(value)
                     navigate(`/academy/classes/${id}?tab=${value}`, { replace: true })
                  }}
                  className="w-full"
               >
                  <TabsList className={cn("grid w-full mb-6", isLive ? "grid-cols-8" : "grid-cols-4")}>
                     <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                     {isLive && <TabsTrigger value="schedule">Lịch học ({schedules.length})</TabsTrigger>}
                     {isLive && <TabsTrigger value="requests">Yêu cầu ({scheduleRequests.length})</TabsTrigger>}
                     {isLive && <TabsTrigger value="attendance">Điểm danh</TabsTrigger>}
                     <TabsTrigger value="assessments">Bài kiểm tra ({assessments.length})</TabsTrigger>
                     <TabsTrigger value="attempts">Kết quả thi ({attempts.length})</TabsTrigger>
                     {isLive && <TabsTrigger value="submissions">Bài nộp ({submissions.length})</TabsTrigger>}
                     <TabsTrigger value="learners">Học viên ({enrollments.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                     <Card>
                        <CardHeader>
                           <CardTitle className="text-lg">Chi tiết lớp học</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <div className="space-y-1">
                                 <p className="text-sm font-medium text-muted-foreground">Mô tả kỳ học (Term/Batch)</p>
                                 <p className="text-sm font-semibold">{term} / {batch}</p>
                              </div>
                              {enrollmentOpenAt && (
                                 <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Thời gian mở đăng ký</p>
                                    <p className="text-sm">
                                       {new Date(enrollmentOpenAt).toLocaleString("vi-VN")}
                                       {" → "}
                                       {enrollmentCloseAt ? new Date(enrollmentCloseAt).toLocaleString("vi-VN") : "Vĩnh viễn"}
                                    </p>
                                 </div>
                              )}

                              {!isLive && cls.vodClass?.defaultExpiresMonths && (
                                 <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Thời hạn mặc định</p>
                                    <p className="text-sm">{cls.vodClass.defaultExpiresMonths} tháng</p>
                                 </div>
                              )}
                           </div>
                           <div className="space-y-4">
                              <div className="space-y-1">
                                 <p className="text-sm font-medium text-muted-foreground">Giảng viên / Hỗ trợ</p>
                                 <div className="flex items-center gap-2">
                                    {primaryTeacher ? (
                                       <>
                                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                             {primaryTeacher.avatarUrl ? (
                                                <img src={primaryTeacher.avatarUrl} alt={primaryTeacher.displayName} className="h-full w-full object-cover" />
                                             ) : (
                                                <User className="h-4 w-4 text-primary" />
                                             )}
                                          </div>
                                          <span className="text-sm font-medium">{primaryTeacher.displayName}</span>
                                       </>
                                    ) : (
                                       <>
                                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                             <User className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                          <span className="text-sm italic text-muted-foreground">Chưa có thông tin giảng viên</span>
                                       </>
                                    )}
                                 </div>
                              </div>
                              {isLive && cls.liveClass?.minStudents && (
                                 <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Số học viên tối thiểu</p>
                                    <p className="text-sm">{cls.liveClass.minStudents} (Enforcement: {cls.liveClass.minStudentsEnforcement})</p>
                                 </div>
                              )}
                           </div>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-6">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div>
                              <CardTitle className="text-lg">Lịch học (Schedules)</CardTitle>
                              <CardDescription>Các ca học cố định trong tuần cho lớp này</CardDescription>
                           </div>
                           <Button size="sm" asChild className="gap-2">
                              <Link to={`/academy/live-schedule/new?liveClassId=${liveClassId || ""}&classId=${id}`}><Plus className="h-4 w-4" /> Thêm lịch</Link>
                           </Button>
                        </CardHeader>
                        <CardContent>
                           <Table>
                              <TableHeader>
                                 <TableRow className="bg-muted/50">
                                    <TableHead className="w-[80px]">STT</TableHead>
                                    <TableHead>Thứ (Weekday)</TableHead>
                                    <TableHead>Giờ bắt đầu</TableHead>
                                    <TableHead>Giờ kết thúc</TableHead>
                                    <TableHead>Địa điểm / Link</TableHead>
                                    <TableHead>Phòng Meet</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {isLoadingSchedules ? (
                                    <TableRow><TableCell colSpan={8} className="text-center">Đang tải...</TableCell></TableRow>
                                 ) : schedules.length ? (
                                    schedules.map((s, idx) => (
                                       <TableRow key={s.id}>
                                          <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                          <TableCell className="font-semibold">{formatWeekday(s.weekday)}</TableCell>
                                          <TableCell>{s.startTime}</TableCell>
                                          <TableCell>{s.endTime}</TableCell>
                                          <TableCell>
                                             <div className="flex items-center gap-1 text-xs max-w-[200px] truncate">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                {s.location || "N/A"}
                                             </div>
                                          </TableCell>
                                          <TableCell>
                                             {s.roomId ? (
                                                <Badge
                                                   variant={roomStatusesQuery.data?.[s.roomId] ? "default" : "secondary"}
                                                   className="uppercase"
                                                >
                                                   {roomStatusesQuery.data?.[s.roomId] ? "Active" : "Inactive"}
                                                </Badge>
                                             ) : (
                                                <Badge variant="outline">No Room</Badge>
                                             )}
                                          </TableCell>
                                          <TableCell className="text-right">
                                             <div className="flex justify-end gap-2">
                                                {canManageLiveSession && (
                                                   <Button
                                                      variant={roomStatusesQuery.data?.[s.roomId || ""] ? "outline" : "default"}
                                                      size="sm"
                                                      onClick={() => startOrJoinLiveRoom(s.id)}
                                                      disabled={joinLiveSessionMutation.isPending}
                                                   >
                                                      {roomStatusesQuery.data?.[s.roomId || ""]
                                                         ? "Vào phòng"
                                                         : "Khởi tạo / Retry"}
                                                   </Button>
                                                )}
                                                {canManageLiveSession && roomStatusesQuery.data?.[s.roomId || ""] && (
                                                   <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => endLiveRoom(s.roomId)}
                                                      disabled={endRoomMutation.isPending}
                                                   >
                                                      Kết thúc phòng
                                                   </Button>
                                                )}
                                                <Button variant="ghost" size="sm" asChild>
                                                   <Link to={`/academy/live-schedule/${s.id}/edit`}><Edit className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                             </div>
                                          </TableCell>
                                       </TableRow>
                                    ))
                                 ) : (
                                    <TableRow>
                                       <TableCell colSpan={8} className="text-center py-8 text-muted-foreground italic">Chưa có lịch học nào</TableCell>
                                    </TableRow>
                                 )}
                              </TableBody>
                           </Table>
                        </CardContent>
                     </Card>

                  </TabsContent>

                  <TabsContent value="requests">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div>
                              <CardTitle className="text-lg">Yêu cầu đổi lịch / xin nghỉ</CardTitle>
                              <CardDescription>
                                 Giảng viên tạo yêu cầu, staff/admin duyệt để cập nhật ngoại lệ lịch học.
                              </CardDescription>
                           </div>
                           <div className="flex items-center gap-2">
                              {canManageLiveSession && (
                                 <Button
                                    onClick={() => setIsScheduleRequestDialogOpen(true)}
                                    disabled={!selectedSchedule}
                                    className="gap-2"
                                 >
                                    <Plus className="h-4 w-4" />
                                    Tạo yêu cầu
                                 </Button>
                              )}
                           </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                              <Select
                                 value={selectedScheduleId}
                                 onValueChange={(value) => setRequestScheduleId(value)}
                              >
                                 <SelectTrigger>
                                    <SelectValue placeholder="Chọn lịch học" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {schedules.map((schedule) => (
                                       <SelectItem key={schedule.id} value={schedule.id}>
                                          {formatWeekday(schedule.weekday)} {schedule.startTime}-{schedule.endTime}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>

                              <Select
                                 value={requestFilterStatus}
                                 onValueChange={setRequestFilterStatus}
                              >
                                 <SelectTrigger>
                                    <SelectValue placeholder="Trạng thái" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                                    <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                                    <SelectItem value="REJECTED">Từ chối</SelectItem>
                                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                 </SelectContent>
                              </Select>

                              <Input
                                 type="date"
                                 value={requestFilterFromDate}
                                 onChange={(e) => setRequestFilterFromDate(e.target.value)}
                              />
                              <Input
                                 type="date"
                                 value={requestFilterToDate}
                                 onChange={(e) => setRequestFilterToDate(e.target.value)}
                              />
                              <Button
                                 variant={requestFilterMineOnly ? "default" : "outline"}
                                 onClick={() => setRequestFilterMineOnly((prev) => !prev)}
                              >
                                 {requestFilterMineOnly ? "Đang lọc: của tôi" : "Chỉ yêu cầu của tôi"}
                              </Button>
                           </div>

                           <Table>
                              <TableHeader>
                                 <TableRow className="bg-muted/50">
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Ngày yêu cầu</TableHead>
                                    <TableHead>Lý do</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Người tạo</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {isLoadingScheduleRequests ? (
                                    <TableRow>
                                       <TableCell colSpan={6} className="text-center">Đang tải...</TableCell>
                                    </TableRow>
                                 ) : scheduleRequests.length ? (
                                    scheduleRequests.map((request) => (
                                       <TableRow key={request.id}>
                                          <TableCell>{formatRequestType(request.type)}</TableCell>
                                          <TableCell>{new Date(request.requestedDate).toLocaleDateString("vi-VN")}</TableCell>
                                          <TableCell className="max-w-[280px] truncate">{request.reason || "-"}</TableCell>
                                          <TableCell>
                                             <Badge variant={request.status === "APPROVED" ? "default" : request.status === "REJECTED" ? "destructive" : "secondary"}>
                                                {formatRequestStatus(request.status)}
                                             </Badge>
                                          </TableCell>
                                          <TableCell>{request.requester?.displayName || request.requestedBy}</TableCell>
                                          <TableCell className="text-right">
                                             <div className="flex justify-end gap-2">
                                                {request.status === "PENDING" &&
                                                   canApproveLiveRequest && (
                                                      <>
                                                         <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                               setSelectedRequestId(request.id)
                                                               setRequestReviewNote("")
                                                               setIsApproveRequestDialogOpen(true)
                                                            }}
                                                            disabled={approveRequestMutation.isPending}
                                                         >
                                                            Duyệt
                                                         </Button>
                                                         <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                               setSelectedRequestId(request.id)
                                                               setRequestReviewNote("")
                                                               setIsRejectRequestDialogOpen(true)
                                                            }}
                                                            disabled={rejectRequestMutation.isPending}
                                                         >
                                                            Từ chối
                                                         </Button>
                                                      </>
                                                   )}
                                                {request.status === "PENDING" &&
                                                   request.requestedBy === authUser?.id && (
                                                      <Button
                                                         size="sm"
                                                         variant="ghost"
                                                         onClick={() => cancelScheduleRequest(request.id)}
                                                         disabled={cancelRequestMutation.isPending}
                                                      >
                                                         Hủy
                                                      </Button>
                                                   )}
                                             </div>
                                          </TableCell>
                                       </TableRow>
                                    ))
                                 ) : (
                                    <TableRow>
                                       <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                                          Chưa có yêu cầu nào cho lịch học này.
                                       </TableCell>
                                    </TableRow>
                                 )}
                              </TableBody>
                           </Table>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="assessments">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div>
                              <CardTitle className="text-lg">Bài kiểm tra theo lớp (Assessments)</CardTitle>
                              <CardDescription>Quản lý các instance bài kiểm tra riêng cho lớp này</CardDescription>
                           </div>
                           <div className="flex gap-2">
                              <Button size="sm" asChild className="gap-2">
                                 <Link to={`/academy/class-assessments/new?classId=${id}&kind=QUIZ`}><Plus className="h-4 w-4" /> Tạo Quiz</Link>
                              </Button>
                              {isLive && (
                                 <Button size="sm" asChild variant="outline" className="gap-2">
                                    <Link to={`/academy/class-assessments/new?classId=${id}&kind=ASSIGNMENT`}><Plus className="h-4 w-4" /> Tạo Assignment</Link>
                                 </Button>
                              )}
                           </div>
                        </CardHeader>
                        <CardContent>
                           <Table>
                              <TableHeader>
                                 <TableRow className="bg-muted/50">
                                    <TableHead className="w-[80px]">STT</TableHead>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Hạn nộp</TableHead>
                                    <TableHead>Trọng số</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {isLoadingAssessments ? (
                                    <TableRow><TableCell colSpan={7} className="text-center">Đang tải...</TableCell></TableRow>
                                 ) : (isLive ? assessments : quizAssessments).length ? (
                                    (isLive ? assessments : quizAssessments).map((a, idx) => (
                                       <TableRow key={a.id}>
                                          <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                          <TableCell className="font-medium">{a.titleOverride || "Default Template"}</TableCell>
                                          <TableCell>
                                             <Badge variant="outline">{a.kind}</Badge>
                                          </TableCell>
                                          <TableCell>{a.deadline ? new Date(a.deadline).toLocaleString("vi-VN") : "-"}</TableCell>
                                          <TableCell>{a.weight}%</TableCell>
                                          <TableCell>
                                             <Badge variant={a.status === "PUBLISHED" ? "default" : "secondary"}>{a.status}</Badge>
                                          </TableCell>
                                          <TableCell className="text-right">
                                             <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/academy/class-assessments/${a.id}/edit`}><Edit className="h-3.5 w-3.5" /></Link>
                                             </Button>
                                          </TableCell>
                                       </TableRow>
                                    ))
                                 ) : (
                                    <TableRow>
                                       <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">Chưa có Assessment nào</TableCell>
                                    </TableRow>
                                 )}
                              </TableBody>
                           </Table>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="attempts">
                     <Card>
                        <CardHeader>
                           <CardTitle className="text-lg">Kết quả thi & Kiểm tra</CardTitle>
                           <CardDescription>Chi tiết các lượt làm bài quiz của học viên trong lớp</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <Select
                                 value={selectedQuizAssessmentId}
                                 onValueChange={setSelectedQuizAssessmentId}
                              >
                                 <SelectTrigger>
                                    <SelectValue placeholder="Chọn quiz assessment" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {quizAssessments.map((assessment) => (
                                       <SelectItem key={assessment.id} value={assessment.id}>
                                          {assessment.titleOverride || assessment.id}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                              <div className="text-sm text-muted-foreground md:col-span-2">
                                 {selectedQuizAssessment
                                    ? `Đang xem analytics cho quiz: ${selectedQuizAssessment.titleOverride || selectedQuizAssessment.id}`
                                    : "Chưa có quiz assessment trong lớp này."}
                              </div>
                           </div>
                           <Table>
                              <TableHeader>
                                 <TableRow className="bg-muted/50">
                                    <TableHead className="w-[80px]">STT</TableHead>
                                    <TableHead>Học viên</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Điểm</TableHead>
                                    <TableHead>Tỷ lệ</TableHead>
                                    <TableHead>Kết quả</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {isLoadingAttempts ? (
                                    <TableRow><TableCell colSpan={7} className="text-center">Đang tải...</TableCell></TableRow>
                                 ) : attempts.length ? (
                                    attempts.map((att, idx) => (
                                       <TableRow key={att.id}>
                                          <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                          <TableCell className="font-medium">User ID: {att.userId}</TableCell>
                                          <TableCell><Badge variant="outline">{att.status}</Badge></TableCell>
                                          <TableCell>{att.rawScore ?? "-"} / {att.maxScore ?? "-"}</TableCell>
                                          <TableCell>{att.percentage ? `${att.percentage}%` : "-"}</TableCell>
                                          <TableCell>
                                             {att.isPassed !== null ? (
                                                <Badge variant={att.isPassed ? "default" : "destructive"}>{att.isPassed ? "Đạt" : "Trượt"}</Badge>
                                             ) : "-"}
                                          </TableCell>
                                          <TableCell className="text-right">
                                             <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/academy/exam-attempts/${att.id}?classId=${id}&tab=attempts&classAssessmentId=${selectedQuizAssessmentId}`}><Info className="h-3.5 w-3.5" /></Link>
                                             </Button>
                                          </TableCell>
                                       </TableRow>
                                    ))
                                 ) : (
                                    <TableRow>
                                       <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">Chưa có dữ liệu thi</TableCell>
                                    </TableRow>
                                 )}
                              </TableBody>
                           </Table>

                           <Card>
                              <CardHeader>
                                 <CardTitle className="text-base">Thống kê câu sai</CardTitle>
                                 <CardDescription>
                                    Tổng hợp câu hỏi có tỉ lệ sai cao từ các lượt làm mới nhất.
                                 </CardDescription>
                              </CardHeader>
                              <CardContent>
                                 <Table>
                                    <TableHeader>
                                       <TableRow className="bg-muted/50">
                                          <TableHead>Câu hỏi</TableHead>
                                          <TableHead>Loại</TableHead>
                                          <TableHead>Số lượt làm</TableHead>
                                          <TableHead>Số lượt sai</TableHead>
                                          <TableHead>Tỉ lệ sai</TableHead>
                                       </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                       {isLoadingWrongQuestionAnalytics ? (
                                          <TableRow>
                                             <TableCell colSpan={5} className="text-center">Đang tải...</TableCell>
                                          </TableRow>
                                       ) : wrongQuestionAnalytics?.questions?.length ? (
                                          wrongQuestionAnalytics.questions.map((question) => (
                                             <TableRow key={question.questionId}>
                                                <TableCell className="max-w-[360px] truncate">{question.questionContent}</TableCell>
                                                <TableCell>{question.questionType}</TableCell>
                                                <TableCell>{question.attempts}</TableCell>
                                                <TableCell>{question.wrongCount}</TableCell>
                                                <TableCell>{question.wrongRatePercent}%</TableCell>
                                             </TableRow>
                                          ))
                                       ) : (
                                          <TableRow>
                                             <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                Chưa có dữ liệu câu sai.
                                             </TableCell>
                                          </TableRow>
                                       )}
                                    </TableBody>
                                 </Table>
                              </CardContent>
                           </Card>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  {isLive && (
                     <TabsContent value="submissions">
                        <Card>
                           <CardHeader>
                              <CardTitle className="text-lg">Bài nộp từ học viên</CardTitle>
                              <CardDescription>Quản lý và chấm điểm các bài tập đã nộp</CardDescription>
                           </CardHeader>
                           <CardContent>
                              <Table>
                                 <TableHeader>
                                    <TableRow className="bg-muted/50">
                                       <TableHead className="w-[80px]">STT</TableHead>
                                       <TableHead>Học viên</TableHead>
                                       <TableHead>Trạng thái</TableHead>
                                       <TableHead>Ngày nộp</TableHead>
                                       <TableHead>Điểm</TableHead>
                                       <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                    {isLoadingSubmissions ? (
                                       <TableRow><TableCell colSpan={7} className="text-center">Đang tải...</TableCell></TableRow>
                                    ) : submissions.length ? (
                                       submissions.map((sub, idx) => (
                                          <TableRow key={sub.id}>
                                             <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                                             <TableCell className="font-medium">User ID: {sub.userId}</TableCell>
                                             <TableCell><Badge variant="outline">{sub.status}</Badge></TableCell>
                                             <TableCell>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("vi-VN") : "-"}</TableCell>
                                             <TableCell className="font-bold">{sub.score ?? "-"}</TableCell>
                                             <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                   <Link to={`/academy/assignment-submissions/${sub.id}?classId=${id}&tab=submissions`}><Info className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                             </TableCell>
                                          </TableRow>
                                       ))
                                    ) : (
                                       <TableRow>
                                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">Chưa có bài nộp nào</TableCell>
                                       </TableRow>
                                    )}
                                 </TableBody>
                              </Table>
                           </CardContent>
                        </Card>
                     </TabsContent>
                  )}

                  <TabsContent value="learners">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div>
                              <CardTitle className="text-lg">Danh sách học viên</CardTitle>
                              <CardDescription>Học viên đã enroll vào lớp học này</CardDescription>
                           </div>
                           <Button size="sm" asChild className="gap-2">
                              <Link to={`/academy/enrollments/new?classId=${id}`}><Plus className="h-4 w-4" /> Enroll thủ công</Link>
                           </Button>
                        </CardHeader>
                        <CardContent>
                           <LearnerList enrollments={enrollments} isLoading={isLoadingEnrollments} />
                        </CardContent>
                     </Card>
                  </TabsContent>

                  {isLive && (
                     <TabsContent value="attendance">
                        <ClassAttendanceTab
                           classId={id!}
                           liveClassId={cls.liveClass?.id || ""}
                        />
                     </TabsContent>
                  )}
               </Tabs>
            </div>
         </div>

         <Dialog open={isScheduleRequestDialogOpen} onOpenChange={setIsScheduleRequestDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Tạo yêu cầu đổi lịch / xin nghỉ</DialogTitle>
                  <DialogDescription>
                     Yêu cầu sẽ ở trạng thái chờ duyệt cho tới khi staff/admin phê duyệt.
                  </DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-2">
                  <div className="space-y-2">
                     <p className="text-sm font-medium">Lịch học</p>
                     <Select
                        value={selectedScheduleId}
                        onValueChange={(value) => setRequestScheduleId(value)}
                     >
                        <SelectTrigger>
                           <SelectValue placeholder="Chọn lịch học" />
                        </SelectTrigger>
                        <SelectContent>
                           {schedules.map((schedule) => (
                              <SelectItem key={schedule.id} value={schedule.id}>
                                 {formatWeekday(schedule.weekday)} {schedule.startTime}-{schedule.endTime}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <p className="text-sm font-medium">Loại yêu cầu</p>
                     <Select
                        value={requestType}
                        onValueChange={(value) => setRequestType(value as "LEAVE" | "RESCHEDULE")}
                     >
                        <SelectTrigger>
                           <SelectValue placeholder="Chọn loại yêu cầu" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="LEAVE">Xin nghỉ buổi học</SelectItem>
                           <SelectItem value="RESCHEDULE">Đề xuất đổi lịch</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <p className="text-sm font-medium">Ngày muốn xử lý</p>
                     <Input
                        type="date"
                        value={requestedDate}
                        onChange={(e) => setRequestedDate(e.target.value)}
                     />
                  </div>

                  {requestType === "RESCHEDULE" && (
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                           <p className="text-sm font-medium">Ngày đề xuất</p>
                           <Input
                              type="date"
                              value={proposedDate}
                              onChange={(e) => setProposedDate(e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <p className="text-sm font-medium">Giờ bắt đầu</p>
                           <Input
                              type="time"
                              value={proposedStartTime}
                              onChange={(e) => setProposedStartTime(e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <p className="text-sm font-medium">Giờ kết thúc</p>
                           <Input
                              type="time"
                              value={proposedEndTime}
                              onChange={(e) => setProposedEndTime(e.target.value)}
                           />
                        </div>
                     </div>
                  )}

                  <div className="space-y-2">
                     <p className="text-sm font-medium">Lý do</p>
                     <Textarea
                        placeholder="Mô tả lý do xin nghỉ/đổi lịch..."
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        className="min-h-[90px]"
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button
                     variant="outline"
                     onClick={() => {
                        setIsScheduleRequestDialogOpen(false)
                        resetScheduleRequestForm()
                     }}
                  >
                     Hủy
                  </Button>
                  <Button
                     onClick={submitScheduleRequest}
                     disabled={createRequestMutation.isPending || previewConflictMutation.isPending}
                  >
                     Gửi yêu cầu
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <Dialog
            open={isApproveRequestDialogOpen}
            onOpenChange={(open) => {
               setIsApproveRequestDialogOpen(open)
               if (!open) {
                  setSelectedRequestId("")
                  setRequestReviewNote("")
               }
            }}
         >
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Duyệt yêu cầu lịch học</DialogTitle>
                  <DialogDescription>
                     Xác nhận duyệt yêu cầu này. Bạn có thể thêm ghi chú nội bộ.
                  </DialogDescription>
               </DialogHeader>
               <div className="py-2">
                  <Textarea
                     placeholder="Ghi chú duyệt (không bắt buộc)"
                     value={requestReviewNote}
                     onChange={(e) => setRequestReviewNote(e.target.value)}
                     className="min-h-[90px]"
                  />
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setIsApproveRequestDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button
                     onClick={() => approveScheduleRequest(selectedRequestId)}
                     disabled={!selectedRequestId || approveRequestMutation.isPending}
                  >
                     Xác nhận duyệt
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <Dialog
            open={isRejectRequestDialogOpen}
            onOpenChange={(open) => {
               setIsRejectRequestDialogOpen(open)
               if (!open) {
                  setSelectedRequestId("")
                  setRequestReviewNote("")
               }
            }}
         >
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Từ chối yêu cầu lịch học</DialogTitle>
                  <DialogDescription>
                     Nhập lý do từ chối để giảng viên cập nhật lại đề xuất.
                  </DialogDescription>
               </DialogHeader>
               <div className="py-2">
                  <Textarea
                     placeholder="Lý do từ chối..."
                     value={requestReviewNote}
                     onChange={(e) => setRequestReviewNote(e.target.value)}
                     className="min-h-[90px]"
                  />
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRejectRequestDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button
                     variant="destructive"
                     onClick={() => rejectScheduleRequest(selectedRequestId)}
                     disabled={!selectedRequestId || rejectRequestMutation.isPending}
                  >
                     Xác nhận từ chối
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Từ chối phê duyệt lớp học</DialogTitle>
                  <DialogDescription>
                     Vui lòng nhập lý do từ chối để người soạn thảo có thể chỉnh sửa lại.
                  </DialogDescription>
               </DialogHeader>
               <div className="py-4">
                  <Textarea
                     placeholder="Nhập lý do tại đây..."
                     value={rejectionReason}
                     onChange={(e) => setRejectionReason(e.target.value)}
                     className="min-h-[100px]"
                  />
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Hủy</Button>
                  <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
                     Xác nhận từ chối
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <DuplicateClassDialog
            sourceClass={cls as any}
            open={isDuplicateDialogOpen}
            onOpenChange={setIsDuplicateDialogOpen}
         />
      </div >
   )
}

function formatWeekday(wd: number) {
   const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
   return days[wd] || "N/A"
}

function formatRequestType(type: string) {
   if (type === "LEAVE") return "Xin nghỉ"
   if (type === "RESCHEDULE") return "Đổi lịch"
   return type
}

function formatRequestStatus(status: string) {
   if (status === "PENDING") return "Chờ duyệt"
   if (status === "APPROVED") return "Đã duyệt"
   if (status === "REJECTED") return "Từ chối"
   if (status === "CANCELLED") return "Đã hủy"
   return status
}
