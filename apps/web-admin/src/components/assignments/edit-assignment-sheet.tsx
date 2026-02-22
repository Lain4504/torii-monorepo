
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@workspace/ui/components/form";
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
import { Loader2, Paperclip, Info, Save } from "lucide-react";
import { Textarea } from "@workspace/ui/components/textarea";

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
      <SheetContent className="w-full sm:max-w-[800px] flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chỉnh Sửa Bài Tập</SheetTitle>
          <SheetDescription>
            Cập nhật các thông số cho bài tập của học viên
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề bài tập</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề..." {...field} value={field.value || ""} className="" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả & Yêu cầu</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Nhập yêu cầu chi tiết cho bài tập..."
                          className="min-h-[200px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Info className="h-3 w-3" />
                        Ghi chú bổ sung
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập ghi chú hoặc hướng dẫn ngắn gọn..."
                          {...field}
                          value={field.value || ""}
                          className="rounded-xl bg-muted/20"
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription className="text-[10px]">Hiển thị như một ghi chú nhanh cho học viên</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại bài nộp</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || AssignmentType.TEXT}>
                          <FormControl>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Chọn loại bài nộp" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={AssignmentType.TEXT}>Văn bản (Text)</SelectItem>
                            <SelectItem value={AssignmentType.FILE}>Tải tệp (File)</SelectItem>
                            <SelectItem value={AssignmentType.BOTH}>Cả hai (Both)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hạn nộp</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} value={field.value || ""} className="" />
                        </FormControl>
                        <FormDescription className="text-[10px]">Để trống nếu không có hạn nộp</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Điểm tối đa</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passingScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Điểm đạt</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 border rounded-2xl p-4 bg-muted/30">
                  <h3 className="text-sm font-medium text-muted-foreground">Cấu hình nộp muộn</h3>

                  <FormField
                    control={form.control}
                    name="allowLateSubmission"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Cho phép nộp muộn</FormLabel>
                          <FormDescription className="text-[10px]">Học viên vẫn có thể nộp sau khi hết hạn</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("allowLateSubmission") && (
                    <FormField
                      control={form.control}
                      name="latePenaltyPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium tracking-tight">Mức phạt (Gợi ý %)</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="rounded-xl w-24"
                              />
                              <span className="text-sm font-bold">%</span>
                            </div>
                          </FormControl>
                          <FormDescription className="text-[10px]">Dùng để hiển thị gợi ý trừ điểm khi giảng viên chấm bài</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {(form.watch("type") === AssignmentType.FILE || form.watch("type") === AssignmentType.BOTH) && (
                  <div className="space-y-4 border rounded-2xl p-4 bg-muted/30">
                    <h3 className="text-sm font-medium text-muted-foreground">Cấu hình tệp đính kèm</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maxFileSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dung lượng tối đa (MB)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Cài đặt MB"
                                value={field.value ? field.value / 1048576 : ""}
                                onChange={(e) => field.onChange(Number(e.target.value) * 1048576)}
                                className=""
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxFiles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số lượng tối đa</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className=""
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4 border rounded-2xl p-6 bg-primary/5 border-primary/10">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium text-primary">Tài liệu bài tập</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-tight">
                    Tải lên các tài liệu hướng dẫn, tệp mẫu cho bài tập này (PDF, Word, Zip,...)
                  </p>

                  <FormField
                    control={form.control}
                    name="attachmentUrls"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MultiFileUpload
                            onUploadChange={field.onChange}
                            currentUrls={field.value || []}
                            label="Tải tài liệu đính kèm"
                            maxFiles={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <SheetFooter>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            </Form>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
