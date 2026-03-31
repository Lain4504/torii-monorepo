import { useState, useEffect } from "react"
import { useAcademyAssessmentPlan, useUpdateAcademyAssessmentPlan } from "@/lib/api/services/academy-assessment-plans"
import { useAcademyExams } from "@/lib/api/services/academy-exams"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@workspace/ui/components/select"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@workspace/ui/components/table"
import { Plus, Trash2, GripVertical, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { AcademyAssessmentKind } from "@workspace/schemas"

interface AssessmentPlanTabProps {
  courseProfileId: string
  modules: any[]
}

export function AssessmentPlanTab({ courseProfileId, modules }: AssessmentPlanTabProps) {
  const { data: plan } = useAcademyAssessmentPlan(courseProfileId)
  const { data: exams } = useAcademyExams({ status: 'PUBLISHED' as any })
  const updateMutation = useUpdateAcademyAssessmentPlan()

  const [items, setItems] = useState<any[]>([])
  const [init, setInit] = useState(false)

  // Initialize and synchronize items from plan
  useEffect(() => {
    if (plan && (!init || items.length === 0)) {
      setItems(plan.map(p => ({
        id: p.id,
        examId: p.examId,
        assessmentKind: p.assessmentKind,
        moduleId: p.moduleId,
        triggerLessonId: p.triggerLessonId,
        orderIndex: p.orderIndex,
        isRequired: p.isRequired,
        isActive: p.isActive,
      })))
      setInit(true)
    }
  }, [plan, init])

  const addItem = () => {
    setItems([...items, {
      examId: "",
      assessmentKind: AcademyAssessmentKind.MODULE_CHECKPOINT,
      moduleId: modules[0]?.id,
      orderIndex: items.length,
      isRequired: true,
      isActive: true,
    }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    let updatedItem = { ...newItems[index], [field]: value }

    // If changing to FINAL_EXAM, clear module/lesson associations
    if (field === "assessmentKind" && value === AcademyAssessmentKind.FINAL_EXAM) {
      updatedItem.moduleId = undefined
      updatedItem.triggerLessonId = undefined
    }

    newItems[index] = updatedItem
    setItems(newItems)
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        courseProfileId,
        items: items.map((item, idx) => ({
          ...item,
          orderIndex: idx,
        }))
      })
      toast.success("Cập nhật kế hoạch đánh giá thành công")
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Kế hoạch đánh giá (Milestones)</CardTitle>
            <CardDescription>
              Thiết lập các bài thi/kiểm tra bắt buộc học viên phải vượt qua để tiếp tục tiến độ.
            </CardDescription>
          </div>
          <Button onClick={addItem} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Thêm Milestone
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg text-slate-400">
              Chưa có mốc đánh giá nào được thiết lập.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[250px]">Đề thi</TableHead>
                  <TableHead className="w-[150px]">Loại mốc</TableHead>
                  <TableHead>Vị trí kích hoạt (Sau bài/module)</TableHead>
                  <TableHead className="w-[100px]">Bắt buộc</TableHead>
                  <TableHead className="w-[80px] text-right">Xóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell><GripVertical className="text-slate-300 w-4 h-4 cursor-grab" /></TableCell>
                    <TableCell>
                      <Select
                        value={item.examId}
                        onValueChange={(v) => updateItem(index, "examId", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn đề thi..." />
                        </SelectTrigger>
                        <SelectContent>
                          {exams?.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.assessmentKind}
                        onValueChange={(v) => updateItem(index, "assessmentKind", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={AcademyAssessmentKind.LESSON_CHECKPOINT}>Sau bài học</SelectItem>
                          <SelectItem value={AcademyAssessmentKind.MODULE_CHECKPOINT}>Sau Module</SelectItem>
                          <SelectItem value={AcademyAssessmentKind.FINAL_EXAM}>Cuối khóa</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {item.assessmentKind === AcademyAssessmentKind.LESSON_CHECKPOINT ? (
                        <Select
                          value={item.triggerLessonId || ""}
                          onValueChange={(v) => updateItem(index, "triggerLessonId", v)}
                        >
                          <SelectTrigger className="w-full min-w-[200px]">
                            <SelectValue placeholder="Chọn bài học..." />
                          </SelectTrigger>
                          <SelectContent position="popper" className="max-h-[400px]">
                            {modules.map(m => (
                              <SelectGroup key={m.id}>
                                <SelectLabel className="bg-muted text-muted-foreground">{m.title}</SelectLabel>
                                {(m.lessons || []).map((l: any) => (
                                  <SelectItem key={l.id} value={l.id} className="pl-6">
                                    {l.title}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : item.assessmentKind === AcademyAssessmentKind.MODULE_CHECKPOINT ? (
                        <Select
                          value={item.moduleId || ""}
                          onValueChange={(v) => updateItem(index, "moduleId", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn module..." />
                          </SelectTrigger>
                          <SelectContent>
                            {modules.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-slate-400 italic">Kích hoạt khi hoàn thành toàn bộ khóa học</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={item.isRequired}
                        onCheckedChange={(v) => updateItem(index, "isRequired", !!v)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-6 flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Các mốc "Bắt buộc" sẽ chặn tiến độ học tập của luồng VOD Package cho đến khi hoàn thành.</span>
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              Lưu kế hoạch đánh giá
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
