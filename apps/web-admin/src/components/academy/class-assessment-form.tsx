import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  academyClassAssessmentCreateDTOSchema,
  academyClassAssessmentUpdateDTOSchema,
  type AcademyClassAssessmentCreateDTO,
  type AcademyClassAssessmentUpdateDTO,
} from "@workspace/schemas"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
  FieldSeparator,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { Spinner } from "@workspace/ui/components/spinner"
import { Badge } from "@workspace/ui/components/badge"
import type { AcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"

type ClassAssessmentFormProps = {
  mode: "create" | "edit"
  classId: string
  initial?: AcademyClassAssessment
  defaultKind?: "QUIZ" | "ASSIGNMENT" | "EXAM"
  submitting?: boolean
  onSubmit: (
    data: AcademyClassAssessmentCreateDTO | AcademyClassAssessmentUpdateDTO
  ) => Promise<void>
}

export function ClassAssessmentForm({
  mode,
  classId,
  initial,
  defaultKind = "EXAM",
  submitting,
  onSubmit,
}: ClassAssessmentFormProps) {
  const isEdit = mode === "edit"

  const { control, handleSubmit } = useForm<
    AcademyClassAssessmentCreateDTO | AcademyClassAssessmentUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit
        ? academyClassAssessmentUpdateDTOSchema
        : academyClassAssessmentCreateDTOSchema) as any,
    ) as any,
    defaultValues: (isEdit
      ? {
        classId: initial?.classId,
        kind: initial?.kind as any,
        titleOverride: initial?.titleOverride ?? undefined,
        deadline: initial?.deadline
          ? new Date(initial.deadline).toISOString()
          : undefined,
        weight: initial?.weight ?? undefined,
        maxAttemptsOverride: initial?.maxAttemptsOverride ?? undefined,
        timeLimitOverrideMinutes: initial?.timeLimitOverrideMinutes ?? undefined,
        maxScoreOverride: initial?.maxScoreOverride ?? undefined,
        status: initial?.status ?? "DRAFT",
        settings: initial?.settings ?? undefined,
      }
      : {
        classId,
        kind: defaultKind,
        titleOverride: undefined,
        deadline: undefined,
        weight: 0,
        maxAttemptsOverride: undefined,
        timeLimitOverrideMinutes: undefined,
        maxScoreOverride: undefined,
        status: "DRAFT",
        settings: undefined,
      }) as any,
  })

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data)
      })}
      noValidate
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Thông tin chung</FieldLegend>
          <FieldDescription>
            Cấu hình một bài kiểm tra / bài tập gắn riêng với lớp học này.
          </FieldDescription>
          <FieldGroup>
            <Controller
              name={"kind" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Loại assessment</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXAM">Exam (Đề thi)</SelectItem>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment (Bài tập)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Quy ước hiện tại: Exam/Quiz dùng chung UI thi; Assignment dành cho bài tập tự luận/nộp file.
                  </FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name={"titleOverride" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Tiêu đề hiển thị cho học viên</FieldLabel>
                  <Input
                    placeholder="Ví dụ: Mock Test N5 - Đề 1"
                    {...field}
                  />
                  <FieldDescription>
                    Nếu để trống, hệ thống có thể dùng tiêu đề mặc định từ Exam/Template (tùy backend).
                  </FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Thời gian & trọng số</FieldLegend>
          <FieldDescription>
            Điều chỉnh deadline, trọng số và giới hạn cho bài kiểm tra/bài tập.
          </FieldDescription>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name={"deadline" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Deadline (ISO datetime)</FieldLabel>
                    <Input
                      type="datetime-local"
                      {...field}
                    />
                    <FieldDescription>
                      Hạn nộp / làm bài cho lớp này. Có thể để trống với VOD quiz không có deadline.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name={"weight" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Trọng số (%)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                    <FieldDescription>
                      Tỷ lệ đóng góp của bài này vào tổng điểm lớp (nếu có rule tổng hợp điểm).
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>

            <FieldSeparator />

            <div className="grid gap-4 md:grid-cols-3">
              <Controller
                name={"maxAttemptsOverride" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Số lần làm tối đa (override)</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                    <FieldDescription>Để trống để dùng cấu hình mặc định của Exam.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name={"timeLimitOverrideMinutes" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Thời lượng (phút, override)</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                    <FieldDescription>Để trống để dùng thời lượng mặc định từ Exam.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name={"maxScoreOverride" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Thang điểm tối đa (override)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                    <FieldDescription>Để trống để dùng thang điểm mặc định.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Trạng thái</FieldLegend>
          <FieldGroup>
            <Controller
              name={"status" as any}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Trạng thái publish</FieldLabel>
                  <div className="flex items-center gap-2 mt-1">
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">DRAFT</SelectItem>
                        <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                        <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant={field.value === "PUBLISHED" ? "default" : "secondary"}>
                      {field.value || "DRAFT"}
                    </Badge>
                  </div>
                  <FieldDescription>
                    Chỉ các assessment ở trạng thái <strong>PUBLISHED</strong> mới được hiển thị cho học viên trong lớp.
                  </FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <Field orientation="horizontal" className="justify-end pt-4 border-t">
          <Button
            type="submit"
            disabled={submitting}
            className="min-w-[140px]"
          >
            {submitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
            {isEdit ? "Lưu thay đổi" : "Tạo Assessment"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

