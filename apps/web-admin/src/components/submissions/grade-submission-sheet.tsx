import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { 
  GradeSubmissionDto, 
  SubmissionResponseDTO,
} from "@workspace/schemas";
import { 
  gradeSubmissionDto,
} from "@workspace/schemas";
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
import { Textarea } from "@workspace/ui/components/textarea";
import { useGradeSubmission, useReturnSubmission } from "@/api/services/submissions";
import { toast } from "@workspace/ui/components/sonner";
import { Loader2, FileText, Download, ExternalLink, AlertCircle } from "lucide-react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";

interface GradeSubmissionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: SubmissionResponseDTO | null;
  maxScore: number;
}

export function GradeSubmissionSheet({
  open,
  onOpenChange,
  submission,
  maxScore,
}: GradeSubmissionSheetProps) {
  const gradeMutation = useGradeSubmission();
  const returnMutation = useReturnSubmission();

  const form = useForm<GradeSubmissionDto>({
    resolver: zodResolver(gradeSubmissionDto),
    defaultValues: {
      score: 0,
      feedback: "",
    },
  });

  useEffect(() => {
    if (submission) {
      form.reset({
        score: typeof submission.score === 'number' ? submission.score : 0,
        feedback: submission.feedback || "",
      });
    }
  }, [submission, form]);

  const onGrade = async (data: GradeSubmissionDto) => {
    if (!submission) return;
    console.log('📤 Grading submission:', { 
      id: submission.id, 
      data,
      score: data.score,
      feedback: data.feedback,
      scoreType: typeof data.score,
      feedbackType: typeof data.feedback
    });
    try {
      await gradeMutation.mutateAsync({ id: submission.id, data });
      toast.success("Đã chấm điểm thành công");
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Grade error:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.userMessage || "Lỗi khi chấm điểm";
      toast.error(errorMsg);
    }
  };

  const onReturn = async () => {
    if (!submission) return;
    const feedback = form.getValues("feedback");
    if (!feedback) {
      toast.error("Vui lòng nhập phản hồi để trả lại bài");
      return;
    }
    try {
      await returnMutation.mutateAsync({ id: submission.id, data: { feedback } });
      toast.success("Đã trả lại bài cho học viên");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.userMessage || "Lỗi khi trả lại bài");
    }
  };

  if (!submission) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[800px] flex flex-col gap-0 p-0 text-left">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center gap-3 mb-1">
            <SheetTitle className="text-xl font-sans font-bold italic tracking-tight uppercase">
              Chấm <span className="text-primary not-italic">Bài Làm</span>
            </SheetTitle>
            <Badge variant={submission.isLate ? "destructive" : "outline"} className="rounded-lg uppercase text-[10px] font-bold">
               {submission.isLate ? "Nộp muộn" : "Đúng hạn"}
            </Badge>
          </div>
          <SheetDescription className="text-xs uppercase tracking-widest text-muted-foreground/50">
            Học viên: {(submission as any).user?.displayName || submission.userId}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 max-h-[calc(100vh-180px)]">
          <div className="p-6 space-y-8">
            {/* Submission Content */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Nội dung bài nộp</h3>
              </div>
              
              {submission.textAnswer && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-sm leading-relaxed whitespace-pre-wrap">
                  {submission.textAnswer}
                </div>
              )}

              {submission.fileUrls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {submission.fileUrls.map((url, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 group hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 rounded-lg bg-primary/5 text-primary">
                          <Download className="size-4" />
                        </div>
                        <span className="text-xs font-medium truncate max-w-[150px]">
                          Tệp đính kèm {i + 1}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 rounded-lg"
                        onClick={() => window.open(url, '_blank')}
                      >
                        <ExternalLink className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!submission.textAnswer && submission.fileUrls.length === 0 && (
                <p className="text-sm italic text-muted-foreground/50 text-center py-8">Không có nội dung bài nộp.</p>
              )}
            </section>

            <Separator className="bg-border/10" />

            {/* Grading Form */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Đánh giá & Chấm điểm</h3>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onGrade)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="score"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Điểm số</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value || ''}
                                onChange={e => {
                                  const input = e.target.value;
                                  if (input === '') {
                                    field.onChange(0);
                                  } else {
                                    const value = parseFloat(input);
                                    field.onChange(isNaN(value) ? 0 : value);
                                  }
                                }}
                                className="rounded-xl pr-12 font-bold text-lg" 
                                placeholder="0"
                                min="0"
                                max={maxScore}
                                step="0.5"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-muted-foreground/40 italic">
                                / {maxScore} pt
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription className="text-[9px] uppercase tracking-tighter">
                            Thang điểm tối đa: {maxScore}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Phản hồi (Feedback)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="min-h-[150px] rounded-xl resize-none" 
                            placeholder="Nhập nhận xét của bạn về bài làm này..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex items-center justify-between gap-4 border-t border-border/10">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onReturn}
                      disabled={returnMutation.isPending || gradeMutation.isPending}
                      className="flex-1 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white font-sans font-bold italic text-xs uppercase transition-all"
                    >
                      {returnMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Yêu cầu sửa lại
                    </Button>
                    <Button
                      type="submit"
                      disabled={gradeMutation.isPending || returnMutation.isPending}
                      className="flex-1 rounded-xl font-sans font-bold italic text-xs uppercase shadow-lg shadow-primary/20"
                    >
                      {gradeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Hoàn tất chấm điểm
                    </Button>
                  </div>
                </form>
              </Form>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
