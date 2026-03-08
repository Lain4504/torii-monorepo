import { useNavigate, useParams, Link } from "react-router-dom"
import { useAcademyClass, useSubmitClassForApproval, useApproveClass, useRejectClass } from "@/lib/api/services/academy-classes"
import { useAcademyLiveSchedules } from "@/lib/api/services/academy-live-schedules"
import { useAcademyClassAssessments } from "@/lib/api/services/academy-class-assessments"
import { useAcademyEnrollments } from "@/lib/api/services/academy-enrollments"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import { useAcademyExamAttempts } from "@/lib/api/services/academy-exam-attempts"
import { useAcademyAssignmentSubmissions } from "@/lib/api/services/academy-assignment-submissions"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { useState } from "react"
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
import { LearnerList } from "@/components/academy/learner-list"
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
   Send
} from "lucide-react"

export default function ClassDetailPage() {
   const { id } = useParams<{ id: string }>()
   const navigate = useNavigate()
   const { data: cls, isLoading: isLoadingClass } = useAcademyClass(id!)
   const { data: profile } = useAcademyCourseProfile(cls?.courseProfileId)
   const { data: edition } = useAcademyCourseEdition(cls?.courseEditionId)
   const { data: schedules = [], isLoading: isLoadingSchedules } = useAcademyLiveSchedules({ liveClassId: id })
   const { data: assessments = [], isLoading: isLoadingAssessments } = useAcademyClassAssessments({ classId: id })
   const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useAcademyEnrollments({ classId: id })
   const { data: attempts = [], isLoading: isLoadingAttempts } = useAcademyExamAttempts({ classId: id })
   const { data: submissions = [], isLoading: isLoadingSubmissions } = useAcademyAssignmentSubmissions({ classId: id })

   const submitMutation = useSubmitClassForApproval()
   const approveMutation = useApproveClass()
   const rejectMutation = useRejectClass()

   const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
   const [rejectionReason, setRejectionReason] = useState("")

   // Giả sử API trả về structure { items, total } cho enrollments
   const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData as any)?.items || []

   if (isLoadingClass) return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải thông tin lớp học...</div>
   if (!cls) return <div className="p-8 text-center text-destructive flex flex-col items-center gap-4">
      <Info className="h-12 w-12" />
      <p>Không tìm thấy lớp học</p>
      <Button onClick={() => navigate("/academy/classes")}>Quay lại</Button>
   </div>

   const isLive = cls.mode === "LIVE"
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

         <PageHeader
            title={cls.name}
            subtitle={
               <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-muted-foreground">Mã lớp: <span className="text-foreground font-medium">{cls.code}</span></span>
                  <span className="text-sm text-muted-foreground">Mode: <span className="text-foreground font-medium">{cls.mode}</span></span>
                  <Badge variant={
                     cls.status === "ENROLLING" ? "default" :
                        cls.status === "PENDING_APPROVAL" ? "secondary" : "outline"
                  }>
                     {cls.status}
                  </Badge>
               </div>
            }
            actions={
               <div className="flex gap-2">
                  {cls.status === "DRAFT" && (
                     <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                        <Send className="h-4 w-4 mr-2" />
                        Gửi phê duyệt
                     </Button>
                  )}

                  {cls.status === "PENDING_APPROVAL" && (
                     <>
                        <Button
                           variant="outline"
                           className="text-destructive hover:bg-destructive/10"
                           onClick={() => setIsRejectDialogOpen(true)}
                        >
                           Từ chối
                        </Button>
                        <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                           <CheckCircle2 className="h-4 w-4 mr-2" />
                           Phê duyệt
                        </Button>
                     </>
                  )}

                  <Button asChild variant="outline" className="gap-2 shadow-sm">
                     <Link to={`/academy/classes/${id}/edit`}>
                        <Edit className="h-4 w-4" /> Chỉnh sửa lớp học
                     </Link>
                  </Button>
               </div>
            }
         />

         {cls.status === "DRAFT" && cls.rejectionReason && (
            <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Lớp học bị từ chối</AlertTitle>
               <AlertDescription>
                  Lý do: {cls.rejectionReason}
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
               <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-6 mb-6">
                     <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                     {cls.mode === "LIVE" && <TabsTrigger value="schedule">Lịch học ({schedules.length})</TabsTrigger>}
                     <TabsTrigger value="assessments">Bài kiểm tra ({assessments.length})</TabsTrigger>
                     <TabsTrigger value="attempts">Kết quả thi ({attempts.length})</TabsTrigger>
                     <TabsTrigger value="submissions">Bài nộp ({submissions.length})</TabsTrigger>
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
                              <div className="space-y-1">
                                 <p className="text-sm font-medium text-muted-foreground">Thời gian mở đăng ký</p>
                                 <p className="text-sm">
                                    {enrollmentOpenAt ? new Date(enrollmentOpenAt).toLocaleString("vi-VN") : "N/A"}
                                    {" → "}
                                    {enrollmentCloseAt ? new Date(enrollmentCloseAt).toLocaleString("vi-VN") : "N/A"}
                                 </p>
                              </div>
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

                  <TabsContent value="schedule">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div>
                              <CardTitle className="text-lg">Lịch học (Schedules)</CardTitle>
                              <CardDescription>Các ca học cố định trong tuần cho lớp này</CardDescription>
                           </div>
                           <Button size="sm" asChild className="gap-2">
                              <Link to={`/academy/live-schedule/new?liveClassId=${id}`}><Plus className="h-4 w-4" /> Thêm lịch</Link>
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
                                    <TableHead className="text-right">Hành động</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {isLoadingSchedules ? (
                                    <TableRow><TableCell colSpan={7} className="text-center">Đang tải...</TableCell></TableRow>
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
                                          <TableCell className="text-right">
                                             <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/academy/live-schedule/${s.id}/edit`}><Edit className="h-3.5 w-3.5" /></Link>
                                             </Button>
                                          </TableCell>
                                       </TableRow>
                                    ))
                                 ) : (
                                    <TableRow>
                                       <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">Chưa có lịch học nào</TableCell>
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
                              <CardTitle className="text-lg">Bài kiểm tra & Bài tập (Assessments)</CardTitle>
                              <CardDescription>Quản lý các instance bài kiểm tra riêng cho lớp này</CardDescription>
                           </div>
                           <Button size="sm" asChild className="gap-2">
                              <Link to={`/academy/class-assessments/new?classId=${id}`}><Plus className="h-4 w-4" /> Tạo Assessment</Link>
                           </Button>
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
                                 ) : assessments.length ? (
                                    assessments.map((a, idx) => (
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
                           <CardDescription>Chi tiết các lượt làm bài của học viên trong lớp</CardDescription>
                        </CardHeader>
                        <CardContent>
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
                                                <Link to={`/academy/exam-attempts/${att.id}`}><Info className="h-3.5 w-3.5" /></Link>
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
                        </CardContent>
                     </Card>
                  </TabsContent>

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
                                                <Link to={`/academy/assignment-submissions/${sub.id}`}><Info className="h-3.5 w-3.5" /></Link>
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
               </Tabs>
            </div>
         </div>

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
      </div>
   )
}

function formatWeekday(wd: number) {
   const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
   return days[wd] || "N/A"
}
