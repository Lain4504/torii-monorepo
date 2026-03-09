import { useLocation, useNavigate, useParams } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
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
import { Spinner } from "@workspace/ui/components/spinner"
import { PageHeader } from "@/components/common/page-header"
import {
  useAcademyAssignmentSubmission,
  useUpdateAcademyAssignmentSubmission,
} from "@/lib/api/services/academy-assignment-submissions"
import { Controller, useForm } from "react-hook-form"
import { toast } from "@workspace/ui/components/sonner"
import { RichTextEditor } from "@/components/editor/rich-text-editor"

type FormValues = {
  status?: string
  score?: number
  feedback?: string
}

export default function AcademyAssignmentSubmissionDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const classId = search.get("classId") || undefined
  const returnTab = search.get("tab") || "submissions"
  const backToClass = classId ? `/academy/classes/${classId}?tab=${returnTab}` : "/academy/assignment-submissions"
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
            <CardDescription>Cập nhật điểm số, trạng thái và phản hồi cho học viên.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-6"
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
                  nav(backToClass)
                } catch (e: any) {
                  toast.error(e?.message || "Cập nhật thất bại")
                }
              })}
            >
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    name="status"
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
                            <SelectItem value="SUBMITTED">Submitted (Đã nộp)</SelectItem>
                            <SelectItem value="GRADED">Graded (Đã chấm điểm)</SelectItem>
                            <SelectItem value="RETURNED">Returned (Đã trả bài)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                  <Controller
                    name="score"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Điểm số</FieldLabel>
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
                        <FieldDescription>Điểm số cho bài tập này.</FieldDescription>
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
                      <RichTextEditor
                        initialContent={field.value || ""}
                        onUpdate={(data: string) =>
                          field.onChange(data)
                        }
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => nav(backToClass)}
                  disabled={update.isPending}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? <Spinner className="mr-2" /> : null}
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

