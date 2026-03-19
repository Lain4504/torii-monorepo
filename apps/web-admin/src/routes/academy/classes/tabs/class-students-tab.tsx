import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Plus, User, Trash2 } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import {
  useAcademyEnrollments,
  useCreateAcademyEnrollment,
  useCancelAcademyEnrollment,
  useDeleteAcademyEnrollment,
  type AcademyEnrollment,
} from "@/lib/api/services/academy-enrollments"
import { ClassEnrollmentSheet } from "@/components/academy/class-enrollment-sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

interface ClassStudentsTabProps {
  classId: string
  canManageEnrollment?: boolean
}

export function ClassStudentsTab({
  classId,
  canManageEnrollment = false,
}: ClassStudentsTabProps) {
  const [enrollmentSheetOpen, setEnrollmentSheetOpen] = useState(false)

  const {
    data: enrollments = [],
    isLoading: isLoadingEnrollments,
  } = useAcademyEnrollments({ classId, page: 1, limit: 100 } as any)

  const createEnrollment = useCreateAcademyEnrollment()
  const cancelEnrollment = useCancelAcademyEnrollment()
  const deleteEnrollment = useDeleteAcademyEnrollment()

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<AcademyEnrollment | null>(null)

  const handleCreateEnrollment = async (data: any) => {
    try {
      await createEnrollment.mutateAsync(data)
      toast.success("Đã ghi danh học viên vào lớp")
      setEnrollmentSheetOpen(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Không thể ghi danh học viên")
    }
  }

  const handleCancelClick = (enrollment: AcademyEnrollment) => {
    setSelectedEnrollment(enrollment)
    setConfirmCancelOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedEnrollment) return
    try {
      await cancelEnrollment.mutateAsync(selectedEnrollment.id)
      toast.success("Đã cập nhật trạng thái ghi danh thành CANCELLED")
      setConfirmCancelOpen(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Không thể cập nhật trạng thái")
    }
  }

  const handleDeleteClick = (enrollment: AcademyEnrollment) => {
    setSelectedEnrollment(enrollment)
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedEnrollment) return
    try {
      await deleteEnrollment.mutateAsync(selectedEnrollment.id)
      toast.success("Đã xóa ghi danh khỏi lớp")
      setConfirmDeleteOpen(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Không thể xóa ghi danh")
    }
  }

  if (isLoadingEnrollments) {
    return (
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="p-8 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {canManageEnrollment && (
        <div className="flex justify-end">
          <Button size="lg" onClick={() => setEnrollmentSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ghi danh học viên
          </Button>
        </div>
      )}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Học viên</TableHead>
              <TableHead>Ngày ghi danh</TableHead>
              <TableHead>Hết hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              {canManageEnrollment && (
                <TableHead className="text-right">Thao tác</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManageEnrollment ? 5 : 4}
                  className="h-24 text-center text-muted-foreground"
                >
                  Lớp học hiện chưa có học viên nào được ghi danh.
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((en) => (
                <TableRow key={en.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {en.user?.avatarUrl ? (
                          <img
                            src={en.user.avatarUrl}
                            alt={en.user.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="size-4 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {en.user?.displayName || "Học viên"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {en.user?.email || en.userId}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(en.enrolledAt).toLocaleDateString("vi-VN")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {en.expiresAt ? (
                      <span className="text-sm">
                        {new Date(en.expiresAt).toLocaleDateString("vi-VN")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Không giới hạn
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        en.status === "ACTIVE"
                          ? "default"
                          : en.status === "COMPLETED"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {en.status === "ACTIVE"
                        ? "Đang học"
                        : en.status === "COMPLETED"
                        ? "Hoàn thành"
                        : "Đã hủy"}
                    </Badge>
                  </TableCell>
                  {canManageEnrollment && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {en.status === "ACTIVE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelClick(en)}
                            disabled={cancelEnrollment.isPending}
                          >
                            Hủy kích hoạt
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive border-destructive/40 hover:text-destructive hover:bg-destructive/5"
                          onClick={() => handleDeleteClick(en)}
                          disabled={deleteEnrollment.isPending}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ClassEnrollmentSheet
        open={enrollmentSheetOpen}
        onOpenChange={setEnrollmentSheetOpen}
        classId={classId}
        submitting={createEnrollment.isPending}
        onSubmit={handleCreateEnrollment}
      />

      {/* Dialog: Xác nhận hủy kích hoạt */}
      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Xác nhận hủy kích hoạt</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy kích hoạt ghi danh của học viên <strong>{selectedEnrollment?.user?.displayName || selectedEnrollment?.userId}</strong>? 
              Hành động này sẽ thay đổi trạng thái thành CANCELLED.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancelOpen(false)}>Hủy</Button>
            <Button 
              onClick={handleConfirmCancel} 
              disabled={cancelEnrollment.isPending}
            >
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Xác nhận xóa ghi danh */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa ghi danh</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa ghi danh của học viên <strong>{selectedEnrollment?.user?.displayName || selectedEnrollment?.userId}</strong> khỏi lớp học này?
              Hành động này <strong>không thể hoàn tác</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Hủy</Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete} 
              disabled={deleteEnrollment.isPending}
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
