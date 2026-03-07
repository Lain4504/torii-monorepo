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
import { PageHeader } from "@/components/common/page-header"
import { toast } from "@workspace/ui/components/sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
  useAcademyClasses,
  useDeleteAcademyClass,
} from "@/lib/api/services/academy-classes"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEditions } from "@/lib/api/services/academy-course-editions"

export default function AcademyClassesPage() {
  const [courseProfileId, setCourseProfileId] = useState("")
  const [courseEditionId, setCourseEditionId] = useState("")
  const [mode, setMode] = useState("")
  const [status, setStatus] = useState("")
  const [q, setQ] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: profilesData = [] } = useAcademyCourseProfiles({})
  const profiles = Array.isArray(profilesData) ? profilesData : (profilesData as any)?.items || []

  const { data: editionsData = [] } = useAcademyCourseEditions({})
  const editions = Array.isArray(editionsData) ? editionsData : (editionsData as any)?.items || []

  const filteredEditions = useMemo(() => {
    if (!courseProfileId) return editions
    return editions.filter((e: any) => e.courseProfileId === courseProfileId)
  }, [courseProfileId, editions])

  const query = useMemo(
    () => ({
      courseProfileId: courseProfileId && courseProfileId !== "_all" ? courseProfileId : undefined,
      courseEditionId: courseEditionId && courseEditionId !== "_all" ? courseEditionId : undefined,
      mode: mode && mode !== "_all" ? mode : undefined,
      status: status && status !== "_all" ? status : undefined,
      q: q || undefined,
    }),
    [courseProfileId, courseEditionId, mode, status, q],
  )

  const { data = [], isLoading } = useAcademyClasses(query)
  const del = useDeleteAcademyClass()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Classes"
        subtitle="Các lớp học cụ thể gắn với CourseProfile/CourseEdition."
        actions={
          <Button asChild>
            <Link to="/academy/classes/new">Tạo mới</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Danh sách</CardTitle>
          <div className="flex flex-col gap-2 md:grid md:grid-cols-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo code/name..."
            />
            <Select value={courseProfileId} onValueChange={(v) => { setCourseProfileId(v); setCourseEditionId("") }}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả Course Profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tất cả Profile</SelectItem>
                {profiles.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={courseEditionId} onValueChange={setCourseEditionId}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả Edition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tất cả Edition</SelectItem>
                {filteredEditions.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>{e.editionTag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <SelectValue placeholder="Hình thức học (Mode)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tất cả Mode</SelectItem>
                <SelectItem value="VOD">VOD</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="BLENDED">Blended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tất cả Trạng thái</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ENROLLING">Enrolling</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">STT</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Term/Batch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>Đang tải...</TableCell>
                </TableRow>
              ) : data.length ? (
                data.map((it, idx) => (
                  <TableRow key={it.id}>
                    <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <Link to={`/academy/classes/${it.id}`} className="hover:underline text-primary">
                        {it.code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/academy/classes/${it.id}`} className="hover:underline font-medium">
                        {it.name}
                      </Link>
                    </TableCell>
                    <TableCell>{it.mode}</TableCell>
                    <TableCell>
                      {it.term ?? "-"} / {it.batch ?? "-"}
                    </TableCell>
                    <TableCell>{it.status ?? "-"}</TableCell>
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
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link to={`/academy/classes/${it.id}/edit`}>
                              Sửa
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(it.id)}
                          >
                            Xoá
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>Chưa có dữ liệu</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Class</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn Class và có thể ảnh hưởng đến enrollment/certificates
              liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return
                try {
                  await del.mutateAsync(deleteId)
                  toast.success("Đã xoá")
                } catch (e: any) {
                  toast.error(e?.message || "Xoá thất bại")
                } finally {
                  setDeleteId(null)
                }
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

