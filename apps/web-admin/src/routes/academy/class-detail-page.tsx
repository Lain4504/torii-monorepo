import { useNavigate, useParams, Link } from "react-router-dom"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import { useAcademyClassSchedules } from "@/lib/api/services/academy-class-schedules"
import { useAcademyClassAssessments } from "@/lib/api/services/academy-class-assessments"
import { useAcademyEnrollments } from "@/lib/api/services/academy-enrollments"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
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
  Users, 
  Calendar, 
  FileCheck, 
  Info, 
  ArrowLeft,
  Clock,
  MapPin,
  Trophy,
  History,
  Link as LinkIcon
} from "lucide-react"
import { Link } from "react-router-dom"

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: cls, isLoading: isLoadingClass } = useAcademyClass(id!)
  const { data: profile } = useAcademyCourseProfile(cls?.courseProfileId)
  const { data: edition } = useAcademyCourseEdition(cls?.courseEditionId)
  const { data: schedules = [], isLoading: isLoadingSchedules } = useAcademyClassSchedules({ classId: id })
  const { data: assessments = [], isLoading: isLoadingAssessments } = useAcademyClassAssessments({ classId: id })
  const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useAcademyEnrollments({ classId: id })

  // Giả sử API trả về structure { items, total } cho enrollments
  const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData as any)?.items || []

  if (isLoadingClass) return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải thông tin lớp học...</div>
  if (!cls) return <div className="p-8 text-center text-destructive flex flex-col items-center gap-4">
    <Info className="h-12 w-12" />
    <p>Không tìm thấy lớp học</p>
    <Button onClick={() => navigate("/academy/classes")}>Quay lại</Button>
  </div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/academy/classes")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>

      <PageHeader
        title={cls.name}
        subtitle={`Mã lớp: ${cls.code} | Mode: ${cls.mode} | Trạng thái: ${cls.status}`}
        actions={
          <Button asChild variant="outline" className="gap-2 shadow-sm">
            <Link to={`/academy/classes/${id}/edit`}>
              <Edit className="h-4 w-4" /> Chỉnh sửa lớp học
            </Link>
          </Button>
        }
      />

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
                  <p className="text-2xl font-bold">{cls.maxStudents || "∞"}</p>
               </div>
            </div>
            <div className="pt-4 border-t space-y-3">
               <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Bắt đầu</span>
                  <span className="font-medium">{cls.startDate ? new Date(cls.startDate).toLocaleDateString("vi-VN") : "N/A"}</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Kết thúc</span>
                  <span className="font-medium">{cls.endDate ? new Date(cls.endDate).toLocaleDateString("vi-VN") : "N/A"}</span>
               </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="schedule">Lịch học ({schedules.length})</TabsTrigger>
              <TabsTrigger value="assessments">Bài kiểm tra ({assessments.length})</TabsTrigger>
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
                           <p className="text-sm font-semibold">{cls.term} / {cls.batch}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-sm font-medium text-muted-foreground">Thời gian mở đăng ký</p>
                           <p className="text-sm">
                              {cls.enrollmentOpenAt ? new Date(cls.enrollmentOpenAt).toLocaleString("vi-VN") : "N/A"} 
                              {" → "}
                              {cls.enrollmentCloseAt ? new Date(cls.enrollmentCloseAt).toLocaleString("vi-VN") : "N/A"}
                           </p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <p className="text-sm font-medium text-muted-foreground">Giảng viên chính</p>
                           <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">GV</div>
                              <span className="text-sm">Chưa có thông tin định danh</span>
                           </div>
                        </div>
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
                     <Link to={`/academy/class-schedules/new?classId=${id}`}><Plus className="h-4 w-4" /> Thêm lịch</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Thứ (Weekday)</TableHead>
                        <TableHead>Giờ bắt đầu</TableHead>
                        <TableHead>Giờ kết thúc</TableHead>
                        <TableHead>Địa điểm / Link</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingSchedules ? (
                        <TableRow><TableCell colSpan={5} className="text-center">Đang tải...</TableCell></TableRow>
                      ) : schedules.length ? (
                        schedules.map((s) => (
                           <TableRow key={s.id}>
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
                                    <Link to={`/academy/class-schedules/${s.id}/edit`}><Edit className="h-3.5 w-3.5" /></Link>
                                 </Button>
                              </TableCell>
                           </TableRow>
                        ))
                      ) : (
                        <TableRow>
                           <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">Chưa có lịch học nào</TableCell>
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
                         <TableRow><TableCell colSpan={6} className="text-center">Đang tải...</TableCell></TableRow>
                      ) : assessments.length ? (
                        assessments.map((a) => (
                           <TableRow key={a.id}>
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
                           <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">Chưa có Assessment nào</TableCell>
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
    </div>
  )
}

function formatWeekday(wd: number) {
   const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
   return days[wd] || "N/A"
}
