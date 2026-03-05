import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { PageHeader } from "@/components/common/page-header"
import {
  useAcademyAssignmentSubmission,
  useUpdateAcademyAssignmentSubmission,
} from "@/lib/api/services/academy-assignment-submissions"
import { Controller, useForm } from "react-hook-form"
import { toast } from "@workspace/ui/components/sonner"

type FormValues = {
  status?: string
  score?: number
  feedback?: string
}

export default function AcademyAssignmentSubmissionDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: item, isLoading } = useAcademyAssignmentSubmission(id)
  const update = useUpdateAcademyAssignmentSubmission()

  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      status: item?.status ?? undefined,
      score: item?.score ?? undefined,
      feedback:
        item?.content && typeof item.content === "object" && "feedback" in item.content
          ? String((item.content as any).feedback ?? "")
          : "",
    },
    values: item
      ? {
          status: item.status ?? undefined,
          score: item.score ?? undefined,
          feedback:
            item.content && typeof item.content === "object" && "feedback" in item.content
              ? String((item.content as any).feedback ?? "")
              : "",
        }
      : undefined,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chi tiết Assignment Submission"
        subtitle="Xem và chấm điểm bài nộp."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <>
              <div>
                <span className="font-medium">ID:</span>{" "}
                <span className="font-mono text-xs">{item.id}</span>
              </div>
              <div>
                <span className="font-medium">ClassId:</span>{" "}
                <span className="font-mono text-xs">{item.classId}</span>
              </div>
              <div>
                <span className="font-medium">ClassAssessmentId:</span>{" "}
                <span className="font-mono text-xs">{item.classAssessmentId}</span>
              </div>
              <div>
                <span className="font-medium">UserId:</span>{" "}
                <span className="font-mono text-xs">{item.userId}</span>
              </div>
              <div>
                <span className="font-medium">Submitted at:</span>{" "}
                {item.submittedAt
                  ? new Date(item.submittedAt).toLocaleString("vi-VN")
                  : "-"}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!item ? null : (
        <Card>
          <CardHeader>
            <CardTitle>Chấm điểm / cập nhật trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={handleSubmit(async (values) => {
                try {
                  await update.mutateAsync({
                    id: item.id,
                    input: {
                      status: values.status,
                      score:
                        values.score === undefined || Number.isNaN(values.score)
                          ? undefined
                          : values.score,
                      content:
                        values.feedback !== undefined
                          ? {
                              ...(item.content && typeof item.content === "object"
                                ? item.content
                                : {}),
                              feedback: values.feedback,
                            }
                          : item.content,
                    },
                  })
                  toast.success("Đã cập nhật bài nộp")
                  nav("/academy/assignment-submissions")
                } catch (e: any) {
                  toast.error(e?.message || "Cập nhật thất bại")
                }
              })}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Controller
                  name="status"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Trạng thái</FieldLabel>
                      <Input placeholder="DRAFT / SUBMITTED / GRADED / RETURNED" {...field} />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
                <Controller
                  name="score"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Điểm</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={field.value ?? ""}
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
                name="feedback"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Feedback cho học viên</FieldLabel>
                    <Textarea
                      rows={4}
                      placeholder="Nhận xét / hướng dẫn sửa bài..."
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => nav("/academy/assignment-submissions")}
                  disabled={update.isPending}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? <Spinner className="mr-2" /> : null}
                  Lưu
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

