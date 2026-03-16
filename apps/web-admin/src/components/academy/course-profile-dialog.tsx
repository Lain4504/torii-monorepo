
import { toast } from "@workspace/ui/components/sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

import {
  useAcademyCourseProfile,
  useCreateAcademyCourseProfile,
  useUpdateAcademyCourseProfile,
} from "@/lib/api/services/academy-course-profiles"
import { CourseProfileForm } from "@/components/academy/course-profile-form"
import type {
  AcademyCourseProfileCreateDTO,
  AcademyCourseProfileUpdateDTO,
} from "@workspace/schemas"

interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCourseProfileDialog({ open, onOpenChange }: BaseDialogProps) {
  const create = useCreateAcademyCourseProfile()

  const handleClose = () => {
    if (!create.isPending) {
      onOpenChange(false)
    }
  }

  const handleSubmit = async (input: AcademyCourseProfileCreateDTO) => {
    try {
      await create.mutateAsync(input)
      toast.success("Đã tạo Course Profile")
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Không thể tạo Course Profile")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-0 shrink-0">
          <DialogTitle>Tạo Course Profile mới</DialogTitle>
          <DialogDescription>
            Tạo khung chương trình đào tạo tổng quát (ví dụ: JLPT N5).
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-6 p-6">
            <CourseProfileForm
              mode="create"
              submitting={create.isPending}
              onCancel={handleClose}
              onSubmit={handleSubmit}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface EditCourseProfileDialogProps extends BaseDialogProps {
  id?: string
}

export function EditCourseProfileDialog({ id, open, onOpenChange }: EditCourseProfileDialogProps) {
  const { data: profile, isLoading } = useAcademyCourseProfile(id)
  const update = useUpdateAcademyCourseProfile()

  const handleClose = () => {
    if (!update.isPending) {
      onOpenChange(false)
    }
  }

  const handleSubmit = async (input: AcademyCourseProfileUpdateDTO) => {
    if (!id) return
    try {
      await update.mutateAsync({ id, input })
      toast.success("Đã cập nhật Course Profile")
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Không thể cập nhật Course Profile")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-0 shrink-0">
          <DialogTitle>Cập nhật Course Profile</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin khóa học trừu tượng.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-6 p-6">
            {isLoading || !profile ? (
              <div className="p-6 text-center text-muted-foreground">
                Đang tải dữ liệu Course Profile...
              </div>
            ) : (
              <CourseProfileForm
                mode="edit"
                initial={profile}
                submitting={update.isPending}
                onCancel={handleClose}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

