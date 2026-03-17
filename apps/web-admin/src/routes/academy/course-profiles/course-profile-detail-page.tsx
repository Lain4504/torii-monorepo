import { useParams, Link } from "react-router-dom"
import { useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { PageHeader } from "@/components/common/page-header"
import { ChevronRight, BookOpen, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
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
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Tên khóa học</p>
                            <p className="text-sm font-medium">{profile.title}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Mã khóa (Code)</p>
                            <p className="text-sm font-mono">{profile.code}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Số lượng lớp học</p>
                            <p className="text-sm font-medium">{classes?.length || 0} lớp</p>
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
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 px-6">STT</TableHead>
                                <TableHead>Mã lớp</TableHead>
                                <TableHead>Tên lớp</TableHead>
                                <TableHead>Hình thức</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right px-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes?.map((cls, index) => (
                                <TableRow key={cls.id} className="group transition-colors">
                                    <TableCell className="px-6 text-muted-foreground tabular-nums">{index + 1}</TableCell>
                                    <TableCell className="font-mono text-xs font-bold">{cls.code}</TableCell>
                                    <TableCell className="font-medium">{cls.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="uppercase">{cls.mode}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={cls.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                            {cls.status === 'PUBLISHED' ? 'Đang hoạt động' : cls.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                        <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 hover:text-primary">
                                            <Link to={`/academy/classes/${cls.id}/detail`}>
                                                Chi tiết <ChevronRight className="size-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!classes || classes.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                                        Chưa có lớp học nào được tạo.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
