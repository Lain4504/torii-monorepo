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
  SheetDescription,
  SheetFooter
} from "@workspace/ui/components/sheet";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { useGradeSubmission, useReturnSubmission } from "@/lib/api/services/submissions";
import { toast } from "@workspace/ui/components/sonner";
import { FileText, Download, ExternalLink, PenLine } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Spinner } from "@workspace/ui/components/spinner";

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
    try {
      await gradeMutation.mutateAsync({ id: submission.id, data });
      toast.success("Đã chấm điểm thành công");
      onOpenChange(false);
    } catch (error: any) {
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
      <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col p-0 overflow-hidden text-left">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/5">
          <div className="flex items-center gap-3 mb-1">
            <SheetTitle className="text-2xl font-sans font-bold italic tracking-tight uppercase">
              Chấm <span className="text-primary not-italic">Bài Làm</span>
            </SheetTitle>
            <Badge variant={submission.isLate ? "destructive" : "outline"} className="rounded-md uppercase text-[10px] font-bold py-0.5">
              {submission.isLate ? "Nộp muộn" : "Đúng hạn"}
            </Badge>
          </div>
          <SheetDescription className="text-xs uppercase tracking-widest text-muted-foreground/50 font-semibold">
            Học viên: <span className="text-primary">{(submission as any).user?.displayName || submission.userId}</span> • Mã: <span className="font-mono">{submission.id.slice(0, 8)}</span>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            {/* Submission Content */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <FileText className="size-4" />
                <h3 className="text-sm font-semibold">Nội dung bài nộp</h3>
              </div>

              {submission.textAnswer && (
                <div className="p-5 rounded-xl bg-muted/30 border border-border/50 text-sm leading-relaxed whitespace-pre-wrap font-medium text-foreground/80">
                  {submission.textAnswer}
                </div>
              )}

              {submission.fileUrls.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                  {submission.fileUrls.map((url, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 group hover:border-primary/30 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                          <Download className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold truncate max-w-[200px] text-foreground/90">
                            Tệp đính kèm {i + 1}
                          </span>
                          <span className="text-[10px] uppercase text-muted-foreground tracking-wider">File Upload</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-xs font-bold uppercase text-muted-foreground hover:text-primary hover:bg-primary/5"
                        onClick={() => window.open(url, '_blank')}>
                        Mở <ExternalLink className="ml-2 size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!submission.textAnswer && submission.fileUrls.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border/40 rounded-xl bg-muted/5">
                  <FileText className="size-8 text-muted-foreground/20 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Không có nội dung</p>
                </div>
              )}
            </section>

            {/* Grading Form */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <PenLine className="size-4" />
                <h3 className="text-sm font-semibold">Đánh giá & Chấm điểm</h3>
              </div>

              <form id="grade-form" onSubmit={form.handleSubmit(onGrade)} className="space-y-6 flex flex-col overflow-hidden">
                <FieldGroup>
                  <Controller
                    control={form.control}
                    name="score"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Điểm số</FieldLabel>
                        <div className="relative">
                          <Input
                            type="number"
                            id={field.name}
                            {...field}
                            value={field.value || ''}
                            onChange={e => {
                              const input = e.target.value;
                              field.onChange(input === '' ? 0 : parseFloat(input));
                            }}
                            className="pr-16"
                            placeholder="0"
                            min="0"
                            max={maxScore}
                            step="0.5"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            / {maxScore}
                          </span>
                        </div>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="feedback"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Phản hồi</FieldLabel>
                        <Textarea
                          id={field.name}
                          {...field}
                          className="min-h-[120px]"
                          placeholder="Nhập nhận xét chi tiết..."
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </section>
          </div>
        </ScrollArea>

        <SheetFooter>
          <Button
            type="submit"
            form="grade-form"
            disabled={gradeMutation.isPending || returnMutation.isPending}
          >
            {gradeMutation.isPending && <Spinner className="mr-2" />}
            Hoàn tất chấm điểm
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReturn}
            disabled={returnMutation.isPending || gradeMutation.isPending}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100"
          >
            {returnMutation.isPending && <Spinner className="mr-2" />}
            Trả lại bài
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
