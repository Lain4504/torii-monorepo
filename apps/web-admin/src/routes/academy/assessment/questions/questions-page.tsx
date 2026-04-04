import { useState } from "react"
import {
  useAcademyQuestions,
  useAcademyQuestionCategories,
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
import { Badge } from "@workspace/ui/components/badge"
import { Plus, Search, Edit2, Trash2, Tag } from "lucide-react"
import { QuestionEditor } from "./components/question-editor"
import { DeleteQuestionDialog } from "./components/delete-question-dialog"
import { CategoryManagerDialog } from "./components/category-manager-dialog"
import { format } from "date-fns"
import {
  dataTableShellClass,
  dataTableHeaderClass,
  listPageFiltersRowClass,
  listPageSearchWrapClass,
  listPageToolbarRootClass,
} from "@/lib/ui-shell"

export default function QuestionsPage() {
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState<string>("ALL")
  const [level, setLevel] = useState<string>("ALL")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<{ id: string; stem: string } | null>(null)

  const { data: categories = [] } = useAcademyQuestionCategories()
  const { data: questions, isLoading } = useAcademyQuestions({
    q: search || undefined,
    categoryId: categoryId === "ALL" ? undefined : categoryId,
    level: level === "ALL" ? undefined : level,
  })

  const handleDelete = (question: any) => {
    setQuestionToDelete({ id: question.id, stem: question.stem })
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
    if (d === 'EASY') return <Badge variant="success" className="text-[10px] font-bold">Dễ</Badge>
    if (d === 'HARD') return <Badge variant="destructive" className="text-[10px] font-bold">Khó</Badge>
    return <Badge variant="warning" className="text-[10px] font-bold">TB</Badge>
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
              Quản lý danh mục
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm câu hỏi
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className={listPageToolbarRootClass}>
        <div className={listPageSearchWrapClass}>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm nội dung câu hỏi..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={listPageFiltersRowClass}>
        <div className="w-full md:w-[220px]">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full">
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
        <div className="w-full md:w-[150px]">
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mọi cấp độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Mọi cấp độ</SelectItem>
              <SelectItem value="N1">N1</SelectItem>
              <SelectItem value="N2">N2</SelectItem>
              <SelectItem value="N3">N3</SelectItem>
              <SelectItem value="N4">N4</SelectItem>
              <SelectItem value="N5">N5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>
      </div>

      {/* Table */}
      <div className={dataTableShellClass}>
        <Table>
          <TableHeader className={dataTableHeaderClass}>
            <TableRow>
              <TableHead className="w-[60px] text-center">#</TableHead>
              <TableHead className="w-[420px] pl-4">Câu hỏi</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Cấp độ</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right pr-4 w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : !questions?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic">
                  Không tìm thấy câu hỏi nào
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q, idx) => (
                <TableRow key={q.id} className="hover:bg-muted/10">
                  <TableCell className="text-center font-medium text-muted-foreground/60 tabular-nums text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="pl-4 font-medium">
                    <div className="line-clamp-2 text-sm">{q.stem}</div>
                  </TableCell>
                  <TableCell>{difficultyBadge(q.difficulty)}</TableCell>
                  <TableCell>
                    <Badge variant="info" className="text-[10px] font-bold">
                      {q.level || "—"}
                    </Badge>
                  </TableCell>
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

      {/* Category Manager Dialog */}
      <CategoryManagerDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
      />
    </div>
  )
}
