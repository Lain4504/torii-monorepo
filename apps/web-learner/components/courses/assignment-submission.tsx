'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Save,
  Calendar,
  Trash2,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';
import { toast } from '@workspace/ui/components/sonner';
import {
  useAssignment,
  useMySubmission,
  useSubmitAssignment,
  useSaveDraft,
  assignmentApi,
  type SubmitAssignmentDto,
} from '@/apis/services/assignment-api';
import { storageApi } from '@/apis/services/storage-api';

interface AssignmentSubmissionProps {
  assignmentId: string;
}

export function AssignmentSubmission({ assignmentId }: AssignmentSubmissionProps) {
  const { data: assignment, isLoading: loadingAssignment } = useAssignment(assignmentId);
  const { data: submission, isLoading: loadingSubmission } = useMySubmission(assignmentId);
  const submitMutation = useSubmitAssignment();
  const saveDraftMutation = useSaveDraft();

  const [textAnswer, setTextAnswer] = useState(submission?.textAnswer || '');
  const [fileUrls, setFileUrls] = useState<string[]>((submission?.fileUrls || []).filter(Boolean));
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);

  // Sync state with submission data when it changes (after refetch)
  useEffect(() => {
    if (submission) {
      setTextAnswer(submission.textAnswer || '');
      setFileUrls((submission.fileUrls || []).filter(Boolean));
    }
  }, [submission]);

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
    const dto: SubmitAssignmentDto = {
      textAnswer: textAnswer || undefined,
      fileUrls: fileUrls.length > 0 ? fileUrls : undefined,
    };

    try {
      await saveDraftMutation.mutateAsync({ assignmentId, dto });
      toast.success('Đã lưu bản nháp');
    } catch (error: any) {
      toast.error(error?.userMessage || 'Lỗi khi lưu bản nháp');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (assignment.type === 'TEXT' || assignment.type === 'BOTH') {
      if (!textAnswer || textAnswer.trim() === '') {
        toast.error('Vui lòng nhập câu trả lời');
        return;
      }
    }

    if (assignment.type === 'FILE' || assignment.type === 'BOTH') {
      if (fileUrls.length === 0) {
        toast.error('Vui lòng tải lên ít nhất một file');
        return;
      }
    }

    const dto: SubmitAssignmentDto = {
      textAnswer: textAnswer || undefined,
      fileUrls: fileUrls.length > 0 ? fileUrls : [],
    };

    console.log('📤 Submitting DTO:', dto);

    try {
      await submitMutation.mutateAsync({ assignmentId, dto });
      toast.success('Đã nộp bài thành công!');
    } catch (error: any) {
      toast.error(error?.userMessage || 'Lỗi khi nộp bài');
    }
  };

  const handleDownloadAttachment = async (url: string) => {
    const filename = url.split('/').pop() || 'attachment';
    try {
      await assignmentApi.downloadAttachment(url, filename);
      toast.success('Đã tải xuống file');
    } catch (error) {
      toast.error('Lỗi khi tải file');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file count
    if (assignment.maxFiles && fileUrls.length + files.length > assignment.maxFiles) {
      toast.error(`Chỉ được tải lên tối đa ${assignment.maxFiles} file`);
      return;
    }

    setUploadingFiles(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size
        if (assignment.maxFileSize && file.size > assignment.maxFileSize) {
          throw new Error(`File ${file.name} vượt quá dung lượng cho phép`);
        }

        // Upload file
        const result = await storageApi.uploadFile(file, 'assignments', {
          assignmentId: assignment.id,
        });

        console.log('📁 Upload result:', result);
        return result.fileUrl; // Use fileUrl instead of url
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFileUrls([...fileUrls, ...uploadedUrls]);
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
    setFileUrls(newFileUrls);
    toast.success('Đã xóa file');
  };

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const isOverdue = dueDate && new Date() > dueDate;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Bài tập</span>
            <h1 className="text-3xl font-sans font-bold italic text-foreground tracking-tight uppercase">
              {assignment.title}
            </h1>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {isGraded && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-green-500 uppercase tracking-wide">Đã chấm điểm</span>
            </div>
          )}
          {isSubmitted && !isGraded && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Đã nộp</span>
            </div>
          )}
          {isDraft && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-wide">Bản nháp</span>
            </div>
          )}
          {isReturned && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">Yêu cầu sửa lại</span>
            </div>
          )}
          {dueDate && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border",
              isOverdue 
                ? "bg-red-500/10 border-red-500/20" 
                : "bg-muted/10 border-border/20"
            )}>
              <Calendar className={cn("w-4 h-4", isOverdue ? "text-red-500" : "text-muted-foreground")} />
              <span className={cn(
                "text-xs font-bold uppercase tracking-wide",
                isOverdue ? "text-red-500" : "text-muted-foreground"
              )}>
                Hạn nộp: {dueDate.toLocaleDateString('vi-VN')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {assignment.instructions && (
        <div className="p-8 rounded-2xl border border-border/10 bg-muted/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary/40 rounded-full" />
            <h3 className="text-lg font-sans font-bold italic text-foreground uppercase tracking-tight">
              Hướng dẫn
            </h3>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: assignment.instructions }} className="text-foreground/80 leading-relaxed" />
          </div>
        </div>
      )}

      {/* Attachments */}
      {assignment.attachmentUrls && assignment.attachmentUrls.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary/40 rounded-full" />
            <h3 className="text-lg font-sans font-bold italic text-foreground uppercase tracking-tight">
              Tài liệu đính kèm
            </h3>
          </div>
          <div className="grid gap-4">
            {assignment.attachmentUrls.filter(url => url).map((url, index) => {
              const filename = url?.split('/').pop() || `File ${index + 1}`;
              return (
                <div
                  key={index}
                  className="group flex items-center justify-between p-6 rounded-2xl border border-border/20 bg-muted/5 hover:bg-background hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleDownloadAttachment(url)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{filename}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Nhấn để tải xuống</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-primary" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submission Form */}
      {!isSubmitted && (
        <div className="space-y-6 p-8 rounded-2xl border border-border/10 bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary/40 rounded-full" />
            <h3 className="text-lg font-sans font-bold italic text-foreground uppercase tracking-tight">
              Nộp bài
            </h3>
          </div>

          {/* Text Answer */}
          {(assignment.type === 'TEXT' || assignment.type === 'BOTH') && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground uppercase tracking-wide">
                Câu trả lời <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                className="min-h-[200px] resize-none rounded-xl border-border/20 bg-background"
                disabled={isSubmitted}
              />
            </div>
          )}

          {/* File Upload */}
          {(assignment.type === 'FILE' || assignment.type === 'BOTH') && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground uppercase tracking-wide">
                Tải lên file <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="file-upload"
                multiple={assignment.maxFiles ? assignment.maxFiles > 1 : true}
                accept={assignment.allowedFileTypes?.join(',')}
                onChange={handleFileUpload}
                className="hidden"
                disabled={isSubmitted || uploadingFiles}
              />
              <label
                htmlFor="file-upload"
                className={cn(
                  "block p-8 rounded-xl border-2 border-dashed border-border/40 bg-background hover:border-primary/40 transition-colors cursor-pointer",
                  (isSubmitted || uploadingFiles) && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {uploadingFiles ? 'Đang tải lên...' : 'Nhấn để tải lên file'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {assignment.allowedFileTypes?.join(', ') || 'Tất cả định dạng'}
                      {assignment.maxFileSize && ` • Tối đa ${assignment.maxFileSize / 1024 / 1024}MB`}
                    </p>
                  </div>
                </div>
              </label>

              {/* Uploaded Files List */}
              {fileUrls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    File đã tải lên ({fileUrls.length})
                  </p>
                  {fileUrls.filter(url => url).map((url, index) => {
                    const filename = url.split('/').pop() || `File ${index + 1}`;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-muted/5"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">{filename}</span>
                        </div>
                        {!isSubmitted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              onClick={handleSubmit}
              className="h-12 px-8 rounded-xl font-bold uppercase tracking-wide bg-primary text-white hover:opacity-90"
              disabled={submitMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Nộp bài
            </Button>
          </div>
        </div>
      )}

      {/* Feedback & Score */}
      {isGraded && submission && (
        <div className="space-y-6 p-8 rounded-2xl border border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-green-500/40 rounded-full" />
            <h3 className="text-lg font-sans font-bold italic text-foreground uppercase tracking-tight">
              Kết quả chấm điểm
            </h3>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Điểm số</p>
              <p className="text-4xl font-black text-primary">
                {submission.score}/{assignment.maxScore}
              </p>
            </div>
            {assignment.passingScore && (
              <div className="flex items-center gap-2">
                {submission.score! >= assignment.passingScore ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <span className="text-sm font-bold">
                  {submission.score! >= assignment.passingScore ? 'Đạt' : 'Chưa đạt'}
                </span>
              </div>
            )}
          </div>

          {submission.feedback && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-foreground uppercase tracking-wide">Nhận xét</p>
              <div className="p-4 rounded-xl bg-background border border-border/20">
                <p className="text-sm text-foreground/80 leading-relaxed">{submission.feedback}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submitted Content (Read-only) */}
      {isSubmitted && submission && (
        <div className="space-y-6 p-8 rounded-2xl border border-border/10 bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-blue-500/40 rounded-full" />
            <h3 className="text-lg font-sans font-bold italic text-foreground uppercase tracking-tight">
              Bài làm đã nộp
            </h3>
          </div>

          {submission.textAnswer && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-foreground uppercase tracking-wide">Câu trả lời</p>
              <div className="p-4 rounded-xl bg-background border border-border/20">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{submission.textAnswer}</p>
              </div>
            </div>
          )}

          {submission.submittedAt && (
            <p className="text-xs text-muted-foreground">
              Nộp lúc: {new Date(submission.submittedAt).toLocaleString('vi-VN')}
              {submission.isLate && <span className="text-red-500 ml-2">(Nộp trễ {submission.daysLate} ngày)</span>}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
