import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Spinner } from "@workspace/ui/components/spinner"
import type { AcademyClassAssignment } from "@/lib/api/services/academy-class-assignments"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(1, "Nhập tiêu đề bài tập").max(255),
  instructions: z.string().min(1, "Nhập nội dung/hướng dẫn bài tập"),
  titleOverride: z.string().max(255).optional(),
  openAt: z.string().optional(),
  deadline: z.string().optional(),
})

const updateSchema = z.object({
  titleOverride: z.string().max(255).optional(),
  openAt: z.string().optional(),
  deadline: z.string().optional(),
})

type CreateForm = z.infer<typeof createSchema>
type UpdateForm = z.infer<typeof updateSchema>

interface ClassAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: AcademyClassAssignment | null
  submitting?: boolean
  onSubmit: (data: CreateForm | UpdateForm) => Promise<void>
}

export function ClassAssignmentDialog({
  open,
  onOpenChange,
  initial,
  submitting,
  onSubmit,
}: ClassAssignmentDialogProps) {
  const isEdit = !!initial

  const form = useForm<CreateForm | UpdateForm>({
    resolver: zodResolver(isEdit ? updateSchema : createSchema),
    defaultValues: isEdit
      ? {
          titleOverride: initial.titleOverride ?? "",
          openAt: initial.openAt
            ? new Date(initial.openAt).toISOString().slice(0, 16)
            : "",
          deadline: initial.deadline
            ? new Date(initial.deadline).toISOString().slice(0, 16)
            : "",
        }
      : {
          title: "",
          instructions: "",
          titleOverride: "",
          openAt: "",
          deadline: "",
        },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && initial) {
        form.reset({
          titleOverride: initial.titleOverride ?? "",
          openAt: initial.openAt
            ? new Date(initial.openAt).toISOString().slice(0, 16)
            : "",
          deadline: initial.deadline
            ? new Date(initial.deadline).toISOString().slice(0, 16)
            : "",
        })
      } else {
        form.reset({
          title: "",
          instructions: "",
          titleOverride: "",
          openAt: "",
          deadline: "",
        })
      }
    }
  }, [open, isEdit, initial, form])

  const handleOpenChange = (next: boolean) => {
    if (!next && !submitting) {
      form.reset()
    }
    onOpenChange(next)
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      openAt: data.openAt?.trim() ? new Date(data.openAt).toISOString() : undefined,
      deadline: data.deadline?.trim() ? new Date(data.deadline).toISOString() : undefined,
    } as CreateForm | UpdateForm)
    handleOpenChange(false)
  })


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa bài tập" : "Giao bài tập cho lớp"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Điều chỉnh tiêu đề, thời gian mở và deadline cho bài tập đã giao."
              : "Tạo bài tập mới dành riêng cho lớp LIVE này."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            {!isEdit && (
              <>
                <Field>
                  <FieldLabel>Tiêu đề bài tập *</FieldLabel>
                  <Input
                    placeholder="Ví dụ: Bài luận giới thiệu bản thân"
                    {...form.register("title")}
                  />
                  {(form.formState.errors as any)?.title && (
                    <p className="text-destructive text-sm mt-1">
                      {(form.formState.errors as any).title?.message}
                    </p>
                  )}
                </Field>
                <Field>
                  <FieldLabel>Hướng dẫn / Nội dung *</FieldLabel>
                  <Textarea
                    rows={5}
                    placeholder="Mô tả yêu cầu bài tập, độ dài, tiêu chí chấm điểm..."
                    {...form.register("instructions")}
                  />
                  {(form.formState.errors as any)?.instructions && (
                    <p className="text-destructive text-sm mt-1">
                      {(form.formState.errors as any).instructions?.message}
                    </p>
                  )}
                </Field>
              </>
            )}
            {isEdit && (
              <>
                <Field>
                  <FieldLabel>Bài tập</FieldLabel>
                  <p className="text-sm font-medium">
                    {initial.assignment?.title ?? "—"}
                  </p>
                </Field>
                <Field>
                  <FieldLabel>Hướng dẫn</FieldLabel>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {initial.assignment?.instructions ?? "—"}
                  </p>
                </Field>
              </>
            )}

            <Field>
              <FieldLabel>Tiêu đề hiển thị (tuỳ chọn)</FieldLabel>
              <Input
                placeholder="Ví dụ: Bài tập tuần 1 - Sakubun"
                {...form.register("titleOverride")}
              />
              <FieldDescription>
                Ghi đè tên bài tập cho lớp này. Để trống để dùng tên gốc.
              </FieldDescription>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Mở từ</FieldLabel>
                <Input
                  type="datetime-local"
                  {...form.register("openAt")}
                />
              </Field>
              <Field>
                <FieldLabel>Hạn nộp</FieldLabel>
                <Input
                  type="datetime-local"
                  {...form.register("deadline")}
                />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Spinner className="mr-2 h-4 w-4" />}
              {isEdit ? "Lưu" : "Giao bài tập"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
