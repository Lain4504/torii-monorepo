import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  useCreateAcademyCourseOffering,
  useUpdateAcademyCourseOffering,
  type AcademyCourseOffering,
} from "@/lib/api/services/academy-course-offerings"
import { toast } from "sonner"
import { CourseOfferingForm } from "@/components/academy/course-offering-form"

interface OfferingSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offering?: AcademyCourseOffering | null
}

export function OfferingSheet({ open, onOpenChange, offering }: OfferingSheetProps) {
  const isEditing = !!offering
  const createMutation = useCreateAcademyCourseOffering()
  const updateMutation = useUpdateAcademyCourseOffering()

  const handleFormSubmit = async (data: any) => {
    try {
      if (isEditing && offering) {
        await updateMutation.mutateAsync({
          id: offering.id,
          input: data,
        })
        toast.success("Cập nhật Gói bán thành công")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Tạo Gói bán thành công")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col h-full p-0 overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0 text-left">
          <SheetTitle>{isEditing ? "Chỉnh sửa Gói bán" : "Tạo Gói bán mới"}</SheetTitle>
          <SheetDescription>
            Cấu hình sản phẩm thương mại, giá bán và liên kết kỳ học/lớp học.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            <CourseOfferingForm
              mode={isEditing ? "edit" : "create"}
              initial={offering || undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => onOpenChange(false)}
              submitting={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
