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
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyClassAssessmentCreateDTOSchema,
  academyClassAssessmentUpdateDTOSchema,
  type AcademyClassAssessmentCreateDTO,
  type AcademyClassAssessmentUpdateDTO,
} from "@workspace/schemas"
import type { AcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import { useAcademyQuizTemplates } from "@/lib/api/services/academy-quiz-templates"
import { useAcademyAssignmentTemplates } from "@/lib/api/services/academy-assignment-templates"
import { KeyValueEditor } from "@/components/academy/key-value-editor"

export function ClassAssessmentForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
  defaultClassId,
}: {
  mode: "create" | "edit"
  initial?: AcademyClassAssessment
  onSubmit: (
    data: AcademyClassAssessmentCreateDTO | AcademyClassAssessmentUpdateDTO,
  ) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  defaultClassId?: string
}) {
  const isEdit = mode === "edit"
  const classId = isEdit ? initial?.classId : defaultClassId

  const { data: academyClass } = useAcademyClass(classId)
  const cpId = academyClass?.courseProfileId

  const { data: quizTemplates = [] } = useAcademyQuizTemplates(
    cpId ? { courseProfileId: cpId } : {}
  )
  const { data: assignmentTemplates = [] } = useAcademyAssignmentTemplates(
    cpId ? { courseProfileId: cpId } : {}
  )

  const { handleSubmit, control, watch } = useForm<
    AcademyClassAssessmentCreateDTO | AcademyClassAssessmentUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit
        ? academyClassAssessmentUpdateDTOSchema
        : academyClassAssessmentCreateDTOSchema) as any,
    ) as any,
    defaultValues: isEdit
      ? {
        titleOverride: initial?.titleOverride ?? undefined,
        deadline: initial?.deadline ? new Date(initial.deadline) : undefined,
        weight: initial?.weight ?? undefined,
        maxAttemptsOverride: initial?.maxAttemptsOverride ?? undefined,
        timeLimitOverrideMinutes: initial?.timeLimitOverrideMinutes ?? undefined,
        maxScoreOverride: initial?.maxScoreOverride ?? undefined,
        status: initial?.status ?? undefined,
        settings: (initial as any)?.settings ?? undefined,
      }
      : {
        classId: defaultClassId ?? "",
        kind: "QUIZ",
        quizTemplateId: undefined,
        assignmentTemplateId: undefined,
        titleOverride: undefined,
        deadline: undefined,
        weight: undefined,
        maxAttemptsOverride: undefined,
        timeLimitOverrideMinutes: undefined,
        maxScoreOverride: undefined,
        status: "DRAFT",
        settings: undefined,
      },
  })

  const kind = watch("kind")

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Loại hình & Liên kết</CardTitle>
          <CardDescription>Xác định loại đánh giá và liên kết với template.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {!isEdit && (
              <>
                <Controller
                  name={"classId" as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Class ID</FieldLabel>
                      <Input placeholder="UUID của Class" disabled {...field} />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    name={"kind" as any}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Loại đánh giá</FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="QUIZ">Quiz (Trắc nghiệm)</SelectItem>
                            <SelectItem value="ASSIGNMENT">Assignment (Bài tập về nhà)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                  {kind === "QUIZ" ? (
                    <Controller
                      name={"quizTemplateId" as any}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel>Quiz Template</FieldLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn template..." />
                            </SelectTrigger>
                            <SelectContent>
                              {quizTemplates.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                  ) : (
                    <Controller
                      name={"assignmentTemplateId" as any}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel>Assignment Template</FieldLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn template..." />
                            </SelectTrigger>
                            <SelectContent>
                              {assignmentTemplates.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      )}
                    />
                  )}
                </div>
              </>
            )}
            {isEdit && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Loại đánh giá</FieldLabel>
                  <Input disabled value={initial?.kind || "N/A"} />
                </Field>
                <Field>
                  <FieldLabel>Template liên kết</FieldLabel>
                  <Input disabled value={initial?.quizTemplateId || initial?.assignmentTemplateId || "N/A"} />
                </Field>
              </div>
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết</CardTitle>
          <CardDescription>Thiết lập tiêu đề, thời hạn và trọng số điểm.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name={"titleOverride" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Tiêu đề hiển thị (Override)</FieldLabel>
                  <Input placeholder="Ví dụ: Quiz giữa kỳ - Lớp N5-K01" {...field} />
                  <FieldDescription>Nếu để trống, hệ thống sẽ sử dụng tên từ template.</FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <Controller
                name={"deadline" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Hạn chót (Deadline)</FieldLabel>
                    <Input
                      type="datetime-local"
                      value={
                        field.value instanceof Date && !Number.isNaN(field.value.getTime())
                          ? new Date(
                            field.value.getTime() -
                            field.value.getTimezoneOffset() * 60000,
                          )
                            .toISOString()
                            .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : undefined,
                        )
                      }
                    />
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
                      step={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
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
                        <SelectItem value="CLOSED">Closed (Đã đóng)</SelectItem>
                      </SelectContent>
                    </Select>
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
          <CardTitle>Cấu hình bài thi</CardTitle>
          <CardDescription>Thiết lập giới hạn thời gian, số lần làm bài và điểm tối đa.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Controller
              name={"maxAttemptsOverride" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Số lần làm bài tối đa</FieldLabel>
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
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              name={"timeLimitOverrideMinutes" as any}
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
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              name={"maxScoreOverride" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Điểm tối đa</FieldLabel>
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
                />
                <FieldDescription>Dữ liệu cấu hình bổ sung.</FieldDescription>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner className="mr-2" /> : null}
          {isEdit ? "Lưu thay đổi" : "Tạo Đánh giá"}
        </Button>
      </div>
    </form>
  )
}

