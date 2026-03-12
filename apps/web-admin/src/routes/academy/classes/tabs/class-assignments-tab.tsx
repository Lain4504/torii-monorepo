import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
import { Plus, FileText, Calendar, CheckCircle2 } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import {
  useAcademyClassAssignments,
  useAddAcademyClassAssignment,
  useUpdateAcademyClassAssignment,
  useRemoveAcademyClassAssignment,
  type AcademyClassAssignment,
} from "@/lib/api/services/academy-class-assignments"
import { ClassAssignmentDialog } from "@/components/academy/class-assignment-dialog"

interface ClassAssignmentsTabProps {
  classId: string
}

export function ClassAssignmentsTab({ classId }: ClassAssignmentsTabProps) {
  const navigate = useNavigate()

  const {
    data: classAssignments = [],
    isLoading: isLoadingAssignments,
  } = useAcademyClassAssignments(classId)

  const addMutation = useAddAcademyClassAssignment(classId)
  const updateMutation = useUpdateAcademyClassAssignment(classId)
  const removeMutation = useRemoveAcademyClassAssignment(classId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] =
    useState<AcademyClassAssignment | null>(null)

  const handleCreateClick = () => {
    setEditingAssignment(null)
    setDialogOpen(true)
  }

  const handleEditClick = (ca: AcademyClassAssignment) => {
    setEditingAssignment(ca)
    setDialogOpen(true)
  }

  const handleDeleteClick = async (ca: AcademyClassAssignment) => {
    try {
      await removeMutation.mutateAsync(ca.id)
      toast.success("Đã gỡ bài tập khỏi lớp")
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error.message || "Không thể gỡ bài tập",
      )
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      if (editingAssignment) {
        await updateMutation.mutateAsync({
          id: editingAssignment.id,
          input: {
            titleOverride: data.titleOverride || undefined,
            openAt: data.openAt ? new Date(data.openAt) : undefined,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
          },
        })
        toast.success("Đã cập nhật bài tập")
      } else {
        await addMutation.mutateAsync({
          title: data.title,
          instructions: data.instructions,
          titleOverride: data.titleOverride || undefined,
          openAt: data.openAt ? new Date(data.openAt) : undefined,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
        })
        toast.success("Đã giao bài tập cho lớp")
      }
      setDialogOpen(false)
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error.message || "Không thể lưu bài tập",
      )
      throw error
    }
  }

  const handleGoToGrading = (ca: AcademyClassAssignment) => {
    navigate(`/academy/classes/${classId}/assignments/${ca.id}/submissions`)
  }

  if (isLoadingAssignments) {
    return (
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="p-8 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="lg" onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Giao bài tập
        </Button>
      </div>
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bài tập</TableHead>
              <TableHead>Mở từ</TableHead>
              <TableHead>Hạn nộp</TableHead>
              <TableHead>Bài nộp</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Lớp học chưa có bài tập nào được giao. Chỉ áp dụng cho lớp LIVE.
                </TableCell>
              </TableRow>
            ) : (
              classAssignments.map((ca) => (
                <TableRow key={ca.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="size-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {ca.titleOverride || ca.assignment?.title || "Bài tập"}
                        </span>
                        {ca.titleOverride && ca.assignment?.title && (
                          <span className="text-xs text-muted-foreground">
                            Gốc: {ca.assignment.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ca.openAt ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="size-3 text-muted-foreground" />
                        {new Date(ca.openAt).toLocaleString("vi-VN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ca.deadline ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="size-3 text-muted-foreground" />
                        {new Date(ca.deadline).toLocaleString("vi-VN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Không đặt</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {ca._count?.submissions ?? 0} bài nộp
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGoToGrading(ca)}
                      >
                        <CheckCircle2 className="size-3 mr-1" />
                        Chấm điểm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(ca)}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteClick(ca)}
                      >
                        Gỡ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ClassAssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editingAssignment}
        submitting={addMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
