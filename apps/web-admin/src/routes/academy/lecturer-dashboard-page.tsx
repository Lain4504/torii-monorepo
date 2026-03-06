import { useNavigate } from "react-router-dom"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/common/page-header"
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  FileCheck,
  ArrowRight,
  BookOpen,
  Trophy,
  History
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@workspace/schemas"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"

export default function LecturerDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Filter classes where this user is the lecturer (if API supports it)
  // For now, we fetch all but we should ideally filter by lecturerId: user.id
  const { data: classes = [], isLoading } = useAcademyClasses({ 
    status: "ACTIVE" 
    // lecturerId: user?.id 
  })

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        title={`Xin chào, ${user?.displayName || "Giảng viên"}`}
        subtitle="Chào mừng bạn quay lại hệ thống quản lý giảng dạy."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
               <GraduationCap className="h-4 w-4" /> Lớp học đang dạy
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{isLoading ? "..." : classes.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
               <Users className="h-4 w-4" /> Tổng số học viên
            </CardDescription>
            <CardTitle className="text-3xl font-bold">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
               <ClipboardCheck className="h-4 w-4" /> Bài tập cần chấm
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-orange-600">--</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2">
         <BookOpen className="h-5 w-5 text-primary" />
         Lớp học của tôi
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
           [1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse h-40 bg-muted" />
           ))
        ) : classes.length > 0 ? (
           classes.map(cls => (
              <Card key={cls.id} className="group hover:border-primary/50 transition-colors shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2">{cls.code}</Badge>
                    <Badge className="bg-emerald-500">{cls.status}</Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{cls.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 pt-1">
                     <Calendar className="h-3.5 w-3.5" />
                     {cls.startDate ? new Date(cls.startDate).toLocaleDateString("vi-VN") : "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button variant="ghost" className="w-full justify-between items-center group/btn" onClick={() => navigate(`/academy/classes/${cls.id}`)}>
                    Chi tiết giảng dạy
                    <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
           ))
        ) : (
           <Card className="md:col-span-3 border-dashed py-12 flex flex-col items-center justify-center text-muted-foreground">
              <History className="h-12 w-12 mb-4 opacity-20" />
              <p>Bạn hiện chưa được phân công giảng dạy lớp nào.</p>
           </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Công cụ giảng dạy
               </CardTitle>
               <CardDescription>Các liên kết nhanh cho hoạt động thường ngày.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <Button variant="outline" className="justify-start gap-2" onClick={() => navigate('/academy/assignment-submissions')}>
                  <Trophy className="h-4 w-4" /> Chấm bài tập
               </Button>
               <Button variant="outline" className="justify-start gap-2" onClick={() => navigate('/academy/exam-attempts')}>
                  <FileCheck className="h-4 w-4" /> Xem kết quả thi
               </Button>
               <Button variant="outline" className="justify-start gap-2" onClick={() => navigate('/academy/questions')}>
                  <HelpCircle className="h-4 w-4" /> Soạn câu hỏi
               </Button>
               <Button variant="outline" className="justify-start gap-2" onClick={() => navigate('/academy/lessons')}>
                  <BookOpen className="h-4 w-4" /> Bài giảng
               </Button>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Lịch trình sắp tới
               </CardTitle>
               <CardDescription>Xem lịch dạy trong tuần của bạn.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="text-sm text-muted-foreground italic py-8 text-center border rounded-lg">
                  Tính năng lịch dạy tích hợp sẽ sớm có mặt.
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}

function Badge({ children, className, variant = "default" }: any) {
   const variants: any = {
      default: "bg-primary text-primary-foreground",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground"
   }
   return (
      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
         {children}
      </div>
   )
}

function CardFooter({ children, className }: any) {
   return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>
}
