import { useNavigate, useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "sonner"
import { PageHeader } from "@/components/common/page-header"
import { CourseEditionForm } from "@/components/academy/course-edition-form"
import {
  useAcademyCourseEdition,
  useUpdateAcademyCourseEdition,
} from "@/lib/api/services/academy-course-editions"
import { useAcademyChapters } from "@/lib/api/services/academy-chapters"
import type { AcademyCourseEditionUpdateDTO } from "@workspace/schemas"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { SyllabusBuilder } from "@/components/academy/syllabus-builder"

export default function AcademyCourseEditionEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyCourseEdition(id)
  const { data: chapters = [], isLoading: isLoadingChapters } = useAcademyChapters({ courseEditionId: id })
  const update = useUpdateAcademyCourseEdition()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Course Edition"
        subtitle="Chỉnh sửa phiên bản syllabus."
      />

      {isLoading || !item ? (
        <Card>
          <CardContent>Đang tải...</CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Chi tiết</TabsTrigger>
            <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin</CardTitle>
              </CardHeader>
              <CardContent>
                <CourseEditionForm
                  mode="edit"
                  initial={item}
                  submitting={update.isPending}
                  onCancel={() => nav("/academy/course-editions")}
                  onSubmit={async (data) => {
                    await update.mutateAsync({
                      id: item.id,
                      input: data as AcademyCourseEditionUpdateDTO,
                    })
                    toast.success("Đã cập nhật")
                    nav("/academy/course-editions")
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="syllabus">
            {isLoadingChapters ? (
              <Card><CardContent>Đang tải chapters...</CardContent></Card>
            ) : chapters.length > 0 ? (
              <div className="space-y-6">
                {chapters.map((chapter: any) => (
                  <SyllabusBuilder key={chapter.id} chapter={chapter} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed py-12">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="space-y-1">
                    <p className="font-medium text-muted-foreground">Chưa có nội dung chương trình</p>
                  </div>
                  <Button asChild size="sm">
                    <Link to={`/academy/chapters/new?courseEditionId=${id}`}>
                      Thêm Chapter đầu tiên
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

