import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Plus, MoreVertical, Search, Filter, Layers, Tag as TagIcon } from "lucide-react"
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
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
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
  useAcademyQuestions,
  useDeleteAcademyQuestion,
} from "@/lib/api/services/academy-questions"

export default function AcademyQuestionsPage() {
  const [q, setQ] = useState("")
  const [questionType, setQuestionType] = useState("all")
  const [level] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      q: q || undefined,
      questionType: questionType === "all" ? undefined : questionType,
      level: level === "all" ? undefined : level,
      topLevelOnly: 'true',
    }),
    [q, questionType, level],
  )

  const { data = [], isLoading } = useAcademyQuestions(query)
  const del = useDeleteAcademyQuestion()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ngân hàng câu hỏi"
        subtitle="Quản lý và tổ chức câu hỏi cho các bài kiểm tra."
        actions={
          <Button asChild className="gap-2 shadow-sm">
            <Link to="/academy/questions/new">
              <Plus className="h-4 w-4" /> Tạo câu hỏi
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm nội dung câu hỏi..."
            className="pl-9"
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={questionType} onValueChange={setQuestionType}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Loại câu hỏi" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              <SelectItem value="TRUE_FALSE">True/False</SelectItem>
              <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
              <SelectItem value="FILL_IN_BLANK">Fill in Blank</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md bg-background border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              <TableHead>Nội dung câu hỏi</TableHead>
              <TableHead>Phân loại</TableHead>
              <TableHead>Cấp độ / Category</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full max-w-[400px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : data.length ? (
              data.map((it, idx) => (
                <TableRow key={it.id} className="group">
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                  <TableCell className="max-w-xl">
                    <div className="line-clamp-2 font-medium text-foreground group-hover:text-primary transition-colors">
                      {it.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-bold uppercase tracking-tighter text-[10px] bg-muted shadow-none">
                      {it.questionType.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {it.level && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                          <Layers className="size-3 text-primary/60" />
                          {it.level}
                        </div>
                      )}
                      {it.category && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                          <TagIcon className="size-3 text-amber-500/60" />
                          {it.category}
                        </div>
                      )}
                      {!it.level && !it.category && <span className="text-muted-foreground text-xs">—</span>}
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
                          <Link to={`/academy/questions/${it.id}/edit`}>
                            Sửa câu hỏi
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
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Chưa có câu hỏi nào trong ngân hàng.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Câu hỏi</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn câu hỏi khỏi ngân hàng câu hỏi. Các đề thi đang sử dụng câu hỏi này có thể bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteId) return
                try {
                  await del.mutateAsync(deleteId)
                  toast.success("Đã xoá câu hỏi thành công")
                } catch (e: any) {
                  toast.error(e?.message || "Xoá câu hỏi thất bại")
                } finally {
                  setDeleteId(null)
                }
              }}
            >
              Xác nhận Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
