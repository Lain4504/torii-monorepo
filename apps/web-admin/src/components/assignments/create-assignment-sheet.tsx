import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@workspace/ui/components/sheet";
import { Controller } from "react-hook-form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
} from "@workspace/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { TiptapEditor } from "@workspace/ui/components/tiptap-editor";
import { MultiFileUpload } from "@/components/common/multi-file-upload";
import type { CreateAssignmentDto } from "@workspace/schemas";
import { AssignmentType } from "@workspace/schemas";
import { useCreateAssignment } from "@/lib/api/services/assignments";
import { toast } from "@workspace/ui/components/sonner";
import { Paperclip, Info, List } from "lucide-react";
import { Textarea } from "@workspace/ui/components/textarea";
import { Spinner } from "@workspace/ui/components/spinner";
import { useCourseRun } from '@/lib/api/services/course-runs';
import { useCourseModules } from '@/lib/api/services/modules';
import { useModulesLessons } from '@/lib/api/services/lesson';

interface CreateAssignmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId?: string;
  courseRunId?: string;
}

export function CreateAssignmentSheet({
  open,
  onOpenChange,
  lessonId,
  courseRunId,
}: CreateAssignmentSheetProps) {
  const createMutation = useCreateAssignment();
  const { data: courseRun } = useCourseRun(courseRunId || '');
  const { data: modules = [] } = useCourseModules(courseRun?.courseMasterId || '');
  const modulesLessonsQueries = useModulesLessons(modules);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessonId || '');

  // Show all lessons — any lesson can have an assignment linked to it
  const allLessons = useMemo(() => {
    return modulesLessonsQueries
      .map(query => query.data?.data || [])
      .flat();
  }, [modulesLessonsQueries]);

  useEffect(() => {
    if (lessonId) {
      setSelectedLessonId(lessonId);
    }
  }, [lessonId]);

  const formSchema = z.object({
    title: z.string().min(1, "Vui lòng nhập tiêu đề"),
    description: z.string().min(1, "Vui lòng nhập mô tả"),
    type: z.nativeEnum(AssignmentType),
    lessonId: z.string().optional(),
    maxScore: z.number().min(0).max(1000),
    passingScore: z.number().min(0).max(1000).optional(),
    dueDate: z.preprocess((val) => (val === "" ? undefined : val), z.string().optional()),
    allowLateSubmission: z.boolean().default(true),
    latePenaltyPercent: z.number().min(0).max(100).optional(),
    allowedFileTypes: z.array(z.string()).default([]),
    instructions: z.string().optional(),
    attachmentUrls: z.array(z.string()).default([]),
  });

  const form = useForm<CreateAssignmentDto>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      type: AssignmentType.TEXT,
      lessonId,
      maxScore: 100,
      passingScore: 50,
      allowLateSubmission: true,
      latePenaltyPercent: 10,
      allowedFileTypes: [".pdf", ".zip", ".doc", ".docx"],
      instructions: "",
      attachmentUrls: [],
    },
  });

  // Reset form when context IDs change or sheet opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        description: "",
        type: AssignmentType.TEXT,
        lessonId,
        maxScore: 100,
        passingScore: 50,
        allowLateSubmission: true,
        latePenaltyPercent: 10,
        allowedFileTypes: [".pdf", ".zip", ".doc", ".docx"],
        instructions: "",
        attachmentUrls: [],
      });
    }
  }, [open, lessonId, form]);

  const onSubmit = async (values: CreateAssignmentDto) => {
    try {
      // Ensure dueDate is valid ISO string if provided
      let dueDate = undefined;
      if (values.dueDate) {
        const date = new Date(values.dueDate);
        if (!isNaN(date.getTime())) {
          dueDate = date.toISOString();
        }
      }

      const data = {
        ...values,
        dueDate,
        ...(courseRunId ? { courseRunId } : {}),
        ...((selectedLessonId && selectedLessonId !== 'none') ? { lessonId: selectedLessonId } : {}),
      };
      await createMutation.mutateAsync(data);
      toast.success("Tạo bài tập thành công");
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.userMessage || "Đã có lỗi xảy ra khi tạo bài tập");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Tạo Bài Tập Mới</SheetTitle>
          <SheetDescription>
            Cấu hình các thông số bài tập cho học viên trong lớp học này
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
                      <Input placeholder="Nhập tiêu đề..." id={field.name} {...field} />
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
                        content={field.value}
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
                        rows={3}
                      />
                      <FieldDescription>Hiển thị như một ghi chú nhanh cho học viên</FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                {courseRunId && (
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <List className="size-4" />
                      Gắn với Lesson
                    </FieldLabel>
                    <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bài học để gắn bài tập..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không gắn với lesson cụ thể</SelectItem>
                        {allLessons.length === 0 ? (
                          <SelectItem value="no-lessons" disabled>
                            Không có lesson nào trong lớp này
                          </SelectItem>
                        ) : (
                          allLessons.map((lesson) => (
                            <SelectItem key={lesson.id} value={lesson.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{lesson.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {lesson.contentType} · ID: {lesson.id.slice(0, 8)}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Học viên cần hoàn thành bài tập này để pass bài học
                    </FieldDescription>
                  </Field>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="type"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Loại bài nộp</FieldLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Input type="datetime-local" id={field.name} {...field} />
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
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </div>

                <FieldSet>
                  <FieldLegend>Cấu hình nộp muộn (tùy chọn)</FieldLegend>
                  <FieldGroup>
                    <Controller
                      control={form.control}
                      name="allowLateSubmission"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="space-y-1 leading-none">
                              <FieldLabel htmlFor={field.name}>Cho phép nộp muộn</FieldLabel>
                              <FieldDescription>
                                Học viên vẫn có thể nộp bài sau hạn, hệ thống không tự trừ điểm.
                              </FieldDescription>
                            </div>
                            <Switch
                              id={field.name}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
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
                            <FieldLabel htmlFor={field.name}>Mức phạt gợi ý (%)</FieldLabel>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                id={field.name}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="w-24"
                              />
                              <span className="text-sm font-bold">%</span>
                            </div>
                            <FieldDescription>
                              Chỉ hiển thị như gợi ý cho giảng viên khi chấm bài, ví dụ: 10 = trừ 10% tổng điểm.
                            </FieldDescription>
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
                              placeholder="Nhập dung lượng"
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
                          currentUrls={field.value}
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
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo bài tập"
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
