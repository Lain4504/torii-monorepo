import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@workspace/ui/components/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { toast } from 'sonner'
import { Loader2, Save, X } from 'lucide-react'
import {
  useCreateAcademyCourseEdition,
  useUpdateAcademyCourseEdition,
} from '@/lib/api/services/academy-course-editions'
import type { AcademyCourseEditionModel } from '@workspace/schemas'

const editionSchema = z.object({
  key: z.string().min(1).max(50),
  title: z.string().max(255).optional().nullable(),
  level: z.string().max(50).optional().nullable(),
  isActive: z.boolean(),
})

type EditionFormValues = z.infer<typeof editionSchema>

export function CourseEditionSheet({
  open,
  onOpenChange,
  edition,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  edition?: AcademyCourseEditionModel | null
}) {
  const isEdit = !!edition
  const createMutation = useCreateAcademyCourseEdition()
  const updateMutation = useUpdateAcademyCourseEdition()

  const { control, handleSubmit, reset, formState } = useForm<EditionFormValues>({
    resolver: zodResolver(editionSchema),
    defaultValues: {
      key: '',
      title: '',
      level: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (edition) {
      reset({
        key: edition.key,
        title: edition.title ?? '',
        level: edition.level ?? '',
        isActive: !!edition.isActive,
      })
    } else {
      reset({
        key: '',
        title: '',
        level: '',
        isActive: true,
      })
    }
  }, [edition, reset])

  async function onSubmit(values: EditionFormValues) {
    try {
      if (isEdit && edition) {
        await updateMutation.mutateAsync({
          id: edition.id,
          input: {
            title: values.title || undefined,
            level: values.level || undefined,
            isActive: values.isActive,
          },
        })
        toast.success(`Đã cập nhật edition ${edition.key}`)
      } else {
        await createMutation.mutateAsync({
          key: values.key,
          title: values.title || undefined,
          level: values.level || undefined,
          isActive: values.isActive,
        })
        toast.success(`Đã tạo edition ${values.key}`)
      }
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Đã xảy ra lỗi')
    }
  }

  const loading = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[720px] max-h-screen p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>{isEdit ? 'Chỉnh sửa CourseEdition' : 'Tạo CourseEdition'}</SheetTitle>
          <SheetDescription>Nhóm logic dùng cho VOD (ví dụ N5, N4, ...)</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            <form id="course-edition-form" onSubmit={handleSubmit((v) => onSubmit(v as any))} className="space-y-6">
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Thông tin</FieldLegend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Mã (key)</FieldLabel>
                      <Controller
                        name="key"
                        control={control}
                        render={({ field }) => (
                          <Input placeholder="VD: N5" {...field} disabled={isEdit} />
                        )}
                      />
                      <FieldDescription>Key là duy nhất.</FieldDescription>
                      <FieldError errors={[formState.errors.key]} />
                    </Field>

                    <Field>
                      <FieldLabel>Trạng thái</FieldLabel>
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ? 'true' : 'false'}
                            onValueChange={(v) => field.onChange(v === 'true')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError errors={[formState.errors.isActive]} />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>Tiêu đề</FieldLabel>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="VD: JLPT N5 (bản logic)"
                          {...field}
                          value={field.value ?? ''}
                        />
                      )}
                    />
                    <FieldDescription>Tuỳ chọn.</FieldDescription>
                    <FieldError errors={[formState.errors.title]} />
                  </Field>

                  <Field>
                    <FieldLabel>Level (tuỳ chọn)</FieldLabel>
                    <Controller
                      name="level"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="VD: N5"
                          {...field}
                          value={field.value ?? ''}
                        />
                      )}
                    />
                    <FieldDescription>Dùng cho hiển thị/filter.</FieldDescription>
                    <FieldError errors={[formState.errors.level]} />
                  </Field>
                </FieldSet>
              </FieldGroup>
            </form>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-muted/20 shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="gap-2 border-slate-500/30 text-slate-700 bg-transparent hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="size-4" />
            Hủy
          </Button>
          <Button
            type="submit"
            form="course-edition-form"
            disabled={loading}
            variant="outline"
            className="gap-2 border-primary/30 text-primary bg-transparent hover:bg-primary/5"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isEdit ? 'Lưu thay đổi' : 'Tạo'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

