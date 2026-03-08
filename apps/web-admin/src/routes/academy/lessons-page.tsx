import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { PageHeader } from "@/components/common/page-header"
import {
  useAcademyLessons,
  useDeleteAcademyLesson,
} from "@/lib/api/services/academy-lessons"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { toast } from "sonner"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical, Search, Filter, Layout, BookOpen, Clock, FileText, Video, Globe } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { format } from "date-fns"

export default function AcademyLessonsPage() {
  const [q, setQ] = useState("")
  const [courseProfileId, setCourseProfileId] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: profiles = [] } = useAcademyCourseProfiles({})

  const query = useMemo(
    () => ({
      q: q || undefined,
      courseProfileId: courseProfileId === "all" ? undefined : courseProfileId,
    }),
    [q, courseProfileId],
  )
  const { data = [], isLoading } = useAcademyLessons(query)
  const del = useDeleteAcademyLesson()

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await del.mutateAsync(deleteId)
      toast.success("Đã xoá bài học thành công")
    } catch (e: any) {
      toast.error(e?.message || "Xoá bài học thất bại")
    } finally {
      setDeleteId(null)
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Kho bài học"
        subtitle="Quản lý kho nội dung học tập (Video, HTML, Markdown...)."
        actions={
          <Button asChild>
            <Link to="/academy/lessons/new">Tạo bài học mới</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Bài học</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm tiêu đề bài học..."
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-[300px]">
              <Select value={courseProfileId} onValueChange={setCourseProfileId}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Layout className="size-4 text-muted-foreground" />
                    <SelectValue placeholder="Lọc theo Course Profile" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Course Profile</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} - {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">STT</TableHead>
                <TableHead>Tiêu đề bài học</TableHead>
                <TableHead>Loại nội dung</TableHead>
                <TableHead>Course Profile</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : data.length ? (
                data.map((item, idx) => {
                  const profile = profiles.find((p) => p.id === item.courseProfileId)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                      <TableCell className="font-semibold">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal gap-1.5 shadow-none">
                          {getContentTypeIcon(item.contentType)}
                          {item.contentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {profile ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{profile.code}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{profile.title}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs font-mono">
                            {item.courseProfileId.slice(0, 8)}...
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />
                          {format(new Date(item.createdAt), "dd/MM/yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              size="icon"
                            >
                              <span className="sr-only">Mở menu thao tác</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                              <Link to={`/academy/lessons/${item.id}/edit`}>
                                Sửa bài học
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(item.id)}
                            >
                              Xoá bài học
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Chưa có bài học nào được tạo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Bài học?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn nội dung bài học khỏi hệ thống. Các chương trình học đang sử dụng bài học này có thể bị ảnh hưởng.
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
