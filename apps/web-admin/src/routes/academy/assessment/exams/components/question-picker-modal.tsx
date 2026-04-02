import { useState } from "react"
import { useAcademyQuestions, useAcademyQuestionCategories } from "@/lib/api/services/academy-questions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@workspace/ui/components/dialog"
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
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Badge } from "@workspace/ui/components/badge"
import { Search, Check } from "lucide-react"

interface QuestionPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (questionIds: string[]) => Promise<void>
  existingQuestionIds?: string[]
}

export function QuestionPickerModal({
  open,
  onOpenChange,
  onConfirm,
  existingQuestionIds = []
}: QuestionPickerModalProps) {
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState<string>("ALL")
  const [difficulty, setDifficulty] = useState<string>("ALL")
  const [level, setLevel] = useState<string>("ALL")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: categories = [] } = useAcademyQuestionCategories()

  // Fetch questions from question bank
  const { data: questions, isLoading } = useAcademyQuestions({
    q: search || undefined,
    categoryId: categoryId === "ALL" ? undefined : categoryId,
    difficulty: difficulty === "ALL" ? undefined : difficulty as any,
    level: level === "ALL" ? undefined : level,
  })

  const existingIdsSet = new Set(existingQuestionIds)

  // Handle individual checkbox toggle
  const toggleQuestion = (id: string) => {
    if (existingIdsSet.has(id)) return

    const nextSelected = new Set(selectedIds)
    if (nextSelected.has(id)) {
      nextSelected.delete(id)
    } else {
      nextSelected.add(id)
    }
    setSelectedIds(nextSelected)
  }

  // Handle select all toggle
  const toggleAll = () => {
    if (!questions) return
    
    // Filter out already existing questions when selecting all
    const availableQuestions = questions.filter(q => !existingIdsSet.has(q.id))
    
    if (selectedIds.size === availableQuestions.length && availableQuestions.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(availableQuestions.map((q) => q.id)))
    }
  }

  const handleConfirm = async () => {
    if (selectedIds.size === 0) return
    try {
      setIsSubmitting(true)
      await onConfirm(Array.from(selectedIds))
      setSelectedIds(new Set())
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn câu hỏi từ Ngân hàng</DialogTitle>
          <DialogDescription>
            Tìm kiếm và chọn các câu hỏi bạn muốn thêm vào bài thi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm nội dung câu hỏi..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-[180px]">
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
            <div className="w-[150px]">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Mọi độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Mọi độ khó</SelectItem>
                  <SelectItem value="EASY">Dễ</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="HARD">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[150px]">
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
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

          <div className="border rounded-md overflow-hidden bg-white dark:bg-slate-900 flex-1 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-slate-900 border-b z-10">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        questions && 
                        questions.length > 0 && 
                        questions.filter(q => !existingIdsSet.has(q.id)).length > 0 &&
                        selectedIds.size === questions.filter(q => !existingIdsSet.has(q.id)).length
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Nội dung câu hỏi</TableHead>
                  <TableHead className="w-[150px]">Loại</TableHead>
                  <TableHead className="w-[100px]">Độ khó</TableHead>
                  <TableHead className="w-[100px]">Cấp độ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-400">Đang tải câu hỏi...</TableCell>
                  </TableRow>
                ) : questions && questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-400">Không tìm thấy câu hỏi phù hợp</TableCell>
                  </TableRow>
                ) : (
                  questions?.map((q) => {
                    const isAlreadyInExam = existingIdsSet.has(q.id)
                    return (
                      <TableRow key={q.id} className={isAlreadyInExam ? "opacity-50 bg-slate-50/50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(q.id)}
                            onCheckedChange={() => toggleQuestion(q.id)}
                            disabled={isAlreadyInExam}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <div className="line-clamp-2">{q.stem}</div>
                            {isAlreadyInExam && (
                              <div className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Đã có trong bài thi
                              </div>
                            )}
                          </div>
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
                          <Badge variant="outline" className="text-[10px] font-bold border-blue-200 text-blue-700 bg-blue-50/50">
                            {q.level || "—"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t mt-auto">
            <div className="text-sm text-slate-500">
              Đã chọn {selectedIds.size} câu hỏi mới
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy bỏ
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedIds.size === 0 || isSubmitting}
              >
                Thêm vào bài thi
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
