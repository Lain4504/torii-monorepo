'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Save,
  Calendar,
  Trash2,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';
import { toast } from '@workspace/ui/components/sonner';
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field';
import { Label } from "@workspace/ui/components/label";
import {
  useAcademyAssignmentTemplate as useAssignment,
  useAcademyAssignmentSubmission as useMySubmission,
  useCreateAcademyAssignmentSubmission as useSubmitAssignment,
  useUpdateAcademyAssignmentSubmission as useSaveDraft,
  academyAssignmentApi as assignmentApi,
} from '@/lib/api/services/academy-assignment-api';

type SubmitAssignmentDto = any;
import { storageApi } from '@/lib/api/services/storage-api';
import { formatDate, formatDateTime } from '@/utils/format-utils';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@workspace/ui/components/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"

const submitAssignmentSchema = z.object({
  textAnswer: z.string().optional(),
  fileUrls: z.array(z.string()),
});

type FormData = z.infer<typeof submitAssignmentSchema>;

interface AssignmentSubmissionProps {
  assignmentId: string;
}

export function AssignmentSubmission({ assignmentId }: AssignmentSubmissionProps) {
  const { data: assignment, isLoading: loadingAssignment } = useAssignment(assignmentId);
  const { data: submission, isLoading: loadingSubmission } = useMySubmission(assignmentId);
  const submitMutation = useSubmitAssignment();
  const saveDraftMutation = useSaveDraft();

  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(
      submitAssignmentSchema.superRefine((data, ctx) => {
        if (!assignment) return;

        if (assignment.defaultType === 'TEXT' || assignment.defaultType === 'BOTH') {
          if (!data.textAnswer || data.textAnswer.trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Vui lòng nhập câu trả lời',
              path: ['textAnswer'],
            });
          }
        }

        if (assignment.defaultType === 'FILE' || assignment.defaultType === 'BOTH') {
          if (!data.fileUrls || data.fileUrls.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Vui lòng tải lên ít nhất một file',
              path: ['fileUrls'],
            });
          }
        }
      })
    ),
    defaultValues: {
      textAnswer: ((submission?.content as any)?.textAnswer) || '',
      fileUrls: ((((submission?.content as any)?.fileUrls) || []) as any[]).filter((url: any): url is string => !!url),
    },
  });

  const { control, handleSubmit, formState: { errors, isDirty }, setValue, watch, reset } = form;
  const fileUrls = watch('fileUrls');

  // Sync state with submission data when it changes (after refetch)
  useEffect(() => {
    if (submission) {
      reset({
        textAnswer: ((submission?.content as any)?.textAnswer) || '',
        fileUrls: (((submission?.content as any)?.fileUrls) || []).filter(Boolean),
      });
    }
  }, [submission, reset]);

  const loading = loadingAssignment || loadingSubmission;
  const isSubmitted = submission?.status === 'SUBMITTED' || submission?.status === 'GRADED';
  const isGraded = submission?.status === 'GRADED';
  const isDraft = submission?.status === 'DRAFT';
  const isReturned = submission?.status === 'RETURNED';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Không tìm thấy bài tập</p>
      </div>
    );
  }

  const handleSaveDraft = async () => {
    const values = form.getValues();
    const content = {
      textAnswer: values.textAnswer || undefined,
      fileUrls: values.fileUrls.length > 0 ? values.fileUrls : undefined,
    };

    try {
      if (submission?.id) {
        await saveDraftMutation.mutateAsync({ id: submission.id, dto: { content, status: 'DRAFT' } });
      } else {
        await submitMutation.mutateAsync({ 
          assignmentTemplateId: assignmentId, 
          content, 
          status: 'DRAFT',
          userId: 'me' // Backend usually handles 'me' or gets from token
        });
      }
      toast.success('Đã lưu bản nháp');
    } catch (error: any) {
      toast.error(error?.userMessage || 'Lỗi khi lưu bản nháp');
    }
  };

  const onSubmit = async (data: FormData) => {
    const content = {
      textAnswer: data.textAnswer || undefined,
      fileUrls: data.fileUrls.length > 0 ? data.fileUrls : [],
    };

    try {
      if (submission?.id) {
        await saveDraftMutation.mutateAsync({ id: submission.id, dto: { content, status: 'SUBMITTED' } });
      } else {
        await submitMutation.mutateAsync({ 
          assignmentTemplateId: assignmentId, 
          content, 
          status: 'SUBMITTED',
          userId: 'me'
        });
      }
      toast.success('Đã nộp bài thành công!');
    } catch (error: any) {
      toast.error(error?.userMessage || 'Lỗi khi nộp bài');
    }
  };

  const handleDownloadAttachment = async (url: string) => {
    try {
      window.open(url, '_blank');
      toast.success('Đang mở file');
    } catch (error) {
      toast.error('Lỗi khi tải file');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file count
    const MAX_FILES = 5;
    if (fileUrls.length + files.length > MAX_FILES) {
      toast.error(`Chỉ được tải lên tối đa ${MAX_FILES} file`);
      return;
    }

    setUploadingFiles(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size (10MB default)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File ${file.name} vượt quá dung lượng cho phép (10MB)`);
        }

        // Upload file
        const result = await storageApi.uploadFile(file, 'assignments', {
          assignmentId: assignment.id,
        });

        console.log('📁 Upload result:', result);
        return result.fileUrl; // Use fileUrl instead of url
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setValue('fileUrls', [...fileUrls, ...uploadedUrls], { shouldDirty: true });
      toast.success(`Đã tải lên ${uploadedUrls.length} file`);
    } catch (error: any) {
      toast.error(error?.message || 'Lỗi khi tải file');
    } finally {
      setUploadingFiles(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFileUrls = fileUrls.filter((_, i) => i !== index);
    setValue('fileUrls', newFileUrls, { shouldDirty: true });
    toast.success('Đã xóa file');
  };

  const dueDate = null;
  const isOverdue = false;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-6 py-10">
      {/* Header Section */}
      <Card className="overflow-hidden group border-border/50">
        <CardContent className="p-8 sm:p-10 relative">

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center border border-border/40 shadow-xl group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-8 h-8 text-primary group-hover:animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                  {assignment.title}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Assignment</span>
                  <div className="h-1 w-1 rounded-full bg-border" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{assignment.defaultType}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isGraded && (
                <Badge variant="secondary" className="animate-in fade-in zoom-in duration-500">Đã chấm điểm</Badge>
              )}
              {isSubmitted && !isGraded && (
                <Badge variant="outline">Đã nộp</Badge>
              )}
              {isDraft && (
                <Badge variant="outline" className="text-muted-foreground">Bản nháp</Badge>
              )}
              {isReturned && (
                <Badge variant="destructive">Yêu cầu sửa lại</Badge>
              )}
              {dueDate && (
                <Badge variant={isOverdue ? "destructive" : "outline"} className="gap-1">
                  <Calendar className="size-3" />
                  Hạn nộp: {formatDate(dueDate)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {assignment.description && (
        <Card className="relative overflow-hidden group bg-muted/5 border-border/30">
          <CardContent className="p-8 sm:p-10 space-y-6">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <FileText className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h3 className="text-lg font-black italic text-foreground uppercase tracking-tight">
                Hướng dẫn chi tiết
              </h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none relative z-10">
              <div
                dangerouslySetInnerHTML={{ __html: assignment.description }}
                className="text-foreground/80 leading-relaxed font-medium italic"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments (Not supported) */}

      {/* Submission Form */}
      {!isSubmitted && (
        <Card className="bg-muted/5 border-border/10">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-primary/40 rounded-full" />
              <h3 className="text-lg font-sans font-bold italic text-foreground uppercase tracking-tight">
                Nộp bài
              </h3>
            </div>

            {/* Text Answer - Always visible */}
            <Controller
              name="textAnswer"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-3">
                  <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.15em]">
                    Câu trả lời văn bản {(assignment.defaultType === 'TEXT' || assignment.defaultType === 'BOTH') && <span className="text-red-600">*</span>}
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="min-h-[240px] resize-none rounded-2xl border-border/30 bg-background focus:border-primary/40 transition-colors text-sm leading-relaxed"
                    disabled={isSubmitted}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* File Upload - Always visible */}
            <Field className="space-y-3">
              <FieldLabel className="text-[10px] font-black uppercase tracking-[0.15em]">
                Tải lên file đính kèm {(assignment.defaultType === 'FILE' || assignment.defaultType === 'BOTH') && <span className="text-red-600">*</span>}
              </FieldLabel>
              <Input
                type="file"
                id="file-upload"
                multiple={true}
                accept='*'
                onChange={handleFileUpload}
                className="hidden"
                disabled={isSubmitted || uploadingFiles}
              />
              <Label
                htmlFor="file-upload"
                className={cn(
                  "block p-10 cursor-pointer group",
                  (isSubmitted || uploadingFiles) && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center border border-border/30 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      {uploadingFiles ? 'Đang tải lên...' : 'Nhấn để chọn file'}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      'Tất cả định dạng'
                      {` • Tối đa ${10485760 / 1024 / 1024}MB` || ` • Tối đa ${10485760 / 1024 / 1024}MB`}
                    </p>
                  </div>
                </div>
              </Label>

              {/* Uploaded Files List */}
              {fileUrls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">
                    File đã tải lên ({fileUrls.length})
                  </p>
                  {fileUrls.filter(url => url).map((url: any, index: number) => {
                    const filename = url.split('/').pop() || `File ${index + 1}`;
                    return (
                      <Item
                        key={index}
                        variant="outline"
                        className="flex items-center justify-between p-4 rounded-xl bg-background border-border/30 hover:border-primary/30 transition-colors"
                      >
                        <ItemMedia variant="icon" className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                          <FileText className="w-5 h-5 text-primary" />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle className="text-sm font-semibold text-foreground truncate">{filename}</ItemTitle>
                        </ItemContent>
                        {!isSubmitted && (
                          <ItemActions>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="h-9 w-9 p-0 rounded-xl hover:bg-red-500/10 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </ItemActions>
                        )}
                      </Item>
                    );
                  })}
                </div>
              )}
            </Field>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-6">
              <Button
                onClick={handleSubmit(onSubmit)}
                className="px-8 font-bold"
                disabled={submitMutation.isPending}
              >
                <Send className="w-4 h-4 mr-3" />
                Nộp bài tập ngay
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="px-8 font-bold"
                disabled={saveDraftMutation.isPending}
              >
                <Save className="w-4 h-4 mr-3" />
                Lưu bản nháp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback & Score */}
      {isGraded && submission && (
        <Card className="relative overflow-hidden group bg-gradient-to-br from-green-500/5 via-green-500/0 to-background border-green-500/20">
          <CardContent className="p-8 sm:p-10 relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <CheckCircle2 className="w-32 h-32 text-green-500" />
            </div>

            <div className="relative space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                  <h3 className="text-lg font-black italic text-foreground uppercase tracking-tight">
                    Kết quả chấm điểm
                  </h3>
                </div>

                {(assignment as any).passingScore && (
                  <div className={cn(
                    "flex items-center gap-2 px-5 py-2 rounded-full border shadow-sm",
                    submission.score! >= (assignment as any).passingScore
                      ? "bg-green-500/10 border-green-500/20 text-green-600"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                  )}>
                    {submission.score! >= (assignment as any).passingScore ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                      {submission.score! >= (assignment as any).passingScore ? 'Đạt yêu cầu' : 'Chưa đạt yêu cầu'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-8 py-4 border-y border-border/10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Điểm số</p>
                  <div className="flex items-end gap-1">
                    <span className="text-6xl font-black text-primary leading-none tracking-tighter">
                      {submission.score}
                    </span>
                    <span className="text-xl font-bold text-muted-foreground/40 mb-1">/{(assignment as any).defaultMaxScore}</span>
                  </div>
                </div>

                <div className="h-12 w-px bg-border/20" />

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Trạng thái</p>
                  <p className="text-xl font-black text-foreground italic uppercase tracking-tight leading-none">
                    {submission.score! >= ((assignment as any).passingScore || 0) ? 'Xuất sắc' : 'Cần cố gắng'}
                  </p>
                </div>
              </div>

              {((submission as any).feedback) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-3 bg-green-500/40 rounded-full" />
                    <p className="text-[10px] font-black text-foreground uppercase tracking-[0.15em]">Nhận xét của giáo viên</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-background border border-border/30 shadow-sm">
                    <p className="text-sm text-foreground leading-relaxed font-medium italic">"{((submission as any).feedback)}"</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted Content (Read-only) */}
      {(isSubmitted || isGraded) && submission && (
        <Card className="relative overflow-hidden group bg-muted/5 border-border/30">
          <CardContent className="p-8 sm:p-10 space-y-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <Send className="w-32 h-32" />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-lg font-black italic text-foreground uppercase tracking-tight">
                  Nội dung bài làm
                </h3>
              </div>

              {submission.submittedAt && (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-background border border-border/40 shadow-sm">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                    {formatDateTime(submission.submittedAt)}
                  </span>
                  {((submission as any).isLate) && (
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-tight ml-2">
                      • TRỄ {((submission as any).daysLate)} NGÀY
                    </span>
                  )}
                </div>
              )}
            </div>

            {((submission?.content as any)?.textAnswer) && (
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-3 bg-blue-500/40 rounded-full" />
                  <p className="text-[10px] font-black text-foreground uppercase tracking-[0.15em]">Câu trả lời của bạn</p>
                </div>
                <div className="p-8 rounded-3xl bg-background border border-border/30 shadow-sm">
                  <p className="text-sm text-foreground leading-relaxed font-medium italic whitespace-pre-wrap">{((submission?.content as any)?.textAnswer)}</p>
                </div>
              </div>
            )}

            {((submission?.content as any)?.fileUrls) && ((submission?.content as any)?.fileUrls).length > 0 && (
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-3 bg-blue-500/40 rounded-full" />
                  <p className="text-[10px] font-black text-foreground uppercase tracking-[0.15em]">File đính kèm</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {((submission?.content as any)?.fileUrls).map((url: any, index: number) => {
                    const filename = url.split('/').pop() || `File ${index + 1}`;
                    return (
                      <Item
                        key={index}
                        variant="outline"
                        className="flex items-center gap-3 p-4 rounded-2xl bg-background border border-border/30"
                      >
                        <ItemMedia variant="icon" className="size-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                          <FileText className="size-5 text-primary" />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle className="text-sm font-bold text-foreground truncate">{filename}</ItemTitle>
                        </ItemContent>
                      </Item>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
