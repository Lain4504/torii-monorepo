import { Controller, type UseFormReturn } from "react-hook-form"
import {
    Field,
    FieldError,
    FieldLabel,
    FieldDescription,
    FieldGroup,
    FieldSet,
    FieldLegend,
} from "@workspace/ui/components/field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { QuestionPicker } from "./question-picker"
import { StringListEditor } from "./string-list-editor"
import { KeyValueEditor } from "./key-value-editor"
import { QuestionOptionsEditor } from "./question-options-editor"
import { LessonMediaUploader } from "./lesson-media-uploader"
import type { AcademyQuestionCreateDTO, AcademyQuestionUpdateDTO } from "@workspace/schemas"

interface QuestionFormLayoutProps {
    form: UseFormReturn<AcademyQuestionCreateDTO | AcademyQuestionUpdateDTO | any>
    isEdit: boolean
    hideParentPicker?: boolean
    hideQuestionTypeField?: boolean
    lockQuestionType?: boolean
    hideMediaField?: boolean
    hideLevelField?: boolean
    hideCategoryField?: boolean
    lockLevel?: boolean
}

export function QuestionFormLayout({
    form,
    isEdit,
    hideParentPicker,
    hideQuestionTypeField,
    lockQuestionType,
    hideMediaField,
    hideLevelField,
    hideCategoryField,
    lockLevel,
}: QuestionFormLayoutProps) {
    const { control, watch, setValue } = form
    const questionType = watch("questionType")
    const isGroupParent = questionType === "GROUP_PARENT"

    return (
        <div className="space-y-12">
            {/* 1. Phân loại & Ngữ cảnh */}
            <FieldSet>
                <FieldLegend>Thông tin chung</FieldLegend>
                <FieldGroup>
                    {!isEdit && !hideParentPicker && !isGroupParent && (
                        <Controller
                            name="parentId"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Thuộc đoạn văn (Parent)</FieldLabel>
                                    <QuestionPicker
                                        value={field.value}
                                        onSelect={(id) => field.onChange(id || undefined)}
                                        placeholder="Chọn GROUP_PARENT nếu đây là câu hỏi con..."
                                        questionTypeFilter="GROUP_PARENT"
                                        allowClear
                                    />
                                    <FieldDescription>Nếu để trống, đây sẽ là câu hỏi đơn lập.</FieldDescription>
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        {!hideQuestionTypeField && (
                            <Controller
                                name="questionType"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Loại câu hỏi</FieldLabel>
                                        <Select value={field.value} onValueChange={(val) => {
                                            field.onChange(val)
                                            // Clear answers if switching to GROUP_PARENT
                                            if (val === "GROUP_PARENT") {
                                                setValue("options", undefined)
                                                setValue("correctAnswer", undefined)
                                                setValue("parentId", undefined)
                                            }
                                        }}>
                                            <SelectTrigger className="h-11 shadow-sm" disabled={lockQuestionType}>
                                                <SelectValue placeholder="Chọn loại..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SINGLE_CHOICE">Một đáp án</SelectItem>
                                                <SelectItem value="MULTIPLE_CHOICE">Nhiều đáp án</SelectItem>
                                                <SelectItem value="SHORT_ANSWER">Trả lời ngắn</SelectItem>
                                                <SelectItem value="TRUE_FALSE">Đúng/Sai</SelectItem>
                                                <SelectItem value="GROUP_PARENT">Đoạn văn (Group Parent)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        )}

                        {!hideMediaField && (
                            <Controller
                                name="mediaUrl"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <LessonMediaUploader
                                        label="Media (Ảnh/Audio/Video)"
                                        value={field.value || null}
                                        onChange={(url) => field.onChange(url ?? undefined)}
                                        errorMessage={fieldState.error?.message}
                                    />
                                )}
                            />
                        )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {!hideLevelField && (
                            <Controller
                                name="level"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Trình độ</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange} disabled={lockLevel}>
                                            <SelectTrigger className="h-11 shadow-sm">
                                                <SelectValue placeholder="Chọn level..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["N1", "N2", "N3", "N4", "N5", "OTHER"].map((l) => (
                                                    <SelectItem key={l} value={l}>{l}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        )}

                        {!hideCategoryField && (
                            <Controller
                                name="category"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Danh mục</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-11 shadow-sm">
                                                <SelectValue placeholder="Chọn danh mục..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="VOCABULARY">Từ vựng</SelectItem>
                                                <SelectItem value="GRAMMAR">Ngữ pháp</SelectItem>
                                                <SelectItem value="KANJI">Hán tự</SelectItem>
                                                <SelectItem value="READING">Đọc hiểu</SelectItem>
                                                <SelectItem value="LISTENING">Nghe hiểu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        )}
                    </div>
                </FieldGroup>
            </FieldSet>

            {/* 2. Nội dung */}
            <FieldSet>
                <FieldLegend>Nội dung</FieldLegend>
                <FieldGroup>
                    <Controller
                        name="content"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>{isGroupParent ? "Văn bản/Ngữ cảnh" : "Câu hỏi"}</FieldLabel>
                                <RichTextEditor
                                    initialContent={field.value || ""}
                                    onUpdate={field.onChange}
                                    minHeight={isGroupParent ? 300 : 150}
                                />
                                <FieldError>{fieldState.error?.message}</FieldError>
                            </Field>
                        )}
                    />
                </FieldGroup>
            </FieldSet>

            {/* 3. Đáp án (chỉ khi không phải GROUP_PARENT) */}
            {!isGroupParent && (
                <FieldSet>
                    <FieldLegend>Đáp án & Giải thích</FieldLegend>
                    <FieldGroup>
                        {["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"].includes(questionType) ? (
                            <div className="space-y-4">
                                <QuestionOptionsEditor
                                    type={questionType}
                                    options={watch("options")}
                                    correctAnswer={watch("correctAnswer")}
                                    onChange={(opts, correct) => {
                                        setValue("options", opts)
                                        setValue("correctAnswer", correct)
                                    }}
                                />
                            </div>
                        ) : questionType === "SHORT_ANSWER" ? (
                            <Controller
                                name="correctAnswer"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Các đáp án đúng chấp nhận</FieldLabel>
                                        <StringListEditor
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Nhập đáp án..."
                                        />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        ) : null}

                        <Controller
                            name="explanation"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field className="mt-6">
                                    <FieldLabel>Giải thích</FieldLabel>
                                    <RichTextEditor
                                        initialContent={field.value || ""}
                                        onUpdate={field.onChange}
                                        minHeight={150}
                                    />
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </FieldSet>
            )}

            {/* 4. Thông tin bổ sung */}
            <FieldSet>
                <FieldLegend>Nâng cao</FieldLegend>
                <FieldGroup>
                    <Controller
                        name="metadata"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Metadata</FieldLabel>
                                <KeyValueEditor
                                    value={field.value || {}}
                                    onChange={field.onChange}
                                    presets={[
                                        { key: "tags", label: "Tags" },
                                        { key: "difficulty", label: "Độ khó (1-10)" },
                                    ]}
                                />
                                <FieldError>{fieldState.error?.message}</FieldError>
                            </Field>
                        )}
                    />
                </FieldGroup>
            </FieldSet>
        </div>
    )
}
