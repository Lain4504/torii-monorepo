import { useParams, Link } from "react-router-dom"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { PageHeader } from "@/components/common/page-header"
import { ChevronRight, BookOpen, Layers, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"

export default function CourseProfileDetailPage() {
  const { profileId } = useParams<{ profileId: string }>()
  
  const { data: profile, isLoading: isLoadingProfile } = useAcademyCourseProfile(profileId)
  const { data: classes } = useAcademyClasses({ courseProfileId: profileId } as any)

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!profile) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy thông tin khóa học.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link
              to="/academy/course-profiles"
              className="hover:underline text-muted-foreground transition-colors"
            >
              Khóa học
            </Link>
            <ChevronRight className="size-4" />
            <span>Chi tiết khóa học</span>
          </div>
        }
        subtitle={`Quản lý chương trình học và các lớp của khóa ${profile.title}`}
        stats={[
          { label: "Mã khóa", value: profile.code },
          { label: "Số lớp", value: classes?.length || 0 },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
                <Layers className="size-4" /> Tổng số lớp học
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{classes?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info" className="gap-2">
            <BookOpen className="size-4" /> Thông tin chung
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-2">
            <Users className="size-4" /> Danh sách lớp học
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="info">
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin khóa học</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Tên khóa học</p>
                            <p className="text-sm font-medium">{profile.title}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Mã khóa (Code)</p>
                            <p className="text-sm font-mono">{profile.code}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Mô tả</p>
                        <p className="text-sm text-balance">{profile.description || 'Không có mô tả'}</p>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes">
             <Card>
                <CardHeader>
                    <CardTitle>Các lớp học thuộc khóa này</CardTitle>
                    <CardDescription>Danh sách các lớp học hiện có của khóa {profile.title}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {classes?.map((cls) => (
                            <Link 
                                key={cls.id} 
                                to={`/academy/classes/${cls.id}/detail`}
                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-medium">{cls.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{cls.code}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline">{cls.mode}</Badge>
                                    <Badge variant={cls.status === 'PUBLISHED' ? 'default' : 'secondary'}>{cls.status}</Badge>
                                    <ChevronRight className="size-4 text-muted-foreground" />
                                </div>
                            </Link>
                        ))}
                        {(!classes || classes.length === 0) && (
                            <p className="text-sm text-muted-foreground italic text-center py-8">Chưa có lớp học nào được tạo.</p>
                        )}
                    </div>
                </CardContent>
             </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
