import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { ChevronRight, Plus, FileText, Calendar, CheckCircle2 } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import {
  useAcademyClassAssessments,
  useCreateAcademyClassAssessment,
  useUpdateAcademyClassAssessment,
  useDeleteAcademyClassAssessment,
  type AcademyClassAssessment,
} from "@/lib/api/services/academy-class-assessments"
import { ClassAssessmentSheet } from "@/components/academy/class-assessment-sheet"
import { formatDateTime } from "@/lib/format-utils"

export default function ClassAssessmentsPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()

  const { data: academyClass, isLoading: isLoadingClass } = useAcademyClass(classId)
  const {
    data: assessments = [],
    isLoading: isLoadingAssessments,
  } = useAcademyClassAssessments({ classId: classId! } as any)

  const createMutation = useCreateAcademyClassAssessment()
  const updateMutation = useUpdateAcademyClassAssessment()
  const deleteMutation = useDeleteAcademyClassAssessment()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<AcademyClassAssessment | null>(null)

  const isLoading = isLoadingClass || isLoadingAssessments

  const handleCreateClick = () => {
    setEditingAssessment(null)
    setSheetOpen(true)
  }

  const handleEditClick = (asm: AcademyClassAssessment) => {
    setEditingAssessment(asm)
    setSheetOpen(true)
  }

  const handleDeleteClick = async (asm: AcademyClassAssessment) => {
    try {
      await deleteMutation.mutateAsync(asm.id)
      toast.success("Đã xóa assessment khỏi lớp")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Không thể xóa assessment")
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      if (editingAssessment) {
        await updateMutation.mutateAsync({ id: editingAssessment.id, input: data })
        toast.success("Đã cập nhật assessment")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Đã tạo assessment cho lớp")
      }
      setSheetOpen(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Không thể lưu assessment")
    }
  }

  const handleGoToGrading = (asm: AcademyClassAssessment) => {
    navigate(`/academy/classes/${asm.classId}/assignments/${asm.id}/submissions`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link
              to="/academy/classes"
              className="hover:underline text-muted-foreground transition-colors"
            >
              Lớp học
            </Link>
            <ChevronRight className="size-4" />
            <span>Bài tập &amp; Bài kiểm tra</span>
          </div>
        }
        subtitle="Quản lý các bài quiz, exam và assignment gắn với lớp học."
        stats={
          academyClass
            ? [
                { label: "Mã lớp", value: academyClass.code },
                { label: "Loại hình", value: academyClass.mode },
              ]
            : undefined
        }
        actions={
          <Button size="lg" onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo Assessment
          </Button>
        }
      />

      <div className="rounded-md border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Tên / Loại</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Trọng số</TableHead>
                <TableHead>Thang điểm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Lớp học hiện chưa có assessment nào.
                  </TableCell>
                </TableRow>
              ) : (
                assessments.map((asm) => (
                  <TableRow key={asm.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="size-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {asm.titleOverride || `${asm.kind} (${asm.id.slice(0, 8)})`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Loại: {asm.kind || "N/A"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {asm.deadline ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span>
                            {formatDateTime(asm.deadline, "HH:mm dd/MM/yyyy")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Không đặt</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {asm.weight != null ? `${asm.weight}%` : <span className="text-xs text-muted-foreground italic">—</span>}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {asm.maxScoreOverride != null ? asm.maxScoreOverride : 10}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={asm.status === "PUBLISHED" ? "default" : "secondary"}
                        className="uppercase text-[10px]"
                      >
                        {asm.status || "DRAFT"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGoToGrading(asm)}
                        >
                          <CheckCircle2 className="size-3 mr-1" />
                          Chấm điểm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(asm)}
                        >
                          Chỉnh sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/40"
                          onClick={() => handleDeleteClick(asm)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {classId && (
        <ClassAssessmentSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          classId={classId}
          initial={editingAssessment}
          submitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
        />
      )}

    </div>
  )
}

