import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldLegend,
} from "@workspace/ui/components/field"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  useCreateAcademyCourseProfile,
  useUpdateAcademyCourseProfile,
  type AcademyCourseProfile,
} from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEditionsPublic } from '@/lib/api/services/academy-course-editions'
import { LessonMediaUploader } from "@/components/academy/lesson-media-uploader"
import { toast } from "sonner"
import { Loader2, Save, X } from "lucide-react"
import type { AcademyCourseEditionModel } from "@workspace/schemas"

const UNSET_EDITION_VALUE = "__none__"

const courseProfileSchema = z.object({
  code: z.string().min(2, "Mã profile phải có ít nhất 2 ký tự"),
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự"),
  description: z.string().optional(),
  level: z.string().optional(),
  /// Logical VOD edition group key; nullable for backward compatibility.
  editionKey: z.union([z.string(), z.null()]).optional(),
  thumbnailUrl: z.union([z.string().url(), z.literal("")]).optional(),
})

type CourseProfileFormValues = z.infer<typeof courseProfileSchema>

interface CourseProfileSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile?: AcademyCourseProfile | null
}

export function CourseProfileSheet({ open, onOpenChange, profile }: CourseProfileSheetProps) {
  const isEditing = !!profile
  const createMutation = useCreateAcademyCourseProfile()
  const updateMutation = useUpdateAcademyCourseProfile()

  const {
    data: editions = [],
    isLoading: editionsLoading,
  } = useAcademyCourseEditionsPublic({})

  const activeEditions = editions.filter((edition) => edition.isActive)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseProfileFormValues>({
    resolver: zodResolver(courseProfileSchema),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      level: "",
      editionKey: null,
      thumbnailUrl: "",
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        code: profile.code,
        title: profile.title,
        description: profile.description || "",
        level: profile.level || "",
        editionKey: (profile as any)?.edition?.key ?? null,
        thumbnailUrl: profile.thumbnailUrl || "",
      })
    } else {
      reset({
        code: "",
        title: "",
        description: "",
        level: "",
        editionKey: null,
        thumbnailUrl: "",
      })
    }
  }, [profile, reset])

  async function onSubmit(values: CourseProfileFormValues) {
    const payload = {
      ...values,
      thumbnailUrl: values.thumbnailUrl?.trim() ? values.thumbnailUrl : undefined,
    }
    try {
      if (isEditing && profile) {
        await updateMutation.mutateAsync({
          id: profile.id,
          input: {
            title: payload.title,
            description: payload.description,
            level: payload.level,
            editionKey: payload.editionKey ?? null,
            thumbnailUrl: payload.thumbnailUrl,
          },
        })
        toast.success("Cập nhật hồ sơ khóa học thành công")
      } else {
        await createMutation.mutateAsync({
          code: payload.code,
          title: payload.title,
          description: payload.description,
          level: payload.level,
          editionKey: payload.editionKey ?? null,
          thumbnailUrl: payload.thumbnailUrl,
        })
        toast.success("Tạo hồ sơ khóa học thành công")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi")
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[800px] max-h-screen p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>{isEditing ? "Chỉnh sửa hồ sơ khóa học" : "Tạo hồ sơ khóa học mới"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Cập nhật thông tin định nghĩa cho khóa học này."
              : "Định nghĩa một đầu mục khóa học mới trong hệ thống."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            <form id="course-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Thông tin cơ bản</FieldLegend>
                  <FieldGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Mã Profile (Code)</FieldLabel>
                        <Controller
                          name="code"
                          control={control}
                          render={({ field }) => (
                            <Input placeholder="VD: N5-PRO" {...field} disabled={isEditing} />
                          )}
                        />
                        <FieldDescription>Mã duy nhất định danh profile.</FieldDescription>
                        <FieldError errors={[errors.code]} />
                      </Field>
                      <Field>
                        <FieldLabel>Cấp độ (Level)</FieldLabel>
                        <Controller
                          name="level"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn cấp độ (N1 - N5)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="N1">N1</SelectItem>
                                <SelectItem value="N2">N2</SelectItem>
                                <SelectItem value="N3">N3</SelectItem>
                                <SelectItem value="N4">N4</SelectItem>
                                <SelectItem value="N5">N5</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldDescription>Cấp độ học thuật (JLPT, v.v.)</FieldDescription>
                        <FieldError errors={[errors.level]} />
                      </Field>

                      <Field>
                        <FieldLabel>Nhóm Edition (CourseEdition)</FieldLabel>
                        <Controller
                          name="editionKey"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value ?? UNSET_EDITION_VALUE}
                              onValueChange={(v) => field.onChange(v === UNSET_EDITION_VALUE ? null : v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Không đặt (null)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={UNSET_EDITION_VALUE}>Không đặt</SelectItem>
                                {editionsLoading
                                  ? null
                                  : activeEditions.map((e: AcademyCourseEditionModel) => (
                                    <SelectItem key={e.id} value={e.key}>
                                      {e.title || e.key}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldDescription>
                          Dùng cho logic chặn mua trùng VOD theo phiên bản logic.
                        </FieldDescription>
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel>Tiêu đề</FieldLabel>
                      <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                          <Input placeholder="VD: Tiếng Nhật Sơ cấp N5" {...field} />
                        )}
                      />
                      <FieldError errors={[errors.title]} />
                    </Field>

                    <Field>
                      <FieldLabel>Mô tả</FieldLabel>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            placeholder="Mô tả chi tiết về mục tiêu và nội dung khóa học..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        )}
                      />
                      <FieldError errors={[errors.description]} />
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Hình ảnh</FieldLegend>
                  <FieldDescription>
                    Ảnh đại diện (thumbnail) cho khóa học. Hỗ trợ JPG, PNG, WebP.
                  </FieldDescription>
                  <Controller
                    name="thumbnailUrl"
                    control={control}
                    render={({ field, fieldState }) => (
                      <LessonMediaUploader
                        value={field.value || null}
                        onChange={(url) => field.onChange(url ?? "")}
                        label="Ảnh đại diện (Thumbnail)"
                        description="Chọn hoặc tải lên ảnh đại diện cho course profile."
                        accept="image/*"
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                </FieldSet>
              </FieldGroup>
            </form>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-muted/20 shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="gap-2 border-slate-500/30 text-slate-700 bg-transparent hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="size-4" />
            Hủy
          </Button>
          <Button
            type="submit"
            form="course-profile-form"
            disabled={isLoading}
            variant="outline"
            className="gap-2 border-primary/30 text-primary bg-transparent hover:bg-primary/5"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isEditing ? "Lưu thay đổi" : "Tạo Profile"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
