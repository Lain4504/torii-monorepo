import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { useUpdateAcademyCourseModule } from "@/lib/api/services/academy-course-modules"
import { type AcademyCourseModuleUpdateDTO } from "@/lib/api/services/academy-course-modules"

const editModuleSchema = z.object({
  title: z.string().min(2, "Tiêu đề module phải có ít nhất 2 ký tự"),
})

type EditModuleFormValues = z.infer<typeof editModuleSchema>

export function EditCourseModuleDialog({
  open,
  onOpenChange,
  courseProfileId,
  module,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseProfileId: string
  module: any | null
}) {
  const updateMutation = useUpdateAcademyCourseModule()

  const form = useForm<EditModuleFormValues>({
    resolver: zodResolver(editModuleSchema),
    defaultValues: { title: "" },
  })

  useEffect(() => {
    if (!open) return
    if (!module) return
    form.reset({ title: module.title ?? "" })
  }, [open, module, form])

  async function onSubmit(values: EditModuleFormValues) {
    if (!module) return
    const payload: AcademyCourseModuleUpdateDTO = { title: values.title }

    try {
      await updateMutation.mutateAsync({
        courseProfileId,
        moduleId: module.id,
        input: payload,
      })
      toast.success("Cập nhật module thành công")
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Không thể cập nhật module")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Module</DialogTitle>
          <DialogDescription>Thay đổi tiêu đề module.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Tiêu đề module</FieldLabel>
              <Input
                placeholder="VD: Module 1"
                {...form.register("title")}
                disabled={updateMutation.isPending}
              />
              <FieldError>{form.formState.errors.title?.message}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
              <Plus className="size-4" />
              {updateMutation.isPending ? "Đang cập nhật..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

