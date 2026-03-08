import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyExamCreateDTOSchema,
  academyExamUpdateDTOSchema,
  type AcademyExamCreateDTO,
  type AcademyExamUpdateDTO,
} from "@workspace/schemas"
import type { AcademyExam } from "@/lib/api/services/academy-exams"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { SectionListEditor } from "@/components/academy/section-list-editor"
import { KeyValueEditor } from "@/components/academy/key-value-editor"

export function ExamForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
  defaultCourseProfileId,
}: {
  mode: "create" | "edit"
  initial?: AcademyExam
  onSubmit: (data: AcademyExamCreateDTO | AcademyExamUpdateDTO) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  defaultCourseProfileId?: string
}) {
  const isEdit = mode === "edit"
  const { data: profiles = [] } = useAcademyCourseProfiles({})

  const { handleSubmit, control } = useForm<
    AcademyExamCreateDTO | AcademyExamUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit ? academyExamUpdateDTOSchema : academyExamCreateDTOSchema) as any,
    ) as any,
    defaultValues: isEdit
      ? {
        title: initial?.title ?? "",
        description: initial?.description ?? undefined,
        examType: initial?.examType ?? undefined,
        level: initial?.level ?? undefined,
        totalTimeLimitMinutes: initial?.totalTimeLimitMinutes ?? undefined,
        status: initial?.status ?? undefined,
        settings: initial?.settings ?? undefined,
      }
      : {
        courseProfileId: defaultCourseProfileId,
        title: "",
        description: undefined,
        examType: "COURSE",
        level: undefined,
        totalTimeLimitMinutes: undefined,
        status: "DRAFT",
        settings: undefined,
        sections: [],
      },
  })

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
          <CardDescription>Thiết lập tiêu đề, mô tả và phân loại đề thi.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {!isEdit && (
              <Controller
                name={"courseProfileId" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Course Profile</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn Course Profile..." />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.code} - {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>Liên kết đề thi này với một hồ sơ khóa học cụ thể.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            )}

            <Controller
              name={"title" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Tiêu đề đề thi</FieldLabel>
                  <Input placeholder="Ví dụ: Kiểm tra cuối khóa JLPT N5" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name={"description" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Mô tả đề thi</FieldLabel>
                  <RichTextEditor
                    initialContent={field.value || ""}
                    onUpdate={(data: string) => field.onChange(data)}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name={"examType" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Loại đề thi</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COURSE">Course (Trong khóa học)</SelectItem>
                        <SelectItem value="PLACEMENT">Placement (Kiểm tra đầu vào)</SelectItem>
                        <SelectItem value="MOCK">Mock (Thi thử)</SelectItem>
                        <SelectItem value="CERTIFICATION">Certification (Chứng chỉ)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                name={"level" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Cấp độ (Level)</FieldLabel>
                    <Input placeholder="Ví dụ: N5, N4, Beginner..." {...field} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cấu hình & Trạng thái</CardTitle>
          <CardDescription>Thiết lập thời gian làm bài, trạng thái và các tùy chọn nâng cao.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name={"totalTimeLimitMinutes" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Thời gian làm bài (Phút)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                    <FieldDescription>Nếu để trống, thí sinh không bị giới hạn thời gian.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                name={"status" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Trạng thái</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft (Nháp)</SelectItem>
                        <SelectItem value="PUBLISHED">Published (Công khai)</SelectItem>
                        <SelectItem value="ARCHIVED">Archived (Lưu trữ)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>

            <Controller
              name={"settings" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Cấu hình nâng cao (Key-Value)</FieldLabel>
                  <KeyValueEditor
                    value={field.value || {}}
                    onChange={field.onChange}
                    presets={[
                      { key: "maxAttemptsPerUser", label: "Số lần làm tối đa", defaultValue: "1" },
                      { key: "shuffleQuestions", label: "Trộn câu hỏi", defaultValue: "true" },
                      { key: "showResultType", label: "Hiển thị kết quả", defaultValue: "DETAILED" },
                      { key: "passingScore", label: "Điểm đạt", defaultValue: "50" },
                      { key: "timeLimit", label: "Thời gian (phút)", defaultValue: "60" },
                      { key: "allowReview", label: "Xem lại bài", defaultValue: "true" },
                    ]}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {!isEdit && (
              <Controller
                name={"sections" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Cấu trúc đề thi (Sections)</FieldLabel>
                    <SectionListEditor
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                    <FieldDescription>Thiết lập các phần thi chính cho đề thi mới.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner className="mr-2" /> : null}
          {isEdit ? "Lưu thay đổi" : "Tạo Đề thi"}
        </Button>
      </div>
    </form>
  )
}
