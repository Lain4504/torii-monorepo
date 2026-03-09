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
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import {
    academyClassAssessmentCreateDTOSchema,
    academyClassAssessmentUpdateDTOSchema,
    type AcademyClassAssessmentCreateDTO,
    type AcademyClassAssessmentUpdateDTO,
} from "@workspace/schemas"
import type { AcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import { useAcademyQuizTemplates } from "@/lib/api/services/academy-quiz-templates"
import {
    academyExamsApi,
    useAcademyExams,
    useAddQuestionsFromPool,
    useCreateAcademyExam,
} from "@/lib/api/services/academy-exams"
import { useAcademyQuestionPools } from "@/lib/api/services/academy-question-pools"
import { ClassQuizSourcePanel } from "@/components/academy/class-quiz-source-panel"
import { toast } from "sonner"

export function ClassQuizForm({
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
    const isVodClass = academyClass?.mode === "VOD"

    const { data: quizTemplates = [] } = useAcademyQuizTemplates(
        cpId ? { courseProfileId: cpId } : {}
    )
    const { data: exams = [] } = useAcademyExams(
        cpId ? { courseProfileId: cpId, status: "PUBLISHED" } : {}
    )
    const { data: pools = [] } = useAcademyQuestionPools(
        cpId ? { courseProfileId: cpId, status: "ACTIVE" } : {}
    )
    const createExamMutation = useCreateAcademyExam()
    const addFromPoolMutation = useAddQuestionsFromPool()

    const { handleSubmit, control } = useForm<
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
                settings: {
                    liveOverrideMode: "USE_TEMPLATE_DEFAULT",
                    ...((initial as any)?.settings ?? {}),
                },
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
                settings: { liveOverrideMode: "USE_TEMPLATE_DEFAULT" },
            },
    })

    const onSubmitForm = async (
        data: AcademyClassAssessmentCreateDTO | AcademyClassAssessmentUpdateDTO,
    ) => {
        const formSettings = ((data as any).settings ?? {}) as Record<string, unknown>
        const mode = String(formSettings.liveOverrideMode ?? "USE_TEMPLATE_DEFAULT")
        const nextSettings: Record<string, unknown> = { ...formSettings }

        if (isVodClass) {
            delete nextSettings.overrideExamId
            delete nextSettings.liveOverrideMode
            delete nextSettings.overridePoolId
            delete nextSettings.overrideQuestionCount
            delete nextSettings.overrideShuffleQuestions
            await onSubmit({
                ...data,
                deadline: undefined,
                settings: nextSettings,
            } as AcademyClassAssessmentCreateDTO | AcademyClassAssessmentUpdateDTO)
            return
        }

        if (mode === "GENERATE_FROM_POOL") {
            const poolId = String(formSettings.overridePoolId ?? "").trim()
            const count = Number(formSettings.overrideQuestionCount ?? 10)
            if (!cpId || !poolId || Number.isNaN(count) || count <= 0) {
                throw new Error("Vui lòng chọn pool và số lượng câu hợp lệ để sinh đề.")
            }
            const selectedTemplate = !isEdit
                ? quizTemplates.find((template) => template.id === (data as any).quizTemplateId)
                : undefined
            const examTitle = selectedTemplate
                ? `[LIVE Override] ${selectedTemplate.title}`
                : `[LIVE Override] ${data.titleOverride || "Class Quiz"}`
            const createdExam = await createExamMutation.mutateAsync({
                courseProfileId: cpId,
                title: examTitle,
                description: "Auto-generated from LIVE class override pool",
                examType: "COURSE",
                status: "DRAFT",
                settings: {
                    shuffleQuestions: Boolean(formSettings.overrideShuffleQuestions ?? true),
                },
                sections: [
                    {
                        title: "Section 1",
                        instruction: "Generated from pool",
                        orderIndex: 0,
                    },
                ],
            } as any)
            const sectionId = (createdExam.sections as Array<{ id: string }> | undefined)?.[0]?.id
            if (!sectionId) {
                throw new Error("Không thể tạo section cho exam override.")
            }
            await addFromPoolMutation.mutateAsync({
                examId: createdExam.id,
                sectionId,
                poolId,
                count,
            })
            await academyExamsApi.update(createdExam.id, { status: "PUBLISHED" } as any)
            nextSettings.overrideExamId = createdExam.id
        } else if (mode === "USE_EXISTING_EXAM") {
            const selectedExamId = String(formSettings.overrideExamId ?? "").trim()
            if (!selectedExamId) {
                throw new Error("Vui lòng chọn exam override cho lớp LIVE.")
            }
            nextSettings.overrideExamId = selectedExamId
        } else {
            delete nextSettings.overrideExamId
        }

        await onSubmit({
            ...data,
            settings: nextSettings,
        } as AcademyClassAssessmentCreateDTO | AcademyClassAssessmentUpdateDTO)
    }

    return (
        <form
            className="space-y-6"
            onSubmit={handleSubmit(async (data) => {
                try {
                    await onSubmitForm(data)
                } catch (error: any) {
                    toast.error(error?.message || "Không thể lưu quiz assessment")
                }
            })}
            noValidate
        >
            <Alert>
                <AlertTitle>Flow thao tác nhanh</AlertTitle>
                <AlertDescription>
                    {isVodClass
                        ? "VOD: Chọn Quiz Template -> Lưu quiz assessment. Hệ thống tự dùng đề mặc định từ template."
                        : "LIVE: Chọn Quiz Template -> Chọn nguồn đề (mặc định / exam có sẵn / sinh từ pool) -> Lưu."}
                </AlertDescription>
            </Alert>
            <Card>
                <CardHeader>
                    <CardTitle>Bước 1 - Chọn Quiz Template</CardTitle>
                    <CardDescription>
                        Template định nghĩa khung quiz theo syllabus. VOD luôn đi theo template này.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        {!isEdit ? (
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
                            <Field>
                                <FieldLabel>Template liên kết</FieldLabel>
                                <Input disabled value={initial?.quizTemplateId || "N/A"} />
                            </Field>
                        )}
                    </FieldGroup>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bước 2 - Nguồn đề thi theo loại lớp</CardTitle>
                    <CardDescription>
                        LIVE có thể override đề thi; VOD khóa override để đảm bảo đồng bộ syllabus.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ClassQuizSourcePanel
                        control={control}
                        isVodClass={isVodClass}
                        isEdit={isEdit}
                        exams={exams}
                        pools={pools}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bước 3 - Thông tin chung</CardTitle>
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
                            {!isVodClass ? (
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
                            ) : (
                                <Field>
                                    <FieldLabel>Hạn chót (Deadline)</FieldLabel>
                                    <Input disabled value="VOD không dùng deadline cho quiz" />
                                    <FieldDescription>
                                        Học viên VOD làm quiz theo tiến độ học tập, không theo hạn nộp theo lịch lớp.
                                    </FieldDescription>
                                </Field>
                            )}
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
                    <CardTitle>Bước 4 - Cấu hình Quiz</CardTitle>
                    <CardDescription>Thiết lập giới hạn thời gian và số lần làm bài.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 mb-6">
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
                    </div>

                    <FieldDescription>
                        Nguồn đề thi đã được tách riêng ở Bước 2 để tránh chồng chéo khi thao tác.
                    </FieldDescription>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                    Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? <Spinner className="mr-2" /> : null}
                    {isEdit ? "Lưu thay đổi" : "Tạo Quiz"}
                </Button>
            </div>
        </form>
    )
}
