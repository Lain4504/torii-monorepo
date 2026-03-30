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
import { ClassAssignmentSheet } from "@/components/academy/class-assignment-sheet"
import { formatDateTime } from "@/lib/format-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

interface ClassAssignmentsTabProps {
  classId?: string
  vodPackageId?: string
}

export function ClassAssignmentsTab({ classId, vodPackageId }: ClassAssignmentsTabProps) {
  const navigate = useNavigate()

  const id = (vodPackageId || classId) as string;
  const {
    data: classAssignments = [],
    isLoading: isLoadingAssignments,
  } = useAcademyClassAssignments(id)

  const addMutation = useAddAcademyClassAssignment(id)
  const updateMutation = useUpdateAcademyClassAssignment(id)
  const removeMutation = useRemoveAcademyClassAssignment(id)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] =
    useState<AcademyClassAssignment | null>(null)
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false)
  const [selectedForRemove, setSelectedForRemove] = useState<AcademyClassAssignment | null>(null)

  const handleCreateClick = () => {
    setEditingAssignment(null)
    setSheetOpen(true)
  }

  const handleEditClick = (ca: AcademyClassAssignment) => {
    setEditingAssignment(ca)
    setSheetOpen(true)
  }

  const handleRemoveClick = (ca: AcademyClassAssignment) => {
    setSelectedForRemove(ca)
    setRemoveConfirmOpen(true)
  }

  const handleConfirmRemove = async () => {
    if (!selectedForRemove) return
    try {
      await removeMutation.mutateAsync(selectedForRemove.id)
      toast.success("Đã gỡ bài tập khỏi lớp")
      setRemoveConfirmOpen(false)
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
            title: data.title,
            instructions: data.instructions,
            openAt: data.openAt ? new Date(data.openAt) : undefined,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
          },
        })
        toast.success("Đã cập nhật bài tập")
      } else {
        await addMutation.mutateAsync({
          liveClassId: classId || undefined,
          vodPackageId: vodPackageId,
          title: data.title,
          instructions: data.instructions,
          openAt: data.openAt ? new Date(data.openAt) : undefined,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
        } as any)
        toast.success("Đã giao bài tập cho lớp")
      }
      setSheetOpen(false)
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error.message || "Không thể lưu bài tập",
      )
      throw error
    }
  }

  const handleGoToGrading = (ca: AcademyClassAssignment) => {
    const baseUrl = vodPackageId
      ? `/academy/vod-packages/${vodPackageId}`
      : `/academy/live-classes/${classId}`;
    navigate(`${baseUrl}/assignments/${ca.id}/submissions`)
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
          <TableHeader className="bg-muted/50">
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
                  Lớp học/Gói học hiện chưa có bài tập nào được giao.
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
                          {ca.assignment?.title || ca.titleOverride || "Bài tập"}
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
                        {formatDateTime(ca.openAt, "HH:mm dd/MM/yyyy")}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ca.deadline ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatDateTime(ca.deadline, "HH:mm dd/MM/yyyy")}
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
                      {(!ca.deadline || new Date(ca.deadline) >= new Date()) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(ca)}
                        >
                          Chỉnh sửa
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/40"
                        onClick={() => handleRemoveClick(ca)}
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

      <ClassAssignmentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initial={editingAssignment}
        submitting={addMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      {/* Dialog: Xác nhận gỡ bài tập */}
      <Dialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Xác nhận gỡ bài tập</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn gỡ bài tập <strong>{selectedForRemove?.assignment?.title || selectedForRemove?.titleOverride}</strong> khỏi lớp học này?
              Dữ liệu về các bài nộp của học viên cho bài tập này (nếu có) cũng có thể bị ảnh hưởng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveConfirmOpen(false)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRemove}
              disabled={removeMutation.isPending}
            >
              Xác nhận gỡ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
