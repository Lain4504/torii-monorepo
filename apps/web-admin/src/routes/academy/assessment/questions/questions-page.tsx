import { useState } from "react"
import {
  useAcademyQuestions,
  useAcademyQuestionCategories,
  useCreateAcademyQuestionCategory,
} from "@/lib/api/services/academy-questions"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@workspace/ui/components/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@workspace/ui/components/dialog"
import { Badge } from "@workspace/ui/components/badge"
import { Label } from "@workspace/ui/components/label"
import { Plus, Search, Edit2, Trash2, Tag } from "lucide-react"
import { QuestionEditor } from "./components/question-editor"
import { DeleteQuestionDialog } from "./components/delete-question-dialog"
import { toast } from "sonner"
import { format } from "date-fns"

export default function QuestionsPage() {
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState<string>("ALL")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [questionToDelete, setQuestionToDelete] = useState<{ id: string; stem: string } | null>(null)

  const { data: categories = [] } = useAcademyQuestionCategories()
  const { data: questions, isLoading } = useAcademyQuestions({
    q: search || undefined,
    categoryId: categoryId === "ALL" ? undefined : categoryId,
  })

  const createCategoryMutation = useCreateAcademyQuestionCategory()

  const handleDelete = (question: any) => {
    setQuestionToDelete({ id: question.id, stem: question.stem })
  }

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    const code = trimmed.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '').substring(0, 50) || `CAT_${Date.now()}`
    try {
      await createCategoryMutation.mutateAsync({ name: trimmed, code, isActive: true })
      toast.success("Tạo danh mục thành công")
      setNewCategoryName("")
      setCategoryDialogOpen(false)
    } catch (error: any) {
      toast.error(error.userMessage || error.message || "Không thể tạo danh mục")
    }
  }

  const handleEdit = (question: any) => {
    setSelectedQuestion(question)
    setEditingId(question.id)
    setEditorOpen(true)
  }

  const handleCreate = () => {
    setSelectedQuestion(null)
    setEditingId(null)
    setEditorOpen(true)
  }

  const difficultyBadge = (d: string) => {
    if (d === 'EASY') return <Badge variant="outline" className="text-[10px] font-bold border-emerald-300 text-emerald-700 bg-emerald-50">Dễ</Badge>
    if (d === 'HARD') return <Badge variant="outline" className="text-[10px] font-bold border-red-300 text-red-700 bg-red-50">Khó</Badge>
    return <Badge variant="secondary" className="text-[10px] font-bold">TB</Badge>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ngân hàng câu hỏi"
        subtitle="Quản lý thư viện câu hỏi dùng chung cho các bài thi và kiểm tra."
        stats={[
          { label: "Tổng câu hỏi", value: questions?.length ?? 0 },
          { label: "Danh mục", value: categories.length },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
              <Tag className="w-4 h-4 mr-2" />
              Thêm danh mục
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm câu hỏi
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-card border rounded-xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm nội dung câu hỏi..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[220px]">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả danh mục</SelectItem>
              {(categories as any[]).map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[420px] pl-4">Câu hỏi</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right pr-4 w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : !questions?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                  Không tìm thấy câu hỏi nào
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q) => (
                <TableRow key={q.id} className="hover:bg-muted/10">
                  <TableCell className="pl-4 font-medium">
                    <div className="line-clamp-2 text-sm">{q.stem}</div>
                  </TableCell>
                  <TableCell>{difficultyBadge(q.difficulty)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(q.categoryLinks as any[])?.length
                        ? (q.categoryLinks as any[]).map((cl) => (
                          <Badge key={cl.categoryId} variant="secondary" className="text-[10px]">
                            {cl.category?.name}
                          </Badge>
                        ))
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(q.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(q)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(q)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Question Editor */}
      <QuestionEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        questionId={editingId || undefined}
        initialData={selectedQuestion}
      />

      {/* Delete Question Dialog */}
      <DeleteQuestionDialog
        open={!!questionToDelete}
        onOpenChange={(open) => !open && setQuestionToDelete(null)}
        question={questionToDelete}
      />

      {/* Create Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Tạo danh mục câu hỏi
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="space-y-1.5">
              <Label>Tên danh mục <span className="text-destructive">*</span></Label>
              <Input
                placeholder="VD: Ngữ pháp, Từ vựng N5, Hán tự..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateCategory() }}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Mã danh mục sẽ được tự động tạo từ tên.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCategoryDialogOpen(false)}>Hủy</Button>
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? "Đang tạo..." : "Tạo danh mục"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
