import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
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
import type { CreateAssignmentDto } from "@workspace/schemas";
import { AssignmentType } from "@workspace/schemas";
import { useCreateAssignment } from "@/api/services/assignments";
import { toast } from "@workspace/ui/components/sonner";
import { Loader2, Paperclip, Info } from "lucide-react";
import { Textarea } from "@workspace/ui/components/textarea";

interface CreateAssignmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
}

export function CreateAssignmentSheet({
  open,
  onOpenChange,
  courseId,
  moduleId,
  lessonId,
}: CreateAssignmentSheetProps) {
  const createMutation = useCreateAssignment();

  const formSchema = z.object({
    title: z.string().min(1, "Vui lòng nhập tiêu đề"),
    description: z.string().min(1, "Vui lòng nhập mô tả"),
    type: z.nativeEnum(AssignmentType),
    courseId: z.string().optional(),
    moduleId: z.string().optional(),
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
      courseId,
      moduleId,
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
        courseId,
        moduleId,
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
  }, [open, courseId, moduleId, lessonId, form]);

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
      <SheetContent className="sm:max-w-[800px] h-full flex flex-col gap-0 p-0 overflow-hidden">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="text-xl font-sans font-bold italic tracking-tight uppercase">
            Tạo <span className="text-primary not-italic">Bài Tập Mới</span>
          </SheetTitle>
          <SheetDescription className="text-xs uppercase tracking-widest text-muted-foreground/50">
            Cấu hình các thông số cho bài tập của học viên
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0 w-full">
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider">Tiêu đề bài tập</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề..." {...field} className="rounded-xl" />
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider">Mô tả & Yêu cầu</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          content={field.value}
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
                      <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <Info className="h-3 w-3" />
                        Ghi chú bổ sung
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập ghi chú hoặc hướng dẫn ngắn gọn..."
                          {...field}
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Loại bài nộp</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Hạn nộp</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} className="rounded-xl" />
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Điểm tối đa</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="rounded-xl"
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Điểm đạt</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 border rounded-2xl p-4 bg-muted/30">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cấu hình nộp muộn</h3>

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
                          <FormLabel className="text-xs font-bold uppercase tracking-wider">Cho phép nộp muộn</FormLabel>
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
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cấu hình tệp đính kèm</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maxFileSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-wider">Dung lượng tối đa (MB)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Cài đặt MB"
                                value={field.value ? field.value / 1048576 : ""}
                                onChange={(e) => field.onChange(Number(e.target.value) * 1048576)}
                                className="rounded-xl"
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
                            <FormLabel className="text-xs font-bold uppercase tracking-wider">Số lượng tối đa</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="rounded-xl"
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
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Tài liệu bài tập</h3>
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
                            currentUrls={field.value}
                            label="Tải tài liệu đính kèm"
                            maxFiles={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl font-sans font-bold italic text-xs uppercase"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="rounded-xl font-sans font-bold italic text-xs uppercase"
                  >
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Tạo bài tập
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
