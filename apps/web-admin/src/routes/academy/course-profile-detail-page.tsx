import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useAcademyCourseProfile, useArchiveAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEditions } from "@/lib/api/services/academy-course-editions"
import { useAcademyLessons, useDeleteAcademyLesson } from "@/lib/api/services/academy-lessons"
import { useAcademyQuizTemplates, useDeleteAcademyQuizTemplate } from "@/lib/api/services/academy-quiz-templates"
import { useAcademyAssignmentTemplates, useDeleteAcademyAssignmentTemplate } from "@/lib/api/services/academy-assignment-templates"
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
  Eye,
  Archive,
  Layers,
  CheckCircle2,
  ArrowLeft,
  MoreVertical,
  BookOpen,
  HelpCircle,
  FileText,
  Clock,
  Video,
  Globe,
  Copy,
  Target
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

export default function CourseProfileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "editions"

  const { data: profile, isLoading: isLoadingProfile } = useAcademyCourseProfile(id!)
  const { data: editions = [], isLoading: isLoadingEditions } = useAcademyCourseEditions({ courseProfileId: id })

  // Resources queries
  const { data: lessons = [], isLoading: isLoadingLessons } = useAcademyLessons({ courseProfileId: id })
  const { data: quizzes = [], isLoading: isLoadingQuizzes } = useAcademyQuizTemplates({ courseProfileId: id })
  const { data: assignments = [], isLoading: isLoadingAssignments } = useAcademyAssignmentTemplates({ courseProfileId: id })

  const archiveMutation = useArchiveAcademyCourseProfile()
  const deleteLessonMutation = useDeleteAcademyLesson()
  const deleteQuizMutation = useDeleteAcademyQuizTemplate()
  const deleteAssignmentMutation = useDeleteAcademyAssignmentTemplate()

  const [deleteItem, setDeleteItem] = useState<{ type: 'lesson' | 'quiz' | 'assignment', id: string } | null>(null)

  const setTab = (val: string) => {
    setSearchParams({ tab: val }, { replace: true })
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      if (deleteItem.type === 'lesson') {
        await deleteLessonMutation.mutateAsync(deleteItem.id)
        toast.success("Đã xoá bài học")
      } else if (deleteItem.type === 'quiz') {
        await deleteQuizMutation.mutateAsync(deleteItem.id)
        toast.success("Đã xoá mẫu quiz")
      } else if (deleteItem.type === 'assignment') {
        await deleteAssignmentMutation.mutateAsync(deleteItem.id)
        toast.success("Đã xoá mẫu assignment")
      }
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
        subtitle={profile.shortTitle || profile.code}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to={`/academy/course-profiles/${id}/edit`}>
                <Edit className="h-4 w-4" /> Sửa Profile
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MoreVertical className="h-4 w-4" /> Thao tác
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={`/academy/course-editions/new?courseProfileId=${id}`}>
                    <Plus className="h-4 w-4 mr-2" /> Tạo Edition mới
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase text-[10px]">Phiên bản</p>
              <p className="text-2xl font-bold">{editions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase text-[10px]">Bài học</p>
              <p className="text-2xl font-bold">{lessons.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <HelpCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase text-[10px]">Trắc nghiệm</p>
              <p className="text-2xl font-bold">{quizzes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-600">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase text-[10px]">Bài tập</p>
              <p className="text-2xl font-bold">{assignments.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
          <TabsTrigger
            value="editions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Phiên bản (Editions)
          </TabsTrigger>
          <TabsTrigger
            value="lessons"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Bài học (Lessons)
          </TabsTrigger>
          <TabsTrigger
            value="quizzes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Quiz Templates
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Assignments
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Tổng quan & Metadata
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="h-5 w-5 text-muted-foreground" /> Các phiên bản chương trình (Editions)
                </CardTitle>
                <CardDescription>Quản lý các version nội dung của profile này.</CardDescription>
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link to={`/academy/course-editions/new?courseProfileId=${id}`}>
                  <Plus className="h-4 w-4" /> Thêm Edition mới
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">STT</TableHead>
                    <TableHead>Edition Tag</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hiện tại</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingEditions ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">Đang tải editions...</TableCell>
                    </TableRow>
                  ) : editions.length ? (
                    editions.map((ed, idx) => (
                      <TableRow key={ed.id}>
                        <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          <Link to={`/academy/course-editions/${ed.id}`} className="hover:underline">
                            {ed.editionTag}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={ed.status === "PUBLISHED" ? "default" : ed.status === "ARCHIVED" ? "secondary" : "outline"}
                          >
                            {ed.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ed.isCurrent ? (
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Đang sử dụng
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
                                <span className="sr-only">Mở menu thao tác</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem asChild>
                                <Link to={`/academy/course-editions/${ed.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  <span>Xem Syllabus</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/academy/course-editions/${ed.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  <span>Sửa Edition</span>
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                        Chưa có phiên bản nào được tạo cho profile này.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground" /> Danh sách bài học (Lessons)
                </CardTitle>
                <CardDescription>Các bài học thuộc profile này.</CardDescription>
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

        <TabsContent value="quizzes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" /> Ngân hàng Quiz Templates
                </CardTitle>
                <CardDescription>Các mẫu bài kiểm tra thuộc profile này.</CardDescription>
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link to={`/academy/quiz-templates/new?profileId=${id}`}>
                  <Plus className="h-4 w-4" /> Tạo Quiz Template
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">STT</TableHead>
                    <TableHead>Tên mẫu</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Lượt làm</TableHead>
                    <TableHead>Điểm đạt</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingQuizzes ? (
                    <TableRow><TableCell colSpan={6} className="text-center"><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                  ) : quizzes.length ? (
                    quizzes.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-semibold">{item.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="size-3.5" />
                            {item.defaultTimeLimitMinutes ? `${item.defaultTimeLimitMinutes} phút` : "Không giới hạn"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Copy className="size-3.5" />
                            {item.defaultMaxAttempts ? `${item.defaultMaxAttempts} lần` : "1 lần"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Target className="size-3.5" />
                            {item.defaultPassingScorePercent ? `${item.defaultPassingScorePercent}%` : "-"}
                          </div>
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
                                <Link to={`/academy/quiz-templates/${item.id}/edit`}>Sửa mẫu</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteItem({ type: 'quiz', id: item.id })}
                              >
                                Xoá mẫu
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có quiz template nào.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" /> Assignment Templates
                </CardTitle>
                <CardDescription>Các mẫu bài tập về nhà thuộc profile này.</CardDescription>
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link to={`/academy/assignment-templates/new?profileId=${id}`}>
                  <Plus className="h-4 w-4" /> Tạo Assignment
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">STT</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Loại nộp</TableHead>
                    <TableHead>Điểm tối đa</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAssignments ? (
                    <TableRow><TableCell colSpan={5} className="text-center"><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                  ) : assignments.length ? (
                    assignments.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-semibold">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.defaultType}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{item.defaultMaxScore || 100}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/academy/assignment-templates/${item.id}/edit`}>Sửa mẫu</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteItem({ type: 'assignment', id: item.id })}
                              >
                                Xoá mẫu
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có assignment template nào.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Mô tả & Giới thiệu</CardTitle>
                <CardDescription>Thông tin chi tiết về nội dung và mục tiêu của khóa học.</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.description ? (
                  <RichTextRenderer content={profile.description} />
                ) : (
                  <p className="text-muted-foreground italic">Chưa có mô tả chi tiết cho khóa học này.</p>
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
                    <p className="font-mono font-medium">{profile.code}</p>
                  </div>
                  <FieldSeparator />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">Chủ đề</p>
                    <p className="font-medium capitalize">{profile.subject || "N/A"}</p>
                  </div>
                  <FieldSeparator />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">Trình độ</p>
                    <Badge variant="secondary" className="mt-1">
                      {profile.level || "N/A"}
                    </Badge>
                  </div>
                  <FieldSeparator />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">Ngôn ngữ mặc định</p>
                    <p className="font-medium">{profile.defaultLanguage === "vi" ? "Tiếng Việt" : profile.defaultLanguage === "ja" ? "Tiếng Nhật" : profile.defaultLanguage === "en" ? "Tiếng Anh" : profile.defaultLanguage || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Layers className="size-4" /> Metadata Presets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-bold">Các trường Metadata mặc định:</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {profile.metadata && Object.entries(profile.metadata).length > 0 ? (
                        Object.entries(profile.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="font-normal bg-muted/50">
                            {key}: {String(value)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Chưa cấu hình metadata mặc định.</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
    </div>
  )
}
