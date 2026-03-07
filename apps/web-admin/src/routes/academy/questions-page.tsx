import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
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
  useAcademyQuestions,
  useDeleteAcademyQuestion,
} from "@/lib/api/services/academy-questions"

export default function AcademyQuestionsPage() {
  const [q, setQ] = useState("")
  const [questionType, setQuestionType] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      q: q || undefined,
      questionType: questionType || undefined,
    }),
    [q, questionType],
  )

  const { data = [], isLoading } = useAcademyQuestions(query)
  const del = useDeleteAcademyQuestion()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Question bank"
        subtitle="Ngân hàng câu hỏi dùng cho Exams/Quiz."
        actions={
          <Button asChild>
            <Link to="/academy/questions/new">Tạo câu hỏi</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Danh sách</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo nội dung..."
            />
            <Input
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              placeholder="Lọc theo questionType (SINGLE_CHOICE/...)"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">STT</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>Đang tải...</TableCell>
                </TableRow>
              ) : data.length ? (
                data.map((it, idx) => (
                  <TableRow key={it.id}>
                    <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                    <TableCell className="max-w-xl truncate">
                      {it.content}
                    </TableCell>
                    <TableCell>{it.questionType}</TableCell>
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
                            <Link to={`/academy/questions/${it.id}/edit`}>
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
                  <TableCell colSpan={4}>Chưa có dữ liệu</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Question</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn câu hỏi khỏi ngân hàng câu hỏi.
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

