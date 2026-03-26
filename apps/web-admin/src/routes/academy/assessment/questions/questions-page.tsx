import { useState } from "react"
import { useAcademyQuestions, useDeleteAcademyQuestion, useAcademyQuestionCategories } from "@/lib/api/services/academy-questions"
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
import { Badge } from "@workspace/ui/components/badge"
import { Plus, Search, Edit2, Trash2 } from "lucide-react"
import { QuestionEditor } from "./components/question-editor"
import { toast } from "sonner"
import { format } from "date-fns"

export default function QuestionsPage() {
  const [search, setSearch] = useState("")
  const [type, setType] = useState<string>("ALL")
  const [categoryId, setCategoryId] = useState<string>("ALL")
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)

  const { data: categories } = useAcademyQuestionCategories()
  const { data: questions, isLoading } = useAcademyQuestions({
    q: search || undefined,
    questionType: type === "ALL" ? undefined : type as any,
    categoryId: categoryId === "ALL" ? undefined : categoryId,
  })

  const deleteMutation = useDeleteAcademyQuestion()

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success("Xóa câu hỏi thành công")
      } catch (error: any) {
        toast.error(error.message || "Không thể xóa câu hỏi")
      }
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Ngân hàng câu hỏi" 
        subtitle="Quản lý thư viện câu hỏi dùng chung cho các bài thi và kiểm tra."
        actions={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm câu hỏi
          </Button>
        }
      />

      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm nội dung..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-[180px]">
           <Select value={type} onValueChange={setType}>
             <SelectTrigger>
               <SelectValue placeholder="Loại câu hỏi" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="ALL">Tất cả loại</SelectItem>
               <SelectItem value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án</SelectItem>
               <SelectItem value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án</SelectItem>
               <SelectItem value="TRUE_FALSE">Đúng/Sai</SelectItem>
               <SelectItem value="SHORT_ANSWER">Câu hỏi ngắn</SelectItem>
             </SelectContent>
           </Select>
        </div>

        <div className="w-[200px]">
           <Select value={categoryId} onValueChange={setCategoryId}>
             <SelectTrigger>
               <SelectValue placeholder="Danh mục" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="ALL">Tất cả danh mục</SelectItem>
               {categories?.map(cat => (
                 <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Câu hỏi</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-10 text-slate-400">Đang tải dữ liệu...</TableCell>
               </TableRow>
            ) : questions?.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-10 text-slate-400">Không tìm thấy câu hỏi nào</TableCell>
               </TableRow>
            ) : (
              questions?.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">
                    <div className="line-clamp-2">{q.stem}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{q.questionType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={q.difficulty === 'HARD' ? 'destructive' : q.difficulty === 'MEDIUM' ? 'secondary' : 'default'}>
                      {q.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {q.categoryLinks?.map((cl: any) => (
                        <Badge key={cl.categoryId} variant="secondary" className="text-[10px]">
                          {cl.category?.title}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {format(new Date(q.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(q)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionEditor 
        open={editorOpen}
        onOpenChange={setEditorOpen}
        questionId={editingId || undefined}
        initialData={selectedQuestion}
      />
    </div>
  )
}
