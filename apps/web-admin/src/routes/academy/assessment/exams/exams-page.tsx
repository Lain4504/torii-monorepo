import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAcademyExams, useDeleteAcademyExam } from "@/lib/api/services/academy-exams"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@workspace/ui/components/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
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
import { Badge } from "@workspace/ui/components/badge"
import { Plus, Search, Edit2, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function ExamsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("ALL")
  const [type, setType] = useState<string>("ALL")
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const { data: exams, isLoading } = useAcademyExams({
    q: search || undefined,
    status: status === "ALL" ? undefined : status as any,
    examType: type === "ALL" ? undefined : type as any,
  })

  const deleteMutation = useDeleteAcademyExam()

  const handleDelete = async () => {
    if (!deleteTargetId) return
    try {
      await deleteMutation.mutateAsync(deleteTargetId)
      toast.success("Xóa đề thi thành công")
    } catch (error: any) {
      toast.error(error.userMessage || error.message || "Không thể xóa đề thi")
    } finally {
      setDeleteTargetId(null)
    }
  }

  const handleEdit = (id: string) => {
    navigate(`${id}`)
  }

  const handleCreate = () => {
    navigate("new")
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader 
          title="Danh sách đề thi" 
          subtitle="Quản lý cấu trúc đề thi, phân đoạn (sections) và điểm số."
          actions={
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo đề thi mới
            </Button>
          }
        />

        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm theo tiêu đề..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="w-[180px]">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Loại đề thi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại</SelectItem>
                <SelectItem value="QUIZ">Quiz ngắn</SelectItem>
                <SelectItem value="MODULE_TEST">Kiểm tra Module</SelectItem>
                <SelectItem value="FINAL_EXAM">Thi cuối kỳ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">#</TableHead>
                <TableHead className="w-[300px]">Tên đề thi</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-[100px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : exams?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">Không tìm thấy bản ghi nào</TableCell>
                </TableRow>
              ) : (
                exams?.map((exam, idx) => (
                  <TableRow key={exam.id}>
                    <TableCell className="text-center font-medium text-muted-foreground/60 tabular-nums text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-semibold">
                      <div className="line-clamp-1">{exam.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.examType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="line-clamp-1 text-slate-500 text-sm">{exam.description || '-'}</div>
                    </TableCell>
                    <TableCell>
                      {exam.totalTimeLimitMinutes ? `${exam.totalTimeLimitMinutes} ph` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={exam.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                        {exam.status === 'PUBLISHED' ? 'Hoạt động' : 'Bản nháp'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {format(new Date(exam.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(exam.id)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setDeleteTargetId(exam.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) )
              ) }
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(o) => !o && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đề thi?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Toàn bộ dữ liệu liên quan (sections, câu hỏi trong đề) sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Xóa đề thi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
