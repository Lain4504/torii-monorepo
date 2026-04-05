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
import { Plus, Search, Pencil, Trash2, Tag } from "lucide-react"
import { QuestionEditor } from "./components/question-editor"
import { DeleteQuestionDialog } from "./components/delete-question-dialog"
import { CategoryManagerDialog } from "./components/category-manager-dialog"
import { format } from "date-fns"
import {
  dataTableShellClass,
  dataTableHeaderClass,
  listPageFiltersRowClass,
  listPageSearchIconClass,
  listPageSearchInputClass,
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
    if (d === "EASY")
      return (
        <Badge variant="success" className="text-[10px] font-bold">
          Dễ
        </Badge>
      )
    if (d === "HARD")
      return (
        <Badge variant="destructive" className="text-[10px] font-bold">
          Khó
        </Badge>
      )
    return (
      <Badge variant="warning" className="text-[10px] font-bold">
        TB
      </Badge>
    )
  }

  const levelBadge = (lvl?: string | null) => {
    if (!lvl) return <span className="text-muted-foreground opacity-30">—</span>
    const code = lvl.toUpperCase()
    if (code === "N1")
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-bold border-rose-500/40 text-rose-600 bg-rose-500/5"
        >
          N1
        </Badge>
      )
    if (code === "N2")
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-bold border-orange-500/40 text-orange-600 bg-orange-500/5"
        >
          N2
        </Badge>
      )
    if (code === "N3")
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-bold border-amber-500/40 text-amber-600 bg-amber-500/5"
        >
          N3
        </Badge>
      )
    if (code === "N4")
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-bold border-emerald-500/40 text-emerald-600 bg-emerald-500/5"
        >
          N4
        </Badge>
      )
    if (code === "N5")
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-bold border-sky-500/40 text-sky-600 bg-sky-500/5"
        >
          N5
        </Badge>
      )
    return (
      <Badge variant="secondary" className="text-[10px] font-bold">
        {code}
      </Badge>
    )
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
            <Button variant="outline" size="lg" className="h-10 gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={() => setCategoryDialogOpen(true)}>
              <Tag className="h-4 w-4" />
              Quản lý danh mục
            </Button>
            <Button size="lg" className="h-10 gap-2 shadow-sm" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Thêm câu hỏi
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className={listPageToolbarRootClass}>
        <div className={listPageSearchWrapClass}>
          <Search className={listPageSearchIconClass} />
          <Input
            placeholder="Tìm kiếm nội dung câu hỏi..."
            className={listPageSearchInputClass}
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
                  <TableCell className="font-medium">
                    {difficultyBadge(q.difficulty)}
                  </TableCell>
                  <TableCell>{levelBadge(q.level)}</TableCell>
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 border-emerald-500/40 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleEdit(q)}
                      >
                        <Pencil className="h-4 w-4" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(q.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
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
