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
import { ClassEnrollmentDialog } from "@/components/academy/class-enrollment-dialog"

interface ClassStudentsTabProps {
  classId: string
  canManageEnrollment?: boolean
}

export function ClassStudentsTab({
  classId,
  canManageEnrollment = false,
}: ClassStudentsTabProps) {
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false)

  const {
    data: enrollments = [],
    isLoading: isLoadingEnrollments,
  } = useAcademyEnrollments({ classId, page: 1, limit: 100 } as any)

  const createEnrollment = useCreateAcademyEnrollment()
  const cancelEnrollment = useCancelAcademyEnrollment()
  const deleteEnrollment = useDeleteAcademyEnrollment()

  const handleCreateEnrollment = async (data: any) => {
    try {
      await createEnrollment.mutateAsync(data)
      toast.success("Đã ghi danh học viên vào lớp")
      setEnrollmentDialogOpen(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Không thể ghi danh học viên")
    }
  }

  const handleCancel = async (enrollment: AcademyEnrollment) => {
    try {
      await cancelEnrollment.mutateAsync(enrollment.id)
      toast.success("Đã cập nhật trạng thái ghi danh thành CANCELLED")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Không thể cập nhật trạng thái")
    }
  }

  const handleDelete = async (enrollment: AcademyEnrollment) => {
    try {
      await deleteEnrollment.mutateAsync(enrollment.id)
      toast.success("Đã xóa ghi danh khỏi lớp")
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
          <Button size="lg" onClick={() => setEnrollmentDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ghi danh học viên
          </Button>
        </div>
      )}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
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
                      {en.status}
                    </Badge>
                  </TableCell>
                  {canManageEnrollment && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {en.status === "ACTIVE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(en)}
                            disabled={cancelEnrollment.isPending}
                          >
                            Hủy kích hoạt
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(en)}
                          disabled={deleteEnrollment.isPending}
                        >
                          <Trash2 className="size-4 text-destructive" />
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

      <ClassEnrollmentDialog
        open={enrollmentDialogOpen}
        onOpenChange={setEnrollmentDialogOpen}
        classId={classId}
        submitting={createEnrollment.isPending}
        onSubmit={handleCreateEnrollment}
      />
    </div>
  )
}
