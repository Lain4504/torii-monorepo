import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/common/page-header"
import {
  BookOpen,
  Layers,
  FileText,
  FolderTree,
  ListChecks,
  Users,
  Calendar,
  ClipboardCheck,
  HelpCircle,
  GraduationCap,
  History,
  FileCheck,
  ShoppingBag,
  BarChart3,
  Search
} from "lucide-react"

export default function AcademyDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Academy Dashboard"
        subtitle="Quản trị nội dung học thuật, vận hành lớp học, đánh giá và báo cáo."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Quick Stats Section (Future integration) */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>Course Profiles</CardDescription>
            <CardTitle className="text-3xl font-bold">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Classes</CardDescription>
            <CardTitle className="text-3xl font-bold">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Enrollments</CardDescription>
            <CardTitle className="text-3xl font-bold">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Submissions</CardDescription>
            <CardTitle className="text-3xl font-bold">--</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Content Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Syllabus & Chương trình học
            </CardTitle>
            <CardDescription>Quản lý tài liệu, bài giảng và cấu trúc syllabus.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/course-profiles">
                <Layers className="h-4 w-4" /> Course Profiles
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/course-editions">
                <History className="h-4 w-4" /> Course Editions
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/chapters">
                <FolderTree className="h-4 w-4" /> Chapters
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/chapter-items">
                <ListChecks className="h-4 w-4" /> Chapter Items
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2 sm:col-span-2">
              <Link to="/academy/lessons">
                <FileText className="h-4 w-4" /> Quản lý bài học (Lessons)
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Class Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Vận hành lớp học
            </CardTitle>
            <CardDescription>Quản lý các đợt khai giảng, lịch học và ghi danh.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/classes">
                <GraduationCap className="h-4 w-4" /> Danh sách Lớp học
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/class-schedules">
                <Calendar className="h-4 w-4" /> Lịch học (Schedules)
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/enrollments">
                <Users className="h-4 w-4" /> Ghi danh (Enrollments)
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/reports">
                <BarChart3 className="h-4 w-4" /> Báo cáo học tập (BETA)
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Khảo thí & Đánh giá
            </CardTitle>
            <CardDescription>Ngân hàng câu hỏi, đề thi và chấm bài.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/questions">
                <HelpCircle className="h-4 w-4" /> Ngân hàng câu hỏi
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/exams">
                <FileCheck className="h-4 w-4" /> Đề thi (Exams)
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/quiz-templates">
                <Search className="h-4 w-4" /> Quiz Templates
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/assignment-templates">
                <FileText className="h-4 w-4" /> Assignment Templates
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/class-assessments">
                <ClipboardCheck className="h-4 w-4" /> Bài tập lớp (Class Assessments)
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link to="/academy/assignment-submissions">
                <FileCheck className="h-4 w-4" /> Chấm bài (Submissions)
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Commerce */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Gói bán & Thương mại
            </CardTitle>
            <CardDescription>Cấu hình sản phẩm, giá bán và các gói khóa học.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start gap-2">
              <Link to="/academy/course-offerings">
                <ShoppingBag className="h-4 w-4" /> Cấu hình Gói bán (Course Offerings)
              </Link>
            </Button>
            <div className="p-4 bg-muted/40 rounded-lg border border-dashed text-xs text-muted-foreground">
              Tip: Quản lý Coupon và Doanh thu chi tiết tại menu "Tài chính & Sales".
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


