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
import { Plus, User, Users, Trash2 } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import { formatDate } from "@/lib/format-utils"
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
  classId?: string
  vodPackageId?: string
  canManageEnrollment?: boolean
}

export function ClassStudentsTab({
  classId,
  vodPackageId,
  canManageEnrollment = false,
}: ClassStudentsTabProps) {
  const [enrollmentSheetOpen, setEnrollmentSheetOpen] = useState(false)

  const {
    data: enrollments = [],
    isLoading: isLoadingEnrollments,
  } = useAcademyEnrollments({
    liveClassId: classId,
    vodPackageId: vodPackageId,
    page: 1,
    limit: 100,
  })

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
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Danh sách học viên
          </h3>
          <p className="text-sm text-muted-foreground">
            Quản lý ghi danh, kích hoạt và theo dõi học viên trong lớp học này.
          </p>
        </div>

        {canManageEnrollment && (
          <Button className="gap-2" onClick={() => setEnrollmentSheetOpen(true)}>
            <Plus className="size-4" />
            Ghi danh học viên
          </Button>
        )}
      </div>
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
                  Lớp học/Gói học hiện chưa có học viên nào được ghi danh.
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
                      {formatDate(en.enrolledAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {en.expiresAt ? (
                      <span className="text-sm">
                        {formatDate(en.expiresAt)}
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
                            : en.status === "EXPIRED"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {en.status === "ACTIVE"
                        ? "Đang học"
                        : en.status === "COMPLETED"
                          ? "Hoàn thành"
                          : en.status === "EXPIRED"
                            ? "Đã hết hạn"
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
        vodPackageId={vodPackageId}
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
