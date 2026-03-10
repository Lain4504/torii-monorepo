import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useAcademyCourseProfile, useArchiveAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useAcademyLessons, useDeleteAcademyLesson } from "@/lib/api/services/academy-lessons"
import { toast } from "sonner"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@workspace/ui/components/table"
import {
  Edit,
  Plus,
  Archive,
  Layers,
  ArrowLeft,
  MoreVertical,
  BookOpen,
  FileText,
  Video,
  Globe,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Link } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { RichTextRenderer } from "@/components/editor/rich-text-editor"
import {
  FieldSeparator,
} from "@workspace/ui/components/field"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { format } from "date-fns"
import { useState } from "react"
import { EditCourseProfileDialog } from "@/components/academy/course-profile-dialog"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { useAcademyCourseOfferings } from "@/lib/api/services/academy-course-offerings"

export default function CourseProfileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const { data: profile, isLoading: isLoadingProfile } = useAcademyCourseProfile(id!)
  const { data: lessons = [], isLoading: isLoadingLessons } = useAcademyLessons({ courseProfileId: id })
  const { data: classes = [], isLoading: isLoadingClasses } = useAcademyClasses({ courseProfileId: id } as any)
  const { data: offerings = [], isLoading: isLoadingOfferings } = useAcademyCourseOfferings({ courseProfileId: id } as any)

  const archiveMutation = useArchiveAcademyCourseProfile()
  const deleteLessonMutation = useDeleteAcademyLesson()
  const [deleteItem, setDeleteItem] = useState<{ type: 'lesson', id: string } | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const setTab = (val: string) => {
    setSearchParams({ tab: val }, { replace: true })
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      await deleteLessonMutation.mutateAsync(deleteItem.id)
      toast.success("Đã xoá bài học")
    } catch (e: any) {
      toast.error(e?.message || "Xoá thất bại")
    } finally {
      setDeleteItem(null)
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <Video className="size-3.5" />
      case "HTML": return <Globe className="size-3.5" />
      case "MARKDOWN": return <FileText className="size-3.5" />
      default: return <BookOpen className="size-3.5" />
    }
  }

  if (isLoadingProfile) return <div className="p-8 text-center">Đang tải profile...</div>
  if (!profile) return <div className="p-8 text-center text-destructive">Không tìm thấy profile</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/academy/course-profiles")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>

      <PageHeader
        title={profile.title}
        subtitle={profile.code}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="h-4 w-4" /> Sửa Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MoreVertical className="h-4 w-4" /> Thao tác
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={`/academy/classes/new?courseProfileId=${id}`}>
                    <Plus className="h-4 w-4 mr-2" /> Mở lớp mới
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/academy/course-offerings/new?courseProfileId=${id}`}>
                    <Layers className="h-4 w-4 mr-2" /> Tạo gói bán (Offering)
                  </Link>
                </DropdownMenuItem>
                <FieldSeparator className="my-1" />
                {!((profile as any)?.metadata as any)?.isArchived && (
                  <DropdownMenuItem
                    className="text-warning"
                    onClick={async () => {
                      try {
                        await archiveMutation.mutateAsync(id!)
                        toast.success("Đã lưu trữ profile")
                      } catch (error: any) {
                        toast.error("Lưu trữ thất bại")
                      }
                    }}
                  >
                    <Archive className="h-4 w-4 mr-2" /> Lưu trữ Profile
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-500/5 border-blue-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase text-[10px]">Lesson bank</p>
              <p className="text-2xl font-bold">{lessons.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase text-[10px]">Trình độ</p>
              <p className="text-2xl font-bold">{profile.level || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Tổng quan
          </TabsTrigger>
          <TabsTrigger
            value="lessons"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Bài học (Lesson Bank)
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Lớp học (Classes)
          </TabsTrigger>
          <TabsTrigger
            value="offerings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Gói bán (Offerings)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Mô tả & Giới thiệu</CardTitle>
                <CardDescription>Thông tin chi tiết về nội dung và mục tiêu của Course Profile này.</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.description ? (
                  <RichTextRenderer content={profile.description} />
                ) : (
                  <p className="text-muted-foreground italic">
                    Chưa có mô tả chi tiết cho Course Profile này.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <BookOpen className="size-4" /> Chi tiết Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">Mã khóa học</p>
                    <p className="font-mono font-medium break-all">{profile.code}</p>
                  </div>
                  <FieldSeparator />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">Trình độ</p>
                    <Badge variant="secondary" className="mt-1">
                      {profile.level || "N/A"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Flow triển khai từ Profile
                  </CardTitle>
                  <CardDescription>
                    Hướng dẫn 3 bước chính để đi từ Course Profile tới gói bán hoàn chỉnh.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-1">
                    <p className="font-semibold">Bước 1: Xây Lesson Bank</p>
                    <p className="text-muted-foreground">
                      Tạo các bài học gốc cho chương trình này. Các lớp sẽ dùng lại Lesson Bank khi ráp Syllabus.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full justify-start gap-2"
                      onClick={() => setTab("lessons")}
                    >
                      <BookOpen className="h-4 w-4" />
                      Đi tới tab Lesson Bank
                    </Button>
                  </div>
                  <FieldSeparator />
                  <div className="space-y-1">
                    <p className="font-semibold">Bước 2: Mở lớp & build Syllabus</p>
                    <p className="text-muted-foreground">
                      Tạo các lớp VOD / LIVE gắn với Profile này, mỗi lớp sở hữu Syllabus riêng (Module + Item).
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full justify-start gap-2"
                      onClick={() => setTab("classes")}
                    >
                      <Layers className="h-4 w-4" />
                      Xem danh sách lớp từ Profile
                    </Button>
                  </div>
                  <FieldSeparator />
                  <div className="space-y-1">
                    <p className="font-semibold">Bước 3: Tạo Course Offering để bán</p>
                    <p className="text-muted-foreground">
                      Đóng gói 1 hoặc nhiều lớp thành gói bán, cấu hình giá và thời gian bán.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full justify-start gap-2"
                      onClick={() => setTab("offerings")}
                    >
                      <Layers className="h-4 w-4" />
                      Quản lý gói bán (Offerings)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground" /> Ngân hàng bài học (Lesson Bank)
                </CardTitle>
                <CardDescription>
                  Các bài học gốc thuộc Course Profile này, dùng để ráp vào Syllabus của từng lớp.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link to={`/academy/lessons/new?profileId=${id}`}>
                  <Plus className="h-4 w-4" /> Tạo Lesson mới
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">STT</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLessons ? (
                    <TableRow><TableCell colSpan={5} className="text-center"><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                  ) : lessons.length ? (
                    lessons.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-semibold">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal gap-1.5 shadow-none">
                            {getContentTypeIcon(item.contentType)} {item.contentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {format(new Date(item.createdAt), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/academy/lessons/${item.id}/edit`}>Sửa bài học</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteItem({ type: 'lesson', id: item.id })}
                              >
                                Xoá bài học
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có bài học nào.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="h-5 w-5 text-muted-foreground" /> Lớp học (Classes) từ Profile này
                </CardTitle>
                <CardDescription>
                  Mỗi lớp sở hữu Syllabus riêng, được ráp từ Lesson Bank hoặc soạn mới cho từng đợt.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link to={`/academy/classes/new?courseProfileId=${id}`}>
                  <Plus className="h-4 w-4" /> Mở lớp mới
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">STT</TableHead>
                    <TableHead>Mã lớp</TableHead>
                    <TableHead>Tên lớp</TableHead>
                    <TableHead>Hình thức</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingClasses ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ) : classes.length ? (
                    classes.map((cls: any, idx: number) => (
                      <TableRow key={cls.id}>
                        <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <Link to={`/academy/classes/${cls.id}`} className="hover:underline text-primary">
                            {cls.code}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link to={`/academy/classes/${cls.id}`} className="hover:underline font-medium">
                            {cls.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {cls.mode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-[10px]">
                            {cls.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/academy/classes/${cls.id}`}>Chi tiết lớp</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/academy/classes/${cls.id}/syllabus`}>Syllabus</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Chưa có lớp nào được mở từ Course Profile này.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offerings" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="h-5 w-5 text-muted-foreground" /> Gói bán (Course Offerings)
                </CardTitle>
                <CardDescription>
                  Các gói bán gắn với Course Profile này, mỗi gói có thể bao gồm một hoặc nhiều lớp.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link to={`/academy/course-offerings/new?courseProfileId=${id}`}>
                  <Plus className="h-4 w-4" /> Tạo gói bán
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">STT</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Số lớp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingOfferings ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ) : offerings.length ? (
                    offerings.map((off: any, idx: number) => (
                      <TableRow key={off.id}>
                        <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <Link to={`/academy/course-offerings/${off.id}`} className="hover:underline text-primary">
                            {off.code}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link to={`/academy/course-offerings/${off.id}`} className="hover:underline font-medium">
                            {off.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {(off.classes || []).length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-[10px]">
                            {off.status || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/academy/course-offerings/${off.id}`}>
                                  Xem chi tiết
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/academy/course-offerings/${off.id}/edit`}>
                                  Sửa thông tin
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Chưa có gói bán nào cho Course Profile này.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xoá vĩnh viễn tài nguyên này và không thể hoàn tác. Các chương trình học đang sử dụng tài nguyên này có thể bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xác nhận Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditCourseProfileDialog
        id={id}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}
