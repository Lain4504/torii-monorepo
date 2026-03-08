import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useAcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Plus,
  ArrowLeft,
  LayoutList,
  BookOpen,
  FileText,
  HelpCircle,
} from "lucide-react"
import { SyllabusBuilder } from "@/components/academy/syllabus-builder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

export default function CourseEditionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "syllabus"

  const { data: edition, isLoading } = useAcademyCourseEdition(id!)

  if (isLoading) return <div>Loading...</div>
  if (!edition) return <div>Edition not found</div>

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{edition.title}</h1>
            <Badge variant={edition.isCurrent ? "default" : "secondary"}>
              {edition.isCurrent ? "Current" : "Draft"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Version: {edition.version}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="syllabus" className="gap-2">
            <LayoutList className="h-4 w-4" />
            Syllabus
          </TabsTrigger>
          <TabsTrigger value="lessons" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <FileText className="h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="syllabus">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Cấu trúc khóa học (Syllabus)</h2>
                <p className="text-sm text-muted-foreground">Quản lý các chương học và nội dung đào tạo.</p>
              </div>
              <Button onClick={() => navigate(`/academy/chapters/new?courseEditionId=${id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm chương học
              </Button>
            </div>
            <SyllabusBuilder editionId={id!} />
          </TabsContent>

          <TabsContent value="lessons">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Danh sách bài học (Lessons)</h2>
              <Button onClick={() => navigate(`/academy/lessons/new?profileId=${edition.courseProfileId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Lesson mới
              </Button>
            </div>
            <div className="text-center py-10 bg-muted/20 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Danh sách lesson của profile này sẽ hiển thị ở đây (Filter theo profileId)</p>
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Ngân hàng câu hỏi & Quiz</h2>
              <Button onClick={() => navigate(`/academy/quiz-templates/new?profileId=${edition.courseProfileId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Quiz mới
              </Button>
            </div>
            <div className="text-center py-10 bg-muted/20 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Danh sách quiz template của profile này sẽ hiển thị ở đây</p>
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Bài tập về nhà (Assignments)</h2>
              <Button onClick={() => navigate(`/academy/assignment-templates/new?profileId=${edition.courseProfileId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Assignment mới
              </Button>
            </div>
            <div className="text-center py-10 bg-muted/20 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Danh sách bài tập của profile này sẽ hiển thị ở đây</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
