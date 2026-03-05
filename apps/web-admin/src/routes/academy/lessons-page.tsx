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
      toast.success("Đã xoá lesson")
    } catch (e: any) {
      toast.error(e?.message || "Xoá thất bại")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Lessons"
        subtitle="Quản lý bài học (Video, HTML, Markdown...)"
        actions={
          <Button asChild>
            <Link to="/academy/lessons/new">Tạo mới</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Danh sách Lessons</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tiêu đề..."
              />
            </div>
            <div className="w-full sm:w-[300px]">
              <Select value={courseProfileId} onValueChange={setCourseProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo Course Profile" />
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
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Course Profile</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : data.length ? (
                data.map((item) => {
                  const profile = profiles.find((p) => p.id === item.courseProfileId)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.contentType}</TableCell>
                      <TableCell>
                        {profile ? (
                          <span title={profile.title}>{profile.code}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs font-mono">
                            {item.courseProfileId.slice(0, 8)}...
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/academy/lessons/${item.id}/edit`}>Sửa</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={del.isPending}
                            onClick={() => setDeleteId(item.id)}
                          >
                            Xoá
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Chưa có dữ liệu
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
            <AlertDialogTitle>Xoá Lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Lesson sẽ bị xoá vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
