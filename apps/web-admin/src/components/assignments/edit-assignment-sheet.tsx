
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@workspace/ui/components/sheet";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { TiptapEditor } from "@workspace/ui/components/tiptap-editor";
import { MultiFileUpload } from "@/components/common/multi-file-upload";
import type { UpdateAssignmentDto, AssignmentResponseDTO } from "@workspace/schemas";
import { AssignmentType } from "@workspace/schemas";
import { useUpdateAssignment } from "@/api/services/assignments";
import { toast } from "@workspace/ui/components/sonner";
import { Paperclip, Info, Save } from "lucide-react";
import { Textarea } from "@workspace/ui/components/textarea";
import { Spinner } from "@workspace/ui/components/spinner";

interface EditAssignmentSheetProps {
  assignment: AssignmentResponseDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAssignmentSheet({
  assignment,
  open,
  onOpenChange,
}: EditAssignmentSheetProps) {
  const updateMutation = useUpdateAssignment();

  const formSchema = z.object({
    title: z.string().min(1, "Vui lòng nhập tiêu đề").optional(),
    description: z.string().min(1, "Vui lòng nhập mô tả").optional(),
    type: z.nativeEnum(AssignmentType).optional(),
    courseId: z.string().uuid().optional().nullable(),
    moduleId: z.string().uuid().optional().nullable(),
    lessonId: z.string().uuid().optional().nullable(),
    maxScore: z.number().min(0).max(1000).optional(),
    passingScore: z.number().min(0).max(1000).optional().nullable(),
    dueDate: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.string().optional()),
    allowLateSubmission: z.boolean().optional(),
    latePenaltyPercent: z.number().min(0).max(100).optional().nullable(),
    allowedFileTypes: z.array(z.string()).optional(),
    instructions: z.string().optional().nullable(),
    attachmentUrls: z.array(z.string()).optional(),
  });

  const form = useForm<UpdateAssignmentDto>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      type: AssignmentType.TEXT,
      maxScore: 100,
      passingScore: 50,
      allowLateSubmission: true,
      latePenaltyPercent: 10,
      allowedFileTypes: [".pdf", ".zip", ".doc", ".docx"],
      instructions: "",
      attachmentUrls: [],
    },
  });

  useEffect(() => {
    if (assignment) {
      // Format dueDate for datetime-local input (YYYY-MM-DDThh:mm)
      let formattedDate = "";
      if (assignment.dueDate) {
        const date = new Date(assignment.dueDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().slice(0, 16);
        }
      }

      form.reset({
        title: assignment.title,
        description: assignment.description || "",
        type: assignment.type as AssignmentType,
        courseId: assignment.courseId,
        moduleId: assignment.moduleId,
        lessonId: assignment.lessonId,
        maxScore: assignment.maxScore,
        passingScore: assignment.passingScore,
        dueDate: formattedDate,
        allowLateSubmission: assignment.allowLateSubmission,
        latePenaltyPercent: assignment.latePenaltyPercent,
        allowedFileTypes: assignment.allowedFileTypes || [],
        instructions: assignment.instructions || "",
        attachmentUrls: assignment.attachmentUrls || [],
      });
    }
  }, [assignment, form]);

  const onSubmit = async (values: UpdateAssignmentDto) => {
    if (!assignment) return;

    try {
      // Ensure dueDate is valid ISO string if provided
      let dueDate = undefined;
      if (values.dueDate) {
        const date = new Date(values.dueDate);
        if (!isNaN(date.getTime())) {
          dueDate = date.toISOString();
        }
      } else if (values.dueDate === "") {
        dueDate = null as any; // Clear the date
      }

      const data = {
        ...values,
        dueDate,
      };

      await updateMutation.mutateAsync({ id: assignment.id, assignment: data });
      toast.success("Cập nhật bài tập thành công");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.userMessage || "Đã có lỗi xảy ra khi cập nhật bài tập");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Chỉnh Sửa Bài Tập</SheetTitle>
          <SheetDescription>
            Cập nhật các thông số cho bài tập của học viên
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-6 p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col overflow-hidden">
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Tiêu đề bài tập</FieldLabel>
                      <Input placeholder="Nhập tiêu đề..." id={field.name} {...field} value={field.value || ""} />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Mô tả & Yêu cầu</FieldLabel>
                      <TiptapEditor
                        content={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Nhập yêu cầu chi tiết cho bài tập..."
                        className="min-h-[200px]"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="instructions"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                        <Info className="size-4" />
                        Ghi chú bổ sung
                      </FieldLabel>
                      <Textarea
                        placeholder="Nhập ghi chú hoặc hướng dẫn ngắn gọn..."
                        id={field.name}
                        {...field}
                        value={field.value || ""}
                        rows={3}
                      />
                      <FieldDescription>Hiển thị như một ghi chú nhanh cho học viên</FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="type"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Loại bài nộp</FieldLabel>
                        <Select onValueChange={field.onChange} value={field.value || AssignmentType.TEXT}>
                          <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Chọn loại bài nộp" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AssignmentType.TEXT}>Văn bản (Text)</SelectItem>
                            <SelectItem value={AssignmentType.FILE}>Tải tệp (File)</SelectItem>
                            <SelectItem value={AssignmentType.BOTH}>Cả hai (Both)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="dueDate"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Hạn nộp</FieldLabel>
                        <Input type="datetime-local" id={field.name} {...field} value={field.value || ""} />
                        <FieldDescription>Để trống nếu không có hạn nộp</FieldDescription>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="maxScore"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Điểm tối đa</FieldLabel>
                        <Input
                          type="number"
                          id={field.name}
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="passingScore"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Điểm đạt</FieldLabel>
                        <Input
                          type="number"
                          id={field.name}
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </div>

                <FieldSet>
                  <FieldLegend>Cấu hình nộp muộn</FieldLegend>
                  <FieldGroup>
                    <Controller
                      control={form.control}
                      name="allowLateSubmission"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="flex flex-row items-start space-x-3 space-y-0">
                          <Checkbox
                            id={field.name}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <div className="space-y-1 leading-none">
                            <FieldLabel htmlFor={field.name}>Cho phép nộp muộn</FieldLabel>
                            <FieldDescription>Học viên vẫn có thể nộp sau khi hết hạn</FieldDescription>
                          </div>
                        </Field>
                      )}
                    />

                    {form.watch("allowLateSubmission") && (
                      <Controller
                        control={form.control}
                        name="latePenaltyPercent"
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Mức phạt (Gợi ý %)</FieldLabel>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                id={field.name}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="w-24"
                              />
                              <span className="text-sm font-bold">%</span>
                            </div>
                            <FieldDescription>Dùng để hiển thị gợi ý trừ điểm khi giảng viên chấm bài</FieldDescription>
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )}
                      />
                    )}
                  </FieldGroup>
                </FieldSet>

                {(form.watch("type") === AssignmentType.FILE || form.watch("type") === AssignmentType.BOTH) && (
                  <FieldSet>
                    <FieldLegend>Cấu hình tệp đính kèm</FieldLegend>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Controller
                        control={form.control}
                        name="maxFileSize"
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Dung lượng tối đa (MB)</FieldLabel>
                            <Input
                              type="number"
                              id={field.name}
                              placeholder="Cài đặt MB"
                              value={field.value ? field.value / 1048576 : ""}
                              onChange={(e) => field.onChange(Number(e.target.value) * 1048576)}
                            />
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )}
                      />
                      <Controller
                        control={form.control}
                        name="maxFiles"
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Số lượng tối đa</FieldLabel>
                            <Input
                              type="number"
                              id={field.name}
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )}
                      />
                    </div>
                  </FieldSet>
                )}

                <FieldSet>
                  <FieldLegend className="flex items-center gap-2">
                    <Paperclip className="size-4" />
                    Tài liệu bài tập
                  </FieldLegend>
                  <FieldDescription>Tải lên các tài liệu hướng dẫn, tệp mẫu cho bài tập này (PDF, Word, Zip,...)</FieldDescription>
                  <Controller
                    control={form.control}
                    name="attachmentUrls"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <MultiFileUpload
                          onUploadChange={field.onChange}
                          currentUrls={field.value || []}
                          label="Tải tài liệu đính kèm"
                          maxFiles={5}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </FieldSet>
              </FieldGroup>

              <SheetFooter>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy Bỏ
                </Button>
              </SheetFooter>
            </form>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
