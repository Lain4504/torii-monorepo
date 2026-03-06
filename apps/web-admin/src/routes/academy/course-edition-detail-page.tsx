import { useNavigate, useParams } from "react-router-dom"
import { useAcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import { useAcademyChapters } from "@/lib/api/services/academy-chapters"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { 
  Plus, 
  ArrowLeft, 
  LayoutList, 
  GripVertical, 
  Edit, 
  Eye, 
  Trash2, 
  BookOpen, 
  Clock, 
  Settings, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react"
import { Link } from "react-router-dom"
import { SyllabusBuilder } from "@/components/academy/syllabus-builder"

export default function CourseEditionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: edition, isLoading: isLoadingEdition } = useAcademyCourseEdition(id!)
  const { data: chapters = [], isLoading: isLoadingChapters } = useAcademyChapters({ courseEditionId: id })

  if (isLoadingEdition) return <div className="p-8 text-center">Đang tải edition...</div>
  if (!edition) return <div className="p-8 text-center text-destructive">Không tìm thấy edition</div>

  // Tính tổng số chapter/lesson cơ bản
  const totalChapters = chapters.length
  const totalEstimatedMinutes = chapters.reduce((acc, ch) => acc + (ch.estimatedMinutes || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/academy/course-profiles/${edition.courseProfileId}`)} 
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại Course Profile
        </Button>
      </div>

      <PageHeader
        title={`Syllabus: Edition ${edition.editionTag}`}
        subtitle={`Phiên bản dành cho Course Profile ID: ${edition.courseProfileId}`}
        actions={
          <div className="flex gap-2">
             <Button asChild variant="outline" size="sm" className="gap-2">
                <Link to={`/academy/course-editions/${id}/edit`}>
                  <Settings className="h-4 w-4" /> Chỉnh sửa Edition
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-2">
                <Link to={`/academy/chapters/new?courseEditionId=${id}`}>
                  <Plus className="h-4 w-4" /> Thêm Chapter
                </Link>
              </Button>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Trạng thái Edition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={edition.status === "PUBLISHED" ? "default" : edition.status === "ARCHIVED" ? "secondary" : "outline"}
                    className="w-fit"
                  >
                    {edition.status}
                  </Badge>
                  {edition.isCurrent && (
                     <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 gap-1 text-[10px] h-5">
                       <CheckCircle2 className="h-2 w-2" /> Current
                     </Badge>
                  )}
                </div>
                <div className="space-y-1 mt-2">
                   <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <LayoutList className="h-3 w-3" /> {totalChapters} Chapters
                   </div>
                   <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {totalEstimatedMinutes} Phút dự tính
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium">Phím tắt Chapter</CardTitle>
               <CardDescription className="text-[10px]">Nhấn để cuộn nhanh</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-1">
                  {chapters.map((ch, idx) => (
                    <button 
                      key={ch.id} 
                      className="text-left text-xs p-2 hover:bg-muted rounded-md border border-transparent hover:border-border truncate"
                      onClick={() => {
                        const el = document.getElementById(`chapter-${ch.id}`)
                        el?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      {idx + 1}. {ch.title}
                    </button>
                  ))}
                  {!chapters.length && <p className="text-xs text-muted-foreground italic">Chưa có chapter</p>}
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          {isLoadingChapters ? (
            <div className="p-8 text-center text-muted-foreground">Đang tải chapters...</div>
          ) : (
            <div className="space-y-6">
              {chapters.length > 0 ? (
                chapters.map((chapter) => (
                  <SyllabusBuilder key={chapter.id} chapter={chapter} />
                ))
              ) : (
                <Card className="border-dashed py-12">
                   <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                      <BookOpen className="h-12 w-12 text-muted-foreground opacity-20" />
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground">Chưa có nội dung chương trình</p>
                        <p className="text-sm text-muted-foreground">Bắt đầu bằng cách thêm một Chapter đầu tiên.</p>
                      </div>
                      <Button asChild size="sm">
                        <Link to={`/academy/chapters/new?courseEditionId=${id}`}>
                          <Plus className="h-4 w-4 mr-2" /> Thêm Chapter đầu tiên
                        </Link>
                      </Button>
                   </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
