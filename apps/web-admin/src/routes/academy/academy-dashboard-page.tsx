import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/common/page-header"

export default function AcademyDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy Dashboard"
        subtitle="Quản trị nội dung, lớp học, đánh giá và gói bán."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nội dung (Content)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/academy/course-profiles">Course Profiles</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/lessons">Lessons</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/course-editions">Course Editions</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/chapters">Chapters</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/chapter-items">Chapter Items</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery & Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/classes">Classes</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/class-schedules">Class Schedules</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/class-assessments">Class Assessments</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/questions">Question bank</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/exams">Exams</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/exam-attempts">Exam Attempts</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/academy/assignment-submissions">Assignment Submissions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

