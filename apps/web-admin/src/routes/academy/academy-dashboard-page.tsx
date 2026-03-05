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
              <Link to="/academy/course-editions">Course Editions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiếp theo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Mình sẽ tiếp tục mở các page: Chapters, Classes, Offerings, Exams/Questions.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

